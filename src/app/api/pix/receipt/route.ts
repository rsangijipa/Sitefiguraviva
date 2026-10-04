import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { MAX_PIX_RECEIPT_BYTES, pixReceiptType } from "@/lib/pix-receipt";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";
export async function POST(req: NextRequest) {
  const claims = await getBearerSupabaseSessionClaims(req);
  if (!claims?.isActive)
    return NextResponse.json(
      { error: "Faça login novamente." },
      { status: 401 },
    );
  try {
    const limit = await rateLimit(
      claims.uid,
      "pix_receipt",
      RateLimitPresets.APPLICATION_SUBMIT,
    );
    if (!limit.allowed)
      return NextResponse.json(
        { error: "Aguarde antes de enviar outro comprovante." },
        { status: 429 },
      );
  } catch {
    return NextResponse.json(
      {
        error:
          "Envio temporariamente indisponível. Tente novamente em alguns instantes.",
      },
      {
        status: 503,
        headers: { "Retry-After": "30", "Cache-Control": "no-store" },
      },
    );
  }
  if (!req.headers.get("content-type")?.startsWith("multipart/form-data"))
    return NextResponse.json({ error: "Formato inválido." }, { status: 415 });
  const reader = req.body?.getReader();
  if (!reader)
    return NextResponse.json(
      { error: "Comprovante obrigatório." },
      { status: 400 },
    );
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_PIX_RECEIPT_BYTES + 16384) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Comprovante excede 5 MB." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": req.headers.get("content-type")! },
    }).formData();
    const orderId = form.get("orderId");
    const file = form.get("receipt");
    if (
      typeof orderId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(orderId) ||
      !file ||
      typeof file === "string" ||
      file.size === 0
    )
      return NextResponse.json(
        { error: "Pedido e comprovante obrigatórios." },
        { status: 400 },
      );
    if (file.size > MAX_PIX_RECEIPT_BYTES)
      return NextResponse.json(
        { error: "Comprovante excede 5 MB." },
        { status: 413 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const type = pixReceiptType(bytes);
    if (!type || file.type !== type.contentType)
      return NextResponse.json(
        { error: "Envie um PDF, JPG ou PNG válido." },
        { status: 400 },
      );
    const db = createSupabaseServiceClient();
    const { data: order, error: readError } = await db
      .from("pix_orders")
      .select("id,status,course_id")
      .eq("id", orderId)
      .eq("user_id", claims.uid)
      .maybeSingle();
    if (readError) throw readError;
    if (!order)
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    if (order.status !== "pending")
      return NextResponse.json(
        { error: "Este pedido já foi analisado." },
        { status: 409 },
      );
    const objectPath =
      claims.uid + "/" + orderId + "/" + randomUUID() + "." + type.extension;
    const { error: uploadError } = await db.storage
      .from("pix-receipts")
      .upload(objectPath, bytes, {
        contentType: type.contentType,
        upsert: false,
      });
    if (uploadError) throw uploadError;
    const { error } = await db.rpc("submit_manual_pix_receipt", {
      p_user: claims.uid,
      p_order: orderId,
      p_path: objectPath,
    });
    if (error) {
      await db.storage.from("pix-receipts").remove([objectPath]);
      throw error;
    }
    revalidatePath("/inscricao/" + order.course_id);
    revalidatePath("/admin/approvals");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível enviar o comprovante. Tente novamente." },
      { status: 400 },
    );
  }
}

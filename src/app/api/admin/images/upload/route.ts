import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { rateLimit, RateLimitUnavailableError } from "@/lib/rateLimit";
import {
  compressImage,
  ImageCompressionError,
  MAX_IMAGE_UPLOAD_BYTES,
} from "@/lib/image-compression.server";

export const runtime = "nodejs";
const buckets = new Set([
  "course-assets",
  "public-avatars",
  "public-book-covers",
]);
const headers = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  const claims = await getBearerSupabaseSessionClaims(req);
  if (!claims?.isActive)
    return NextResponse.json(
      { error: "Faça login novamente." },
      { status: 401, headers },
    );
  if (!claims.admin)
    return NextResponse.json(
      { error: "Acesso administrativo necessário." },
      { status: 403, headers },
    );
  try {
    const limit = await rateLimit(claims.uid, "admin_image_upload", {
      maxRequests: 30,
      windowMs: 60_000,
    });
    if (!limit.allowed)
      return NextResponse.json(
        { error: "Aguarde antes de enviar outra imagem." },
        { status: 429, headers },
      );
    const contentType = req.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data"))
      return NextResponse.json(
        { error: "Formato de envio inválido." },
        { status: 415, headers },
      );

    // Bound the actual streamed body before parsing multipart or decoding pixels.
    const reader = req.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "Imagem obrigatória." },
        { status: 400, headers },
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_UPLOAD_BYTES + 16384) {
        await reader.cancel();
        return NextResponse.json(
          { error: "A imagem deve ter no máximo 5 MB." },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    let form: FormData;
    try {
      form = await new Response(Buffer.concat(chunks), {
        headers: { "content-type": contentType },
      }).formData();
    } catch {
      return NextResponse.json(
        { error: "Formato de envio inválido." },
        { status: 400, headers },
      );
    }
    const file = form.get("file");
    const bucket = form.get("bucket") ?? "course-assets";
    const folder = form.get("folder") ?? "uploads/admin";
    if (!(file instanceof File) || !file.size)
      return NextResponse.json(
        { error: "Imagem obrigatória." },
        { status: 400, headers },
      );
    if (file.size > MAX_IMAGE_UPLOAD_BYTES)
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 5 MB." },
        { status: 413, headers },
      );
    if (
      typeof bucket !== "string" ||
      !buckets.has(bucket) ||
      typeof folder !== "string" ||
      folder.length > 200 ||
      !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(folder) ||
      /^courses\/[^/]+\/materials(?:\/|$)/.test(folder)
    )
      return NextResponse.json(
        { error: "Destino de upload inválido." },
        { status: 400, headers },
      );

    const image = await compressImage(
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    const baseName =
      file.name
        .replace(/\.[^.]*$/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9_-]/g, "_")
        .slice(0, 80) || "imagem";
    const path = `${folder}/${randomUUID()}-${baseName}.${image.extension}`;
    const storage = createSupabaseServiceClient().storage.from(bucket);
    const { error } = await storage.upload(path, image.body, {
      contentType: image.contentType,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return NextResponse.json(
      {
        url: storage.getPublicUrl(path).data.publicUrl,
        path,
        name: `${baseName}.${image.extension}`,
        size: `${parseFloat((image.bytes / 1024).toFixed(2))} KB`,
        originalBytes: image.originalBytes,
        bytes: image.bytes,
        width: image.width,
        height: image.height,
      },
      { status: 201, headers },
    );
  } catch (error) {
    if (error instanceof ImageCompressionError)
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers },
      );
    if (error instanceof RateLimitUnavailableError)
      return NextResponse.json(
        { error: "Envio temporariamente indisponível." },
        { status: 503, headers: { ...headers, "Retry-After": "30" } },
      );
    console.error("Image upload failed", error);
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem." },
      { status: 500, headers },
    );
  }
}

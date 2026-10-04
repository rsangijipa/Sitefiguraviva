import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  COURSE_MATERIAL_BUCKET,
  MAX_COURSE_MATERIAL_BYTES,
} from "@/lib/course-materials";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
export async function POST(req: NextRequest) {
  const claims = await getBearerSupabaseSessionClaims(req);
  if (!claims?.isActive)
    return NextResponse.json(
      { error: "Faça login novamente." },
      { status: 401 },
    );
  if (!claims.admin)
    return NextResponse.json(
      { error: "Acesso administrativo necessário." },
      { status: 403 },
    );
  try {
    const limit = await rateLimit(
      claims.uid,
      "COURSE_MATERIAL_UPLOAD",
      RateLimitPresets.CREATE_EVENT,
    );
    if (!limit.allowed)
      return NextResponse.json(
        { error: "Aguarde antes de enviar outro material." },
        { status: 429 },
      );
    const contentType = req.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data"))
      return NextResponse.json({ error: "Formato inválido." }, { status: 415 });
    const reader = req.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "Arquivo obrigatório." },
        { status: 400 },
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_COURSE_MATERIAL_BYTES + 16384) {
        await reader.cancel();
        return NextResponse.json(
          { error: "O PDF deve ter no máximo 10 MB." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": contentType },
    }).formData();
    const courseId = form.get("courseId"),
      file = form.get("file");
    if (
      typeof courseId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(courseId) ||
      !file ||
      typeof file === "string" ||
      file.size === 0
    )
      return NextResponse.json(
        { error: "Curso e PDF obrigatórios." },
        { status: 400 },
      );
    if (file.size > MAX_COURSE_MATERIAL_BYTES)
      return NextResponse.json(
        { error: "O PDF deve ter no máximo 10 MB." },
        { status: 413 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    if (
      file.type !== "application/pdf" ||
      bytes.subarray(0, 5).toString("ascii") !== "%PDF-"
    )
      return NextResponse.json(
        { error: "Envie um PDF válido." },
        { status: 400 },
      );
    const db = createSupabaseServiceClient();
    const { data: course, error } = await db
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();
    if (error) throw error;
    if (!course)
      return NextResponse.json(
        { error: "Curso não encontrado." },
        { status: 404 },
      );
    const path = `courses/${courseId}/materials/${randomUUID()}.pdf`;
    const { error: uploadError } = await db.storage
      .from(COURSE_MATERIAL_BUCKET)
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
        cacheControl: "0",
      });
    if (uploadError) throw uploadError;
    return NextResponse.json(
      {
        url: "",
        path,
        bucket: COURSE_MATERIAL_BUCKET,
        name: file.name.slice(0, 200),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "RateLimitUnavailableError")
      return NextResponse.json(
        {
          error:
            "Serviço temporariamente indisponível. Tente novamente em alguns instantes.",
        },
        {
          status: 503,
          headers: { "Retry-After": "30", "Cache-Control": "no-store" },
        },
      );
    return NextResponse.json(
      { error: "Não foi possível enviar o material." },
      { status: 400 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import {
  rateLimit,
  RateLimitPresets,
  getClientIdentifier,
} from "@/lib/rateLimit";

// Answers/consent were previously accepted as unvalidated free-form objects
// with no size limit and no rate limit (P1-03 in
// docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md) — a single authenticated
// user could hammer this endpoint or store arbitrarily large payloads.
const applicationSchema = z.object({
  courseId: z.string().trim().min(1).max(200),
  answers: z.object({
    fullName: z.string().trim().min(3).max(200),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((v) => /^\d{10,15}$/.test(v.replace(/\D/g, ""))),
    profession: z.string().trim().min(2).max(200),
  }),
  consent: z.object({ lgpd: z.literal(true) }),
});

export async function POST(req: NextRequest) {
  try {
    const claims = await getBearerSupabaseSessionClaims(req);
    if (!claims || !claims.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = claims.uid;

    const rl = await rateLimit(
      uid,
      "application_submit",
      RateLimitPresets.APPLICATION_SUBMIT,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    const rawBody = await req.text();
    if (rawBody.length > 50_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    const parsed = applicationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application payload" },
        { status: 400 },
      );
    }

    const { courseId, answers } = parsed.data;
    const { data, error } = await createSupabaseServiceClient().rpc(
      "submit_course_application",
      { p_user: uid, p_course: courseId, p_answers: answers },
    );
    if (error) {
      if (error.code === "P0001")
        return NextResponse.json(
          { error: "Curso indisponível ou ficha inválida." },
          { status: 400 },
        );
      throw error;
    }
    return NextResponse.json({
      success: true,
      ...(data as Record<string, unknown>),
    });
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
    console.error("Application submit error:", error);
    return NextResponse.json(
      { error: "Unable to submit application" },
      { status: 500 },
    );
  }
}

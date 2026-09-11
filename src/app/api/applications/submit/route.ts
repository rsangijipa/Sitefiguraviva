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
  answers: z
    .record(z.string().max(200), z.string().max(5000))
    .refine((obj) => Object.keys(obj).length <= 50, {
      message: "Too many answer fields",
    })
    .optional()
    .default({}),
  consent: z
    .object({
      lgpd: z.boolean().optional(),
      acceptedAt: z.string().datetime().optional(),
      termsVersion: z.string().trim().min(1).max(100).optional(),
    })
    .refine((value) => value.lgpd === true, {
      message: "LGPD consent is required",
    })
    .refine((value) => Boolean(value.acceptedAt && value.termsVersion), {
      message: "Terms version and acceptance timestamp are required",
    })
    .optional()
    .default({}),
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

    const json = JSON.parse(rawBody || "{}");
    const parsed = applicationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application payload" },
        { status: 400 },
      );
    }

    const { courseId, answers, consent } = parsed.data;
    const supabase = createSupabaseServiceClient();
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, status, is_published")
      .eq("id", courseId)
      .maybeSingle();
    if (courseError) throw courseError;
    if (!course || course.status !== "open" || course.is_published !== true) {
      return NextResponse.json(
        { error: "Course is not accepting applications" },
        { status: 409 },
      );
    }
    const applicationId = `${uid}_${courseId}`;
    const { data: existing, error: existingError } = await supabase
      .from("applications")
      .select("status")
      .eq("id", applicationId)
      .maybeSingle();
    if (existingError) throw existingError;
    const protectedStatuses = new Set(["contacted", "enrolled", "approved"]);
    const nextStatus =
      existing?.status && protectedStatuses.has(existing.status)
        ? existing.status
        : "submitted";
    const { error } = await supabase.from("applications").upsert(
      {
        id: applicationId,
        user_id: uid,
        course_id: courseId,
        answers,
        consent,
        status: nextStatus,
        source: "internal",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) throw error;

    return NextResponse.json({ success: true, applicationId });
  } catch (error: any) {
    console.error("Application submit error:", error);
    return NextResponse.json(
      { error: "Unable to submit application" },
      { status: 500 },
    );
  }
}

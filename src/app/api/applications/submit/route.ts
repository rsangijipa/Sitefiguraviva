import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { FieldValue } from "firebase-admin/firestore";
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
    .record(z.string().max(200), z.boolean())
    .refine((obj) => Object.keys(obj).length <= 20, {
      message: "Too many consent fields",
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
    const applicationId = `${uid}_${courseId}`;
    const applicationRef = adminDb
      .collection("applications")
      .doc(applicationId);

    await applicationRef.set(
      {
        uid,
        courseId,
        answers,
        consent,
        status: "submitted",
        source: "internal",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, applicationId });
  } catch (error: any) {
    console.error("Application submit error:", error);
    return NextResponse.json(
      { error: "Unable to submit application" },
      { status: 500 },
    );
  }
}

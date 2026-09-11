"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { EnrollmentDoc, EnrollmentStatus } from "@/types/lms";
import { logAudit } from "@/lib/audit";

export interface StripeActivationPayload {
  uid: string;
  courseId: string;
  sessionId: string;
  isSubscription: boolean;
  accessUntil?: Date;
  paymentStatus?: "paid" | "pending";
}

/**
 * Unified logic to mirror enrollments to both collections bidirectionally.
 * Used by Stripe Webhook, Admin PIX actions, etc.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function writeEnrollmentMirror({
  uid,
  courseId,
  enrollmentDoc,
}: {
  uid: string;
  courseId: string;
  enrollmentDoc: Partial<EnrollmentDoc>;
}) {
  const supabase = createSupabaseServiceClient();
  // `enrollments.id`/`user_id` are Postgres `uuid` columns tied to
  // `profiles(id)` (Supabase Auth). `uid` here may instead be a legacy
  // Firebase UID (not a valid UUID) for accounts not yet migrated — those
  // must go into `legacy_firebase_uid` instead, or the upsert throws
  // "invalid input syntax for type uuid" and silently no-ops wherever this
  // is wrapped in try/catch. Never invent a client-side `id`: let Postgres
  // generate it and upsert against whichever partial unique index matches.
  const isSupabaseUid = UUID_RE.test(uid);
  const dataToSet: any = {
    user_id: isSupabaseUid ? uid : null,
    legacy_firebase_uid: isSupabaseUid ? null : uid,
    course_id: courseId,
    status: enrollmentDoc.status,
    payment_status:
      (enrollmentDoc as any).payment_status ?? enrollmentDoc.paymentStatus,
    payment_method:
      (enrollmentDoc as any).payment_method ?? enrollmentDoc.paymentMethod,
    source_ref: (enrollmentDoc as any).source_ref ?? enrollmentDoc.sourceRef,
    access_until:
      (enrollmentDoc as any).access_until ??
      (enrollmentDoc.accessUntil instanceof Date
        ? enrollmentDoc.accessUntil.toISOString()
        : enrollmentDoc.accessUntil),
    progress_summary:
      (enrollmentDoc as any).progress_summary ?? enrollmentDoc.progressSummary,
    course_version_at_enrollment:
      (enrollmentDoc as any).course_version_at_enrollment ??
      enrollmentDoc.courseVersionAtEnrollment,
    paid_at:
      (enrollmentDoc as any).paid_at ??
      (enrollmentDoc.paidAt instanceof Date
        ? enrollmentDoc.paidAt.toISOString()
        : enrollmentDoc.paidAt),
    approved_by: (enrollmentDoc as any).approved_by ?? enrollmentDoc.approvedBy,
    approved_at:
      (enrollmentDoc as any).approved_at ??
      (enrollmentDoc.approvedAt instanceof Date
        ? enrollmentDoc.approvedAt.toISOString()
        : enrollmentDoc.approvedAt),
    rejection_reason:
      (enrollmentDoc as any).rejection_reason ?? enrollmentDoc.rejectionReason,
  };
  const { error } = await supabase.from("enrollments").upsert(dataToSet, {
    onConflict: isSupabaseUid
      ? "user_id,course_id"
      : "legacy_firebase_uid,course_id",
  });
  if (error) throw error;
}

/**
 * Unified logic to activate or update an enrollment from Stripe events.
 * Handles both one-time purchases and recurring subscriptions.
 */
export async function activateEnrollmentFromStripe(
  payload: StripeActivationPayload,
) {
  const {
    uid,
    courseId,
    sessionId,
    isSubscription,
    accessUntil,
    paymentStatus = "paid",
  } = payload;
  const enrollmentId = `${uid}_${courseId}`;
  const supabase = createSupabaseServiceClient();
  const { data: courseData } = await supabase
    .from("courses")
    .select("content_revision,legacy_payload")
    .eq("id", courseId)
    .maybeSingle();
  const contentRevision = courseData?.content_revision || 1;
  const totalLessons =
    (courseData?.legacy_payload as any)?.stats?.lessonsCount || 0;
  // `enrollments.id` is a DB-generated uuid, not `${uid}_${courseId}` — look
  // the row up by (user_id, course_id) or (legacy_firebase_uid, course_id)
  // instead, matching the identity column writeEnrollmentMirror actually
  // uses for this uid.
  const isSupabaseUid = UUID_RE.test(uid);
  const existingQuery = supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId);
  const { data: existingRow } = await (
    isSupabaseUid
      ? existingQuery.eq("user_id", uid)
      : existingQuery.eq("legacy_firebase_uid", uid)
  ).maybeSingle();
  const existing = existingRow as any;

  // Idempotency: If sourceRef is the same and already active, skip
  if (
    (existing?.source_ref ?? existing?.sourceRef) === sessionId &&
    existing?.status === "active"
  ) {
    return;
  }

  const updateData: any = {
    user_id: uid,
    course_id: courseId,
    status: "active",
    payment_method: isSubscription ? "subscription" : "stripe",
    source_ref: sessionId,
    paid_at: new Date().toISOString(),
  };

  if (isSubscription && accessUntil) {
    updateData.access_until = accessUntil.toISOString();
  }

  // Initialize progress if new or missing. `existing` is a raw Supabase row
  // (snake_case columns) — reading `.progressSummary` here always returned
  // undefined and reset progress to zero on every re-activation (e.g. a
  // Stripe subscription renewal for an already-enrolled student).
  if (!existing || !existing.progress_summary) {
    updateData.progress_summary = {
      completedLessonsCount: 0,
      totalLessons: totalLessons,
      percent: 0,
    };
    updateData.course_version_at_enrollment = contentRevision;
  }

  await writeEnrollmentMirror({ uid, courseId, enrollmentDoc: updateData });

  await logAudit({
    actor: { uid: "system", role: "webhook" },
    action: isSubscription
      ? "SUBSCRIPTION_ACTIVATED"
      : "STRIPE_PAYMENT_CONFIRMED",
    target: {
      collection: "enrollments",
      id: enrollmentId,
      summary: `Stripe activation for ${uid}`,
    },
    metadata: { sessionId, isSubscription, courseId },
  });
}

/**
 * Marks a subscription enrollment as expired.
 */
export async function expireSubscriptionEnrollment(
  uid: string,
  courseId: string,
) {
  const enrollmentId = `${uid}_${courseId}`;

  await writeEnrollmentMirror({
    uid,
    courseId,
    enrollmentDoc: { status: "canceled" },
  });

  await logAudit({
    actor: { uid: "system", role: "cron" },
    action: "SUBSCRIPTION_EXPIRED",
    target: {
      collection: "enrollments",
      id: enrollmentId,
      summary: `Subscription expired for ${uid}`,
    },
    metadata: { courseId },
  });
}

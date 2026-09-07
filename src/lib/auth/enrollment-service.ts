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
export async function writeEnrollmentMirror({
  uid,
  courseId,
  enrollmentDoc,
}: {
  uid: string;
  courseId: string;
  enrollmentDoc: Partial<EnrollmentDoc>;
}) {
  const enrollmentId = `${uid}_${courseId}`;
  const supabase = createSupabaseServiceClient();
  const dataToSet: any = {
    id: enrollmentId,
    user_id: uid,
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
  };
  const { error } = await supabase
    .from("enrollments")
    .upsert(dataToSet, { onConflict: "id" });
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
  const { data: existingRow } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .maybeSingle();
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

  // Initialize progress if new or missing
  if (!existing || !existing.progressSummary) {
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

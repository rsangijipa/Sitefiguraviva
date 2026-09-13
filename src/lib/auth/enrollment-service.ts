"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type {
  EnrollmentStatus,
  Json,
} from "@/infrastructure/supabase/database.types";
import { logAudit } from "@/lib/audit";

export interface StripeActivationPayload {
  uid: string;
  courseId: string;
  sessionId: string;
  isSubscription: boolean;
  accessUntil?: Date;
  paymentStatus?: "paid" | "pending";
}

type DateValue = Date | string | null | undefined;

export type EnrollmentWriteInput = {
  status?: EnrollmentStatus;
  userName?: string;
  paymentStatus?: "paid" | "pending" | "failed";
  paymentMethod?: "pix" | "stripe" | "subscription" | "free" | "manual";
  subscriptionId?: string;
  sourceRef?: string;
  accessUntil?: DateValue;
  enrolledAt?: DateValue;
  paidAt?: DateValue;
  approvedBy?: string;
  approvedAt?: DateValue;
  rejectionReason?: string;
  courseVersionAtEnrollment?: number;
  courseSnapshotAtEnrollment?: Json;
  completedAt?: DateValue;
  lastAccessedAt?: DateValue;
  progressSummary?: Json;
  [key: string]: unknown;
};

function toIsoDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value as null | undefined;
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : undefined;
}

export async function writeEnrollmentMirror({
  uid,
  courseId,
  enrollmentDoc,
}: {
  uid: string;
  courseId: string;
  enrollmentDoc: EnrollmentWriteInput;
}) {
  const supabase = createSupabaseServiceClient();
  const dataToSet = {
    user_id: uid,
    course_id: courseId,
    status: enrollmentDoc.status,
    user_name:
      (enrollmentDoc.user_name as string | undefined) ?? enrollmentDoc.userName,
    payment_status:
      (enrollmentDoc as any).payment_status ?? enrollmentDoc.paymentStatus,
    payment_method:
      (enrollmentDoc as any).payment_method ?? enrollmentDoc.paymentMethod,
    subscription_id:
      (enrollmentDoc as any).subscription_id ?? enrollmentDoc.subscriptionId,
    source_ref: (enrollmentDoc as any).source_ref ?? enrollmentDoc.sourceRef,
    access_until: toIsoDate(
      (enrollmentDoc as any).access_until ?? enrollmentDoc.accessUntil,
    ),
    enrolled_at: toIsoDate(
      (enrollmentDoc as any).enrolled_at ?? enrollmentDoc.enrolledAt,
    ),
    progress_summary:
      (enrollmentDoc as any).progress_summary ?? enrollmentDoc.progressSummary,
    course_version_at_enrollment:
      (enrollmentDoc as any).course_version_at_enrollment ??
      enrollmentDoc.courseVersionAtEnrollment,
    course_snapshot_at_enrollment:
      (enrollmentDoc as any).course_snapshot_at_enrollment ??
      enrollmentDoc.courseSnapshotAtEnrollment,
    paid_at: toIsoDate((enrollmentDoc as any).paid_at ?? enrollmentDoc.paidAt),
    approved_by: (enrollmentDoc as any).approved_by ?? enrollmentDoc.approvedBy,
    approved_at: toIsoDate(
      (enrollmentDoc as any).approved_at ?? enrollmentDoc.approvedAt,
    ),
    rejection_reason:
      (enrollmentDoc as any).rejection_reason ?? enrollmentDoc.rejectionReason,
    completed_at: toIsoDate(
      (enrollmentDoc as any).completed_at ?? enrollmentDoc.completedAt,
    ),
    last_accessed_at: toIsoDate(
      (enrollmentDoc as any).last_accessed_at ?? enrollmentDoc.lastAccessedAt,
    ),
  };
  const { error } = await supabase.from("enrollments").upsert(dataToSet, {
    onConflict: "user_id,course_id",
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
  // `enrollments.id` is database-generated; `(user_id, course_id)` is the
  // canonical identity used for idempotent payment updates.
  const existingQuery = supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId);
  const { data: existingRow } = await existingQuery
    .eq("user_id", uid)
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

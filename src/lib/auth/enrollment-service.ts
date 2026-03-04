"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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
  const rootRef = adminDb.collection("enrollments").doc(enrollmentId);
  const userRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("enrollments")
    .doc(courseId);

  const batch = adminDb.batch();

  const dataToSet = {
    ...enrollmentDoc,
    updatedAt: FieldValue.serverTimestamp(),
  };

  batch.set(rootRef, dataToSet, { merge: true });
  batch.set(userRef, dataToSet, { merge: true });

  if (enrollmentDoc.status === "active") {
    batch.update(adminDb.collection("users").doc(uid), {
      enrolledCourseIds: FieldValue.arrayUnion(courseId),
    });
  } else if (
    enrollmentDoc.status === "canceled" ||
    enrollmentDoc.status === "refunded"
  ) {
    batch.update(adminDb.collection("users").doc(uid), {
      enrolledCourseIds: FieldValue.arrayRemove(courseId),
    });
  }

  await batch.commit();
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
  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);

  // Fetch course for snapshotting and stats
  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  const courseData = courseSnap.data();
  const contentRevision = courseData?.contentRevision || 1;
  const totalLessons = courseData?.stats?.lessonsCount || 0;

  const snap = await enrollmentRef.get();
  const existing = snap.exists ? (snap.data() as EnrollmentDoc) : null;

  // Idempotency: If sourceRef is the same and already active, skip
  if (existing?.sourceRef === sessionId && existing?.status === "active") {
    return;
  }

  const updateData: Partial<EnrollmentDoc> = {
    uid: uid,
    userId: uid,
    courseId: courseId,
    status: "active",
    paymentMethod: isSubscription ? "subscription" : "stripe",
    sourceRef: sessionId,
    paidAt: FieldValue.serverTimestamp() as any,
  };

  if (isSubscription && accessUntil) {
    updateData.accessUntil = Timestamp.fromDate(accessUntil) as any;
  }

  // Initialize progress if new or missing
  if (!existing || !existing.progressSummary) {
    updateData.progressSummary = {
      completedLessonsCount: 0,
      totalLessons: totalLessons,
      percent: 0,
    };
    updateData.courseVersionAtEnrollment = contentRevision;
    updateData.createdAt = FieldValue.serverTimestamp() as any;
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

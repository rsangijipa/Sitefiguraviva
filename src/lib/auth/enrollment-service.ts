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

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(enrollmentRef);
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
      updatedAt: FieldValue.serverTimestamp() as any,
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

    tx.set(enrollmentRef, updateData, { merge: true });

    // User sub-collection mirror for faster client-side queries
    const userEnrollmentRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("enrollments")
      .doc(courseId);
    tx.set(userEnrollmentRef, updateData, { merge: true });

    // Robust Access Control: Sync to User Doc Array
    const userRef = adminDb.collection("users").doc(uid);
    tx.update(userRef, {
      enrolledCourseIds: FieldValue.arrayUnion(courseId),
    });

    // Audit Log entry inside transaction (or right after)
    // Note: logAudit is async and doesn't throw, but here we want it recorded.
    // We'll record a reference to the audit log if needed.
  });

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
  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
  const userEnrollmentRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("enrollments")
    .doc(courseId);

  const updates = {
    status: "canceled",
    updatedAt: FieldValue.serverTimestamp(),
  };

  const batch = adminDb.batch();
  batch.update(enrollmentRef, updates);
  batch.update(userEnrollmentRef, updates);

  // Revoke from User Doc
  const userRef = adminDb.collection("users").doc(uid);
  batch.update(userRef, {
    enrolledCourseIds: FieldValue.arrayRemove(courseId),
  });

  await batch.commit();

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

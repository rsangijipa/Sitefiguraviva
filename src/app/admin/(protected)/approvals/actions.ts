"use server";

import { requireAdmin } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { computeAccessStatus } from "@/lib/enrollmentStatus";

// --- Actions ---

export async function approveEnrollment(
  enrollmentId: string,
  uid: string,
  courseId: string,
  currentData: any,
) {
  try {
    const adminClaims = await requireAdmin(); // Throws if not admin
    const actorUid = adminClaims.uid;

    // Recalculate status to ensure consistency
    // Note: We use the data passed from client (currentData) or fetch fresh?
    // Ideally fetch fresh to be safe.
    const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
    const enrollmentSnap = await enrollmentRef.get();
    if (!enrollmentSnap.exists) {
      throw new Error("Matrícula não encontrada.");
    }
    const enrollment = enrollmentSnap.data() || {};

    // For manual admin approvals, always set status to 'active'
    // regardless of Stripe subscription status
    const newStatus = "active";

    const updateData = {
      status: newStatus,
      approvalStatus: "approved",
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      approvedBy: actorUid,
    };

    const batch = adminDb.batch();
    batch.update(enrollmentRef, updateData);

    // Also update the user's sub-collection copy
    const userEnrollmentRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("enrollments")
      .doc(courseId);
    batch.update(userEnrollmentRef, updateData);

    await batch.commit();

    // Audit Log
    await logAudit({
      actor: { uid: actorUid, role: "admin" },
      action: "enrollment.approved",
      target: {
        collection: "enrollments",
        id: enrollmentId,
        summary: `Approved access for user ${uid} to course ${courseId}`,
      },
      metadata: { courseId, uid, newStatus },
    });

    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error: any) {
    console.error("approveEnrollment error:", error);
    return {
      success: false,
      error: error.message || "Erro ao aprovar matrícula.",
    };
  }
}

export async function rejectEnrollment(
  enrollmentId: string,
  uid: string,
  courseId: string,
  reason: string,
) {
  try {
    const adminClaims = await requireAdmin();
    const actorUid = adminClaims.uid;

    if (!reason) throw new Error("Motivo da rejeição é obrigatório.");

    const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
    const enrollmentSnap = await enrollmentRef.get();
    if (!enrollmentSnap.exists) {
      throw new Error("Matrícula não encontrada.");
    }
    const enrollment = enrollmentSnap.data() || {};

    const newStatus = computeAccessStatus(
      enrollment.paymentStatus,
      "rejected",
      enrollment["stripe.subscriptionStatus"] || "active",
    );

    const updateData = {
      status: newStatus,
      approvalStatus: "rejected",
      rejectionReason: reason,
      rejectedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      rejectedBy: actorUid,
    };

    const batch = adminDb.batch();
    batch.update(enrollmentRef, updateData);
    batch.update(
      adminDb
        .collection("users")
        .doc(uid)
        .collection("enrollments")
        .doc(courseId),
      updateData,
    );

    await batch.commit();

    await logAudit({
      actor: { uid: actorUid, role: "admin" },
      action: "enrollment.rejected",
      target: {
        collection: "enrollments",
        id: enrollmentId,
        summary: `Rejected access for user ${uid} to course ${courseId}`,
      },
      metadata: { courseId, uid, reason },
    });

    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error: any) {
    console.error("rejectEnrollment error:", error);
    return {
      success: false,
      error: error.message || "Erro ao rejeitar matrícula.",
    };
  }
}

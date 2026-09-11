"use server";

import { randomUUID } from "crypto";
import { verifySession, requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { telemetry } from "@/lib/telemetry";
import { trackFunnelEvent } from "@/actions/analytics";
import { writeEnrollmentMirror } from "@/lib/auth/enrollment-service";
import { buildPixPayload, getPixConfig } from "@/lib/pix";

async function getEnrollment(userId: string, courseId: string) {
  const { data, error } = await createSupabaseServiceClient()
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Aluno solicita acesso via PIX e cria matrícula pendente de aprovação. */
export async function createEnrollmentPending(courseId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    const existing = await getEnrollment(session.uid, courseId);
    if (
      ["active", "completed", "pending_approval"].includes(
        existing?.status || "",
      )
    )
      return { success: true };
    await writeEnrollmentMirror({
      uid: session.uid,
      courseId,
      enrollmentDoc: {
        status: "pending_approval",
        paymentMethod: "pix",
      } as any,
    });
    revalidatePath(`/curso/${courseId}`);
    telemetry.track("enrollment_pix_pending_approval", {
      uid: session.uid,
      courseId,
    });
    await trackFunnelEvent(
      "funnel_enrollment_pending",
      { courseId },
      session.uid,
    );
    return { success: true };
  } catch (error: any) {
    telemetry.error(error, {
      context: "createEnrollmentPending",
      uid: session.uid,
      courseId,
    });
    return {
      success: false,
      error: error.message || "Não foi possível solicitar a matrícula.",
    };
  }
}

/** Produz um PIX copia-e-cola somente quando a chave do operador está configurada. */
export async function generatePixPayload(courseId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthorized" as const };
  const config = getPixConfig();
  if (!config)
    return { success: true, configured: false as const, payload: null };
  return {
    success: true,
    configured: true as const,
    payload: buildPixPayload(config, {
      txId: `${session.uid}${courseId}`.slice(0, 25),
    }),
  };
}

/** Admin aprova uma matrícula PIX pendente. */
export async function approvePixEnrollment(userId: string, courseId: string) {
  const admin = await requireAdmin();
  try {
    const existing = await getEnrollment(userId, courseId);
    if (!existing) return { success: false, error: "Enrollment not found" };
    if (existing.status === "active") return { alreadyActive: true };
    const sourceRef = `pix_${randomUUID()}`;
    const approvedAt = new Date();
    await writeEnrollmentMirror({
      uid: userId,
      courseId,
      enrollmentDoc: {
        status: "active",
        paymentMethod: "pix",
        paidAt: approvedAt,
        approvedBy: admin.uid,
        approvedAt,
        sourceRef,
      } as any,
    });
    telemetry.track("enrollment_pix_approved", {
      adminId: admin.uid,
      userId,
      courseId,
      transactionId: sourceRef,
    });
    await trackFunnelEvent(
      "funnel_enrollment_active",
      { courseId, approvedBy: admin.uid, paymentMethod: "pix" },
      userId,
    );
    await logAudit({
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      action: "PIX_APPROVED",
      target: {
        collection: "enrollments",
        id: existing.id,
        summary: `PIX approved for user ${userId}`,
      },
      diff: {
        before: { status: existing.status },
        after: { status: "active", sourceRef },
      },
    });
    revalidatePath("/admin/enrollments");
    revalidatePath(`/portal/course/${courseId}`);
    return { success: true };
  } catch (error: any) {
    telemetry.error(error, {
      context: "approvePixEnrollment",
      userId,
      courseId,
    });
    return {
      success: false,
      error: error.message || "Não foi possível aprovar a matrícula.",
    };
  }
}

/** Admin recusa uma matrícula PIX pendente. */
export async function rejectPixEnrollment(
  userId: string,
  courseId: string,
  reason: string,
) {
  const admin = await requireAdmin();
  const normalizedReason = reason.trim().slice(0, 1_000);
  if (!normalizedReason)
    return { success: false, error: "Informe o motivo da recusa." };
  try {
    const existing = await getEnrollment(userId, courseId);
    if (!existing) return { success: false, error: "Enrollment not found" };
    const approvedAt = new Date();
    await writeEnrollmentMirror({
      uid: userId,
      courseId,
      enrollmentDoc: {
        status: "canceled",
        approvedBy: admin.uid,
        approvedAt,
        rejectionReason: normalizedReason,
      } as any,
    });
    await logAudit({
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      action: "PIX_REJECTED",
      target: {
        collection: "enrollments",
        id: existing.id,
        summary: `PIX rejected for user ${userId}`,
      },
      diff: {
        before: { status: existing.status },
        after: { status: "canceled", rejectionReason: normalizedReason },
      },
    });
    revalidatePath("/admin/enrollments");
    telemetry.track("enrollment_pix_rejected", {
      adminId: admin.uid,
      userId,
      courseId,
    });
    return { success: true };
  } catch (error: any) {
    telemetry.error(error, {
      context: "rejectPixEnrollment",
      userId,
      courseId,
    });
    return {
      success: false,
      error: error.message || "Não foi possível recusar a matrícula.",
    };
  }
}

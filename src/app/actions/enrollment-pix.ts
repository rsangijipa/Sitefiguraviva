"use server";

import { verifySession, requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { telemetry } from "@/lib/telemetry";
import { trackFunnelEvent } from "@/actions/analytics";
import {
  writeEnrollmentMirror,
  type EnrollmentWriteInput,
} from "@/lib/auth/enrollment-service";
import { buildPixPayload, getPixConfig } from "@/lib/pix";

/**
 * Aluno solicita acesso via PIX.
 * Cria uma matrícula com status 'pending_approval'.
 */
export async function createEnrollmentPending(courseId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthorized" };
  const uid = session.uid;

  try {
    const supabase = createSupabaseServiceClient();
    const { data: existing, error: readError } = await supabase
      .from("enrollments")
      .select("status")
      .eq("user_id", uid)
      .eq("course_id", courseId)
      .maybeSingle();
    if (readError) throw readError;

    if (
      existing?.status === "active" ||
      existing?.status === "completed" ||
      existing?.status === "pending_approval"
    ) {
      return { success: true };
    }

    const newEnrollment: EnrollmentWriteInput = {
      status: "pending_approval",
      paymentMethod: "pix",
    };

    await writeEnrollmentMirror({
      uid,
      courseId,
      enrollmentDoc: newEnrollment,
    });

    revalidatePath(`/curso/${courseId}`);
    telemetry.track("enrollment_pix_pending_approval", { uid, courseId });
    await trackFunnelEvent("funnel_enrollment_pending", { courseId }, uid);
    return { success: true };
  } catch (error: any) {
    telemetry.error(error, {
      context: "createEnrollmentPending",
      uid,
      courseId,
    });
    return { success: false, error: error.message };
  }
}

/**
 * Gera um payload PIX ("copia e cola") real, a partir da chave PIX do
 * operador configurada em `PIX_MERCHANT_KEY`. Antes, o código exibido era
 * gerado com `Math.random()` e não apontava para nenhuma conta real — um
 * QR Code que parecia um pagamento de verdade, mas nunca foi (ver
 * docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md). Sem a chave configurada,
 * retornamos `configured: false` e a UI deve deixar isso explícito ao aluno
 * em vez de fabricar um código falso.
 */
export async function generatePixPayload(courseId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthorized" as const };

  const config = getPixConfig();
  if (!config) {
    return { success: true, configured: false as const, payload: null };
  }

  const payload = buildPixPayload(config, {
    txId: `${session.uid}${courseId}`.slice(0, 25),
  });

  return { success: true, configured: true as const, payload };
}

/**
 * Admin aprova matrícula PIX.
 */
export async function approvePixEnrollment(userId: string, courseId: string) {
  const adminSession = await requireAdmin();
  if (!adminSession) return { success: false, error: "Unauthorized" };

  const enrollmentId = `${userId}_${courseId}`;

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error: readError } = await supabase
      .from("enrollments")
      .select("status")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (readError) throw readError;
    if (!data) throw new Error("Enrollment not found");
    if (data.status === "active") return { alreadyActive: true };

    const approvalId = `pix_${crypto.randomUUID()}`;

    const updates: EnrollmentWriteInput = {
      status: "active",
      paymentMethod: "pix",
      paidAt: new Date(),
      approvedBy: adminSession.uid,
      approvedAt: new Date(),
      sourceRef: approvalId,
    };

    await writeEnrollmentMirror({
      uid: userId,
      courseId,
      enrollmentDoc: updates,
    });
    const result = { success: true, updates };

    if (result.success) {
      telemetry.track("enrollment_pix_approved", {
        adminId: adminSession.uid,
        userId,
        courseId,
        transactionId: result.updates?.sourceRef,
      });
      await trackFunnelEvent(
        "funnel_enrollment_active",
        {
          courseId,
          approvedBy: adminSession.uid,
          paymentMethod: "pix",
        },
        userId,
      );
      await logAudit({
        actor: {
          uid: adminSession.uid,
          email: adminSession.email,
          role: "admin",
        },
        action: "PIX_APPROVED",
        target: {
          collection: "enrollments",
          id: enrollmentId,
          summary: `PIX approved for user ${userId}`,
        },
        diff: { after: result.updates },
      });
      revalidatePath(`/admin/enrollments`);
      revalidatePath(`/portal/course/${courseId}`);
    }

    return { success: true };
  } catch (error: any) {
    telemetry.error(error, {
      context: "approvePixEnrollment",
      userId,
      courseId,
    });
    return { success: false, error: error.message };
  }
}

/**
 * Admin reprova matrícula PIX.
 */
export async function rejectPixEnrollment(
  userId: string,
  courseId: string,
  reason: string,
) {
  const adminSession = await requireAdmin();
  if (!adminSession) return { success: false, error: "Unauthorized" };

  const enrollmentId = `${userId}_${courseId}`;

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error: readError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (readError) throw readError;
    if (!data) throw new Error("Enrollment not found");

    const updates: EnrollmentWriteInput = {
      status: "canceled",
      rejectionReason: reason,
      approvedBy: adminSession.uid,
      approvedAt: new Date(),
    };

    await writeEnrollmentMirror({
      uid: userId,
      courseId,
      enrollmentDoc: updates,
    });
    const result = { success: true, updates };

    await logAudit({
      actor: {
        uid: adminSession.uid,
        email: adminSession.email,
        role: "admin",
      },
      action: "PIX_REJECTED",
      target: {
        collection: "enrollments",
        id: enrollmentId,
        summary: `PIX rejected for user ${userId}: ${reason}`,
      },
      diff: { after: result.updates },
    });

    revalidatePath(`/admin/enrollments`);
    telemetry.track("enrollment_pix_rejected", {
      adminId: adminSession.uid,
      userId,
      courseId,
      reason,
    });
    return { success: true };
  } catch (error: any) {
    telemetry.error(error, {
      context: "rejectPixEnrollment",
      userId,
      courseId,
    });
    return { success: false, error: error.message };
  }
}

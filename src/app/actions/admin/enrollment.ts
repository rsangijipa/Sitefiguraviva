"use server";
import { revalidatePath } from "next/cache";
import {
  approvePixEnrollment,
  type PixReconciliation,
} from "@/app/actions/enrollment-pix";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { findOrCreateSupabaseUserByEmail } from "@/lib/auth/admin-user-lookup";
import { z } from "zod";
function refresh(courseId: string) {
  revalidatePath("/portal");
  revalidatePath(`/portal/course/${courseId}`);
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/users");
  revalidatePath("/admin/applications");
}
export async function enrollUser(email: string, courseId: string) {
  try {
    const actor = await requireAdmin();
    const normalized = z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .max(254)
      .parse(email);
    const db = createSupabaseServiceClient();
    const { data: course, error: courseError } = await db
      .from("courses")
      .select("id,is_published,status")
      .eq("id", courseId)
      .maybeSingle();
    if (
      courseError ||
      !course?.is_published ||
      !["open", "closed"].includes(course.status)
    )
      throw new Error(
        "Selecione um curso publicado antes de convidar o aluno.",
      );
    const { uid, isNewUser } =
      await findOrCreateSupabaseUserByEmail(normalized);
    const { data, error } = await db.rpc("grant_manual_course_access", {
      p_actor: actor.uid,
      p_user: uid,
      p_course: courseId,
    });
    if (error || !data)
      throw new Error(
        isNewUser
          ? "Convite solicitado, mas o acesso não foi concedido. Confira a conta e a matrícula."
          : "A matrícula existente exige sua própria revisão; o acesso não foi alterado.",
      );
    const result = data as { enrollmentId: string; alreadyProcessed: boolean };
    refresh(courseId);
    return {
      success: true,
      uid,
      enrollmentId: result.enrollmentId,
      alreadyProcessed: result.alreadyProcessed,
      invitationRequested: isNewUser,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível conceder o acesso.",
    };
  }
}
export async function updateEnrollmentStatus(
  uid: string,
  courseId: string,
  newStatus: string,
) {
  try {
    const actor = await requireAdmin();
    const { data, error } = await createSupabaseServiceClient().rpc(
      "set_enrollment_admin_state",
      {
        p_actor: actor.uid,
        p_user: uid,
        p_course: courseId,
        p_status: newStatus,
      },
    );
    if (error || !data)
      throw new Error(
        "Alteração bloqueada. Confira a matrícula e use a conferência própria do pagamento.",
      );
    refresh(courseId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o acesso.",
    };
  }
}
export async function revokeAccess(
  uid: string,
  courseId: string,
  _reason = "Admin Revoke",
) {
  return updateEnrollmentStatus(uid, courseId, "canceled");
}
export async function batchEnrollUsers(emails: string[], courseId: string) {
  try {
    await requireAdmin();
    if (
      !Array.isArray(emails) ||
      emails.length < 1 ||
      emails.length > 100 ||
      emails.some((e) => typeof e !== "string")
    )
      throw new Error("Envie de 1 a 100 e-mails por lote.");
    const enrolled: string[] = [],
      failed: { email: string; error: string }[] = [];
    for (const email of new Set(emails.map((e) => e.trim().toLowerCase()))) {
      const res = await enrollUser(email, courseId);
      if (res.success) enrolled.push(email);
      else failed.push({ email, error: res.error || "Falha na matrícula." });
    }
    return { success: true, enrolled, failed };
  } catch (error) {
    return {
      success: false,
      enrolled: [],
      failed: [],
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível processar o lote.",
    };
  }
}
export async function approveEnrollment(
  uid: string,
  courseId: string,
  confirmation?: PixReconciliation,
) {
  try {
    await requireAdmin();
    const { data, error } = await createSupabaseServiceClient()
      .from("enrollments")
      .select("payment_method")
      .eq("user_id", uid)
      .eq("course_id", courseId)
      .maybeSingle();
    if (error || !data) throw new Error("Matrícula não encontrada.");
    return data.payment_method === "pix"
      ? approvePixEnrollment(uid, courseId, confirmation)
      : updateEnrollmentStatus(uid, courseId, "active");
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível revisar a matrícula.",
    };
  }
}

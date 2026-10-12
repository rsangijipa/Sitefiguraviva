"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { approveEnrollment as approveCanonical } from "@/app/actions/admin/enrollment";
import {
  rejectPixEnrollment,
  type PixReconciliation,
} from "@/app/actions/enrollment-pix";
import { revalidatePath } from "next/cache";

function rethrowRedirect(error: unknown) {
  if (
    typeof (error as { digest?: unknown })?.digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  )
    throw error;
}

export async function getPendingEnrollmentsAction() {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*, courses(title)")
      .eq("status", "pending_approval");

    if (error) {
      console.error("getPendingEnrollmentsAction Error:", error);
      return { success: false, error: error.message, enrollments: [] };
    }

    const formatted = (enrollments || []).map((e: any) => ({
      id: e.id,
      uid: e.user_id,
      courseId: e.course_id,
      courseTitle: e.courses?.title || e.course_id,
      status: e.status,
      paymentMethod: e.payment_method,
      createdAt: e.created_at,
    }));

    const { data: registrations, error: registrationsError } = await supabase
      .from("profiles")
      .select("id,email,display_name,phone_number,created_at")
      .eq("registration_status", "pending")
      .order("created_at", { ascending: true });
    if (registrationsError) throw registrationsError;

    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, title");
    const courseMap = new Map((allCourses || []).map((c: any) => [c.id, c.title]));

    const enrichedRegistrations = await Promise.all(
      (registrations || []).map(async (reg: any) => {
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(reg.id);
          const emailConfirmed = Boolean(authData?.user?.email_confirmed_at);
          const courseInterest = authData?.user?.user_metadata?.course_interest || null;
          return {
            ...reg,
            email_confirmed: emailConfirmed,
            course_interest: courseInterest,
            course_title: courseInterest ? courseMap.get(courseInterest) || courseInterest : null,
          };
        } catch {
          return {
            ...reg,
            email_confirmed: false,
            course_interest: null,
            course_title: null,
          };
        }
      }),
    );

    return {
      success: true,
      enrollments: formatted,
      registrations: enrichedRegistrations,
    };
  } catch (error: any) {
    rethrowRedirect(error);
    console.error("getPendingEnrollmentsAction Error:", error);
    return {
      success: false,
      error: error?.message || "Falha ao carregar aprovações.",
      enrollments: [],
      registrations: [],
    };
  }
}

export async function reviewRegistration(targetUid: string, approve: boolean) {
  try {
    const actor = await requireAdmin();
    if (!targetUid || typeof approve !== "boolean")
      return { success: false, error: "Solicitação inválida." };
    const { data, error } = await createSupabaseServiceClient().rpc(
      "review_pending_registration",
      { p_actor: actor.uid, p_target: targetUid, p_approve: approve },
    );
    if (error) {
      if (error.message?.includes("Email not confirmed")) {
        return {
          success: false,
          error:
            "Não é possível aprovar um cadastro com e-mail não confirmado.",
        };
      }
      return { success: false, error: "Cadastro pendente não encontrado." };
    }
    if (!data)
      return { success: false, error: "Cadastro pendente não encontrado." };
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Não foi possível revisar o cadastro." };
  }
}

export async function approveEnrollment(
  enrollmentId: string,
  uid: string,
  courseId: string,
  confirmation?: PixReconciliation,
) {
  await requireAdmin();
  const { data, error } = await createSupabaseServiceClient()
    .from("enrollments")
    .select("id")
    .eq("id", enrollmentId)
    .eq("user_id", uid)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error || !data)
    return { success: false, error: "Matrícula não encontrada." };
  return approveCanonical(uid, courseId, confirmation);
}
export async function rejectEnrollment(
  enrollmentId: string,
  uid: string,
  courseId: string,
  reason: string,
) {
  await requireAdmin();
  const db = createSupabaseServiceClient();
  const { data, error } = await db
    .from("enrollments")
    .select("id,payment_method,status")
    .eq("id", enrollmentId)
    .eq("user_id", uid)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error || !data || data.status !== "pending_approval")
    return { success: false, error: "Matrícula pendente não encontrada." };
  if (data.payment_method === "pix")
    return rejectPixEnrollment(uid, courseId, reason);
  if (!reason || reason.trim().length < 5)
    return { success: false, error: "Informe o motivo da rejeição." };
  const { data: updated, error: writeError } = await db
    .from("enrollments")
    .update({
      status: "canceled",
      rejection_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId)
    .eq("status", "pending_approval")
    .select("id");
  if (writeError || !updated?.length)
    return { success: false, error: "Não foi possível rejeitar a matrícula." };
  revalidatePath("/admin/approvals");
  return { success: true };
}

"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

function rethrowRedirect(error: unknown) {
  if (typeof (error as { digest?: unknown })?.digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")) throw error;
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
      createdAt: e.created_at,
    }));

    return { success: true, enrollments: formatted };
  } catch (error: any) {
    rethrowRedirect(error);
    console.error("getPendingEnrollmentsAction Error:", error);
    return { success: false, error: error?.message || "Falha ao carregar aprovações.", enrollments: [] };
  }
}

export async function approveEnrollment(
  enrollmentId: string,
  uid: string,
  courseId: string,
) {
  try {
    const adminUser = await requireAdmin();
    const actorUid = adminUser.uid;
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from("enrollments")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    if (error) throw error;

    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error: any) {
    rethrowRedirect(error);
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
    await requireAdmin();
    if (!reason) throw new Error("Motivo da rejeição é obrigatório.");

    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from("enrollments")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    if (error) throw error;

    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error: any) {
    rethrowRedirect(error);
    console.error("rejectEnrollment error:", error);
    return {
      success: false,
      error: error.message || "Erro ao rejeitar matrícula.",
    };
  }
}

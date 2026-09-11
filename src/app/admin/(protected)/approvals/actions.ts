"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

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
      return { success: false, enrollments: [] };
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
    console.error("getPendingEnrollmentsAction Error:", error);
    return { success: false, enrollments: [] };
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
        approved_by: actorUid,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId)
      .eq("user_id", uid)
      .eq("course_id", courseId)
      .eq("status", "pending_approval");

    if (error) throw error;

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
    const adminUser = await requireAdmin();
    if (!reason) throw new Error("Motivo da rejeição é obrigatório.");

    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from("enrollments")
      .update({
        status: "canceled",
        approved_by: adminUser.uid,
        approved_at: new Date().toISOString(),
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId)
      .eq("user_id", uid)
      .eq("course_id", courseId)
      .eq("status", "pending_approval");

    if (error) throw error;

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

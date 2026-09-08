"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { writeEnrollmentMirror } from "@/lib/auth/enrollment-service";
import { findOrCreateSupabaseUserByEmail } from "@/lib/auth/admin-user-lookup";
import { auditService } from "@/lib/audit";

/**
 * Enrolls a lead (an "Interessados" application, stored in Supabase's
 * `applications` table) into a course.
 *
 * This was built entirely on Firebase: it verified the admin's session with
 * the Firebase Admin SDK against a cookie that has carried a Supabase JWT
 * since the auth migration (always throwing "Unauthorized" — this action
 * has been completely non-functional), looked the lead up via
 * auth.getUserByEmail (Firebase Auth, which no signup writes to anymore),
 * and marked the application "enrolled" in a Firestore `applications`
 * collection that the admin UI never reads — it reads the Supabase table
 * written by /api/applications/submit. So even on the rare occasion this
 * didn't throw, the application's status in the actual admin list never
 * updated. Rewritten to run entirely on Supabase.
 */
export async function enrollLead(
  applicationId: string,
  data: {
    email: string;
    name: string;
    phone?: string;
    courseId: string;
    courseName?: string;
    applicationData?: any;
  },
) {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    if (!data.email) return { error: "Email é obrigatório para matrícula." };

    const { uid: userId, isNewUser } = await findOrCreateSupabaseUserByEmail(
      data.email,
      data.name,
    );

    const supabase = createSupabaseServiceClient();
    const { data: courseData } = await supabase
      .from("courses")
      .select("content_revision")
      .eq("id", data.courseId)
      .maybeSingle();

    await writeEnrollmentMirror({
      uid: userId,
      courseId: data.courseId,
      enrollmentDoc: {
        status: "active",
        paymentStatus: "paid",
        paymentMethod: "manual",
        sourceRef: applicationId,
        courseVersionAtEnrollment: courseData?.content_revision || 1,
      } as any,
    });

    const { error: appUpdateError } = await supabase
      .from("applications")
      .update({
        status: "enrolled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);
    if (appUpdateError) throw appUpdateError;

    await auditService.logEvent({
      eventType: "LEAD_ENROLLED",
      actor: { uid: adminUser.uid, email: adminUser.email },
      target: { id: userId, collection: "enrollments" },
      payload: { applicationId, courseId: data.courseId, isNewUser },
    });

    // New placeholder accounts have no password yet — hand the admin a
    // recovery link they can share so the student can set one and sign in.
    let passwordResetLink: string | null = null;
    if (isNewUser) {
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "recovery",
          email: data.email.toLowerCase().trim(),
        });
      if (linkError) {
        console.error("[EnrollLead] generateLink failed:", linkError);
      } else {
        passwordResetLink = linkData?.properties?.action_link ?? null;
      }
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/users");
    revalidatePath("/admin/enrollments");
    revalidatePath(`/portal/course/${data.courseId}`);
    revalidatePath(`/portal`);

    return { success: true, userId, isNewUser, passwordResetLink };
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return { error: error.message || "Falha na matrícula" };
  }
}

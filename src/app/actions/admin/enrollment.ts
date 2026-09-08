"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { writeEnrollmentMirror } from "@/lib/auth/enrollment-service";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

/**
 * Manual/admin enrollment management. This used to be built entirely on
 * Firestore + Firebase Admin Auth (adminAuth.getUserByEmail/createUser),
 * from back when accounts were Firebase-first. Every account is now created
 * through Supabase Auth (registerForCourseAction) and the admin's user
 * picker (listUsersForAdmin) lists Supabase users, so looking a student up
 * by email in Firebase Auth here would never find them — "Nova Matrícula"
 * would either fail outright or spawn a duplicate placeholder account in a
 * system nothing else reads from. Rewritten to operate on Supabase
 * (`profiles` + `enrollments`) end to end.
 */

async function assertAdmin() {
  const context = await requireAdmin();
  return { uid: context.uid, email: context.email };
}

async function findOrCreateSupabaseUser(email: string) {
  const supabase = createSupabaseServiceClient();
  const normalizedEmail = email.toLowerCase().trim();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return { uid: existingProfile.id, isNew: false };
  }

  // No profile with this email yet — create a placeholder Supabase Auth
  // user + profile so the student can claim it later (password reset) or
  // sign in with the email once the admin shares access.
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: false,
      user_metadata: { created_by: "admin_manual_enrollment" },
    });

  if (createError || !created?.user) {
    throw new Error(createError?.message || "Falha ao criar usuário");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: created.user.id,
    email: normalizedEmail,
    display_name: normalizedEmail.split("@")[0],
    role: "student",
    is_active: true,
  });
  if (profileError) throw profileError;

  return { uid: created.user.id, isNew: true };
}

/**
 * Enrolls a user in a course by email.
 * If the user does not exist yet, creates a placeholder Supabase account.
 */
export async function enrollUser(email: string, courseId: string) {
  try {
    const adminUser = await assertAdmin();
    const supabase = createSupabaseServiceClient();
    const { uid } = await findOrCreateSupabaseUser(email);

    const { data: courseData } = await supabase
      .from("courses")
      .select("title, content_revision")
      .eq("id", courseId)
      .maybeSingle();

    if (!courseData) throw new Error("Course not found");

    await writeEnrollmentMirror({
      uid,
      courseId,
      enrollmentDoc: {
        status: "active",
        paymentMethod: "manual",
        courseVersionAtEnrollment: courseData.content_revision || 1,
      } as any,
    });

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_CREATED",
      target: { collection: "enrollments", id: `${uid}_${courseId}` },
      diff: {
        after: { uid, courseId, status: "active", paymentMethod: "manual" },
      },
    });

    revalidatePath(`/portal/courses/${courseId}`);
    revalidatePath(`/portal/course/${courseId}`);
    revalidatePath(`/portal`);
    revalidatePath(`/admin/enrollments`);

    return { success: true, uid, enrollmentId: `${uid}_${courseId}` };
  } catch (error: any) {
    console.error("Enrollment Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Revokes access (cancels enrollment).
 */
export async function revokeAccess(
  uid: string,
  courseId: string,
  reason: string = "Admin Revoke",
) {
  try {
    const adminUser = await assertAdmin();

    await writeEnrollmentMirror({
      uid,
      courseId,
      enrollmentDoc: { status: "canceled" } as any,
    });

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_REVOKED",
      target: { collection: "enrollments", id: `${uid}_${courseId}` },
      diff: { after: { status: "canceled", reason } },
    });

    revalidatePath(`/portal`);
    revalidatePath(`/admin/enrollments`);
    return { success: true };
  } catch (error: any) {
    console.error("Revoke Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch enrolls multiple users by email.
 */
export async function batchEnrollUsers(emails: string[], courseId: string) {
  try {
    await assertAdmin();
    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    await Promise.all(
      emails.map(async (email) => {
        try {
          const res = await enrollUser(email, courseId);
          if (res.success) {
            results.success.push(email);
          } else {
            results.failed.push({ email, error: res.error || "Unknown error" });
          }
        } catch (err: any) {
          results.failed.push({ email, error: err.message });
        }
      }),
    );

    revalidatePath(`/admin/enrollments`);
    return { success: true, ...results };
  } catch (error: any) {
    console.error("Batch Enrollment Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates the status of an enrollment.
 */
export async function updateEnrollmentStatus(
  uid: string,
  courseId: string,
  newStatus:
    | "pending_approval"
    | "active"
    | "completed"
    | "canceled"
    | "refunded",
) {
  try {
    const adminUser = await assertAdmin();

    await writeEnrollmentMirror({
      uid,
      courseId,
      enrollmentDoc: { status: newStatus } as any,
    });

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_STATUS_UPDATED",
      target: { collection: "enrollments", id: `${uid}_${courseId}` },
      diff: { after: { status: newStatus } },
    });

    revalidatePath(`/portal`);
    revalidatePath(`/portal/courses/${courseId}`);
    revalidatePath(`/admin/enrollments`);

    return { success: true };
  } catch (error: any) {
    console.error("Update Status Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Specifically approves a pending enrollment.
 */
export async function approveEnrollment(uid: string, courseId: string) {
  try {
    const adminUser = await assertAdmin();
    const res = await updateEnrollmentStatus(uid, courseId, "active");
    if (!res.success) return res;

    const supabase = createSupabaseServiceClient();
    await supabase
      .from("enrollments")
      .update({
        approved_by: adminUser.uid,
        approved_at: new Date().toISOString(),
      })
      .eq("user_id", uid)
      .eq("course_id", courseId);

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_APPROVED",
      target: { collection: "enrollments", id: `${uid}_${courseId}` },
      diff: { after: { status: "active", approvedBy: adminUser.uid } },
    });

    // Note: `profiles` has no phone column today, so the WhatsApp
    // enrollment notification (previously read from a Firestore-only
    // `phone` field) has no source to read from here — dropped rather than
    // silently sent to a wrong/stale number. Re-add once phone capture is
    // part of the Supabase profile.

    return { success: true };
  } catch (error: any) {
    console.error("Approve Enrollment Error:", error);
    return { success: false, error: error.message };
  }
}

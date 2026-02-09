"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { progressService } from "@/lib/progress/progressService";
import { assertCanAccessCourse } from "@/lib/courses/access";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Validates user session and enrollment, then marks lesson as complete.
 */
export async function markLessonCompleted(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  try {
    // 1. Auth Check
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) throw new Error("Unauthenticated");

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const uid = decodedToken.uid;

    // 2. Access Check (Enrollment SSoT)
    // This ensures only enrolled students with active status can progress.
    await assertCanAccessCourse(uid, courseId);

    // 3. Service Call (Idempotent)
    await progressService.markLessonCompleted(
      uid,
      courseId,
      moduleId,
      lessonId,
    );

    // 4. Revalidate to show new progress in UI
    revalidatePath(`/portal/courses/${courseId}`);
    revalidatePath(`/portal/courses/${courseId}/learn/${lessonId}`);

    return { success: true };
  } catch (error: any) {
    console.error("MarkLessonCompleted Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates partial progress (video watch time).
 */
export async function updateLessonProgress(
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: { status: string; percent?: number; maxWatchedSecond?: number },
) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) throw new Error("Unauthenticated");

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const uid = decodedToken.uid;

    await assertCanAccessCourse(uid, courseId);

    await progressService.updateLessonProgress(
      uid,
      courseId,
      moduleId,
      lessonId,
      data,
    );

    if (data.status === "completed") {
      revalidatePath(`/portal/courses/${courseId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("UpdateLessonProgress Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Standalone action to force recalculate progress for a course.
 * Useful if course content changed (lessons added/removed) and
 * progress needs to be synced to the new denominator.
 *
 * Idempotent: Can be run multiple times safely.
 */
export async function recalculateProgress(
  courseId: string,
  targetUid?: string,
) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) throw new Error("Unauthenticated");

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const actorUid = decodedToken.uid;
    const isAdminToken = !!decodedToken.admin || decodedToken.role === "admin";

    // If targetUid is provided, actor must be admin
    const uid = targetUid && isAdminToken ? targetUid : actorUid;

    // Security Guard: Non-admins cannot recalculate other users' progress
    if (targetUid && targetUid !== actorUid && !isAdminToken) {
      throw new Error("Unauthorized: Cannot recalcute other user's progress");
    }

    // Access Check: Either admin or enrolled student
    // (Admins bypass enrollment check in the service logic usually, but here we enforce actor legality)
    if (!isAdminToken) {
      await assertCanAccessCourse(uid, courseId);
    }

    // Perform Canonical Recalculation
    await progressService.recalculateEnrollmentProgress(uid, courseId);

    // Revalidate relevant paths
    revalidatePath(`/portal/courses/${courseId}`);
    revalidatePath(`/portal/course/${courseId}`);

    return { success: true };
  } catch (error: any) {
    console.error("RecalculateProgress Error:", error);
    return { success: false, error: error.message };
  }
}

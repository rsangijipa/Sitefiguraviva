"use server";

import { upsertLessonProgress } from "@/features/progress/infrastructure/supabaseProgressRepository.server";
import {
  markLessonCompletedSupabase,
  recalculateProgressSupabase,
  updateLessonProgressSupabase,
} from "@/features/progress/infrastructure/supabaseProgressService.server";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { verifySession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

import { gamificationService } from "@/lib/gamification/gamificationService";

/**
 * Validates user session and enrollment, then marks lesson as complete.
 */
export async function markLessonCompleted(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  try {
    const session = await verifySession();
    if (!session) throw new Error("Unauthenticated");
    const uid = session.uid;

    // 2. Access Check (Enrollment SSoT)
    // This ensures only enrolled students with active status can progress.
    await assertCanAccessCourse(uid, courseId);

    // 3. Service Call (Idempotent). Progress and certificate eligibility use Supabase.
    await markLessonCompletedSupabase(uid, courseId, lessonId);

    // 4. Revalidate to show new progress in UI
    revalidatePath(`/portal/course/${courseId}`);
    revalidatePath(`/portal/course/${courseId}/lesson/${lessonId}`);
    revalidatePath(`/admin/enrollments`);

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
    const session = await verifySession();
    if (!session) throw new Error("Unauthenticated");
    const uid = session.uid;

    await assertCanAccessCourse(uid, courseId);

    await updateLessonProgressSupabase(uid, courseId, lessonId, data);

    if (data.status === "completed") {
      // Award XP
      await gamificationService.onLessonCompletion(uid, courseId, lessonId);
      revalidatePath(`/portal/course/${courseId}`);
      revalidatePath(`/admin/enrollments`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("UpdateLessonProgress Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLessonLastAccess(
  courseId: string,
  lessonId: string,
) {
  try {
    const session = await verifySession();
    if (!session) throw new Error("Unauthenticated");
    const uid = session.uid;

    await assertCanAccessCourse(uid, courseId);

    await upsertLessonProgress({
      userId: uid,
      courseId,
      lessonId,
      status: "in_progress",
    });

    return { success: true };
  } catch (error: any) {
    console.error("UpdateLessonLastAccess Error:", error);
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
    const session = await verifySession();
    if (!session) throw new Error("Unauthenticated");

    const actorUid = session.uid;
    const isAdminToken = session.isAdmin;

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
    await recalculateProgressSupabase(uid, courseId);

    // Revalidate relevant paths
    revalidatePath(`/portal/course/${courseId}`);
    revalidatePath(`/admin/enrollments`);

    return { success: true };
  } catch (error: any) {
    console.error("RecalculateProgress Error:", error);
    return { success: false, error: error.message };
  }
}

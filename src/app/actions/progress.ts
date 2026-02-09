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

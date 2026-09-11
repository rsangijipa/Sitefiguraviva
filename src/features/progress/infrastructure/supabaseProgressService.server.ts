import "server-only";

import {
  listAdminLessons,
  listAdminModules,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import {
  listProgressBySupabaseUser,
  updateEnrollmentProgressSummary,
  upsertLessonProgress,
} from "./supabaseProgressRepository.server";

export async function markLessonCompletedSupabase(
  userId: string,
  courseId: string,
  lessonId: string,
) {
  await upsertLessonProgress({
    userId,
    courseId,
    lessonId,
    status: "completed",
    percent: 100,
    completedAt: new Date().toISOString(),
  });
  await recalculateProgressSupabase(userId, courseId);
}

export async function updateLessonProgressSupabase(
  userId: string,
  courseId: string,
  lessonId: string,
  data: { status: string; percent?: number; maxWatchedSecond?: number },
) {
  await upsertLessonProgress({
    userId,
    courseId,
    lessonId,
    status: data.status === "completed" ? "completed" : "in_progress",
    percent: data.percent,
    maxWatchedSecond: data.maxWatchedSecond,
    completedAt:
      data.status === "completed" ? new Date().toISOString() : undefined,
  });
  if (data.status === "completed")
    await recalculateProgressSupabase(userId, courseId);
}

export async function recalculateProgressSupabase(
  userId: string,
  courseId: string,
) {
  const modules = (await listAdminModules(courseId)).filter(
    (item: any) => item.isPublished !== false,
  );
  const lessons = (
    await Promise.all(
      modules.map((item: any) => listAdminLessons(courseId, item.id)),
    )
  )
    .flat()
    .filter((item: any) => item.isPublished !== false);
  const progress = await listProgressBySupabaseUser(userId, courseId);
  const completed = new Set(
    progress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  const completedLessons = lessons.filter((item: any) =>
    completed.has(item.id),
  ).length;
  const percent = lessons.length
    ? Math.round((completedLessons / lessons.length) * 100)
    : 0;
  const completedModules = modules.filter((module: any) => {
    const moduleLessons = lessons.filter(
      (lesson: any) => lesson.moduleId === module.id,
    );
    return (
      moduleLessons.length > 0 &&
      moduleLessons.every((lesson: any) => completed.has(lesson.id))
    );
  }).length;
  await updateEnrollmentProgressSummary(userId, courseId, {
    completedLessonsCount: completedLessons,
    totalLessons: lessons.length,
    completedModulesCount: completedModules,
    totalModules: modules.length,
    percent,
  });
}

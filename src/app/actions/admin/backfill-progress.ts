"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Json } from "@/infrastructure/supabase/database.types";

type ProgressSummary = {
  completedLessonsCount: number;
  totalLessons: number;
  completedModulesCount: number;
  totalModules: number;
  percent: number;
};

async function recalculateEnrollmentProgress(enrollment: {
  id: string;
  user_id: string;
  course_id: string;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const [modulesResult, lessonsResult, progressResult] = await Promise.all([
    supabase
      .from("course_modules")
      .select("id")
      .eq("course_id", enrollment.course_id)
      .eq("is_published", true),
    supabase
      .from("lessons")
      .select("id, module_id")
      .eq("course_id", enrollment.course_id)
      .eq("is_published", true),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", enrollment.user_id)
      .eq("course_id", enrollment.course_id)
      .eq("status", "completed"),
  ]);
  if (modulesResult.error) throw modulesResult.error;
  if (lessonsResult.error) throw lessonsResult.error;
  if (progressResult.error) throw progressResult.error;

  const publishedModuleIds = new Set(
    (modulesResult.data ?? []).map((module) => module.id),
  );
  const lessonsByModule = new Map<string, string[]>();
  for (const lesson of lessonsResult.data ?? []) {
    if (!publishedModuleIds.has(lesson.module_id)) continue;
    const moduleLessons = lessonsByModule.get(lesson.module_id) ?? [];
    moduleLessons.push(lesson.id);
    lessonsByModule.set(lesson.module_id, moduleLessons);
  }

  const completedLessonIds = new Set(
    (progressResult.data ?? []).map((item) => item.lesson_id),
  );
  const publishedLessons = [...lessonsByModule.values()].flat();
  const completedLessons = publishedLessons.filter((id) =>
    completedLessonIds.has(id),
  );
  const completedModules = [...lessonsByModule.values()].filter(
    (moduleLessons) =>
      moduleLessons.length > 0 &&
      moduleLessons.every((lessonId) => completedLessonIds.has(lessonId)),
  );
  const percent =
    publishedLessons.length > 0
      ? Math.round((completedLessons.length / publishedLessons.length) * 100)
      : 0;
  const summary: ProgressSummary = {
    completedLessonsCount: completedLessons.length,
    totalLessons: publishedLessons.length,
    completedModulesCount: completedModules.length,
    totalModules: publishedModuleIds.size,
    percent,
  };
  const update: {
    progress_summary: Json;
    status?: "completed";
    completed_at?: string;
  } = { progress_summary: summary as unknown as Json };
  if (percent === 100 && publishedLessons.length > 0) {
    update.status = "completed";
    update.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("enrollments")
    .update(update)
    .eq("id", enrollment.id);
  if (updateError) throw updateError;
}

/** Recalculates canonical Supabase progress for every active or completed enrollment. */
export async function backfillProgress() {
  await requireAdmin();

  try {
    const supabase = createSupabaseServiceClient();
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("id, user_id, course_id")
      .in("status", ["active", "completed"])
      .not("user_id", "is", null);
    if (error) throw error;

    let processed = 0;
    const details: Array<{ id: string; error: string }> = [];
    for (const enrollment of enrollments ?? []) {
      if (!enrollment.user_id) continue;
      try {
        await recalculateEnrollmentProgress({
          id: enrollment.id,
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
        });
        processed += 1;
      } catch (error) {
        details.push({
          id: enrollment.id,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return { success: true, processed, errors: details.length, details };
  } catch (error) {
    console.error("Progress backfill failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

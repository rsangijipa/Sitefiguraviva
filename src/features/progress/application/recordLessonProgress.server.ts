import "server-only";

import { z } from "zod";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export const lessonProgressInput = z.object({
  courseId: z.string().min(1).max(128),
  moduleId: z.string().min(1).max(128),
  lessonId: z.string().min(1).max(128),
  status: z.enum(["in_progress", "completed"]),
  percent: z.number().finite().min(0).max(100).optional(),
  maxWatchedSecond: z.number().finite().min(0).max(86_400).optional(),
});

export type LessonProgressInput = z.infer<typeof lessonProgressInput>;

/** Validates curriculum topology before writing. Never trust route IDs from UI. */
export async function recordLessonProgress(
  userId: string,
  rawInput: LessonProgressInput,
) {
  const input = lessonProgressInput.parse(rawInput);
  const supabase = createSupabaseServiceClient();
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id,course_id,module_id,is_published")
    .eq("id", input.lessonId)
    .eq("course_id", input.courseId)
    .eq("module_id", input.moduleId)
    .eq("is_published", true)
    .maybeSingle();
  if (lessonError) throw lessonError;
  if (!lesson)
    throw new Error("Lesson is not published in this module and course");

  const { data: module, error: moduleError } = await supabase
    .from("course_modules")
    .select("id")
    .eq("id", input.moduleId)
    .eq("course_id", input.courseId)
    .eq("is_published", true)
    .maybeSingle();
  if (moduleError) throw moduleError;
  if (!module) throw new Error("Module is not published in this course");

  const { data: existing, error: existingError } = await supabase
    .from("lesson_progress")
    .select("status,percent,max_watched_second")
    .eq("user_id", userId)
    .eq("course_id", input.courseId)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();
  if (existingError) throw existingError;

  // Completion is monotonic. A late watch-time update cannot undo it.
  const status = existing?.status === "completed" ? "completed" : input.status;
  const percent =
    status === "completed"
      ? 100
      : Math.max(existing?.percent ?? 0, input.percent ?? 0);
  const maxWatchedSecond = Math.max(
    existing?.max_watched_second ?? 0,
    input.maxWatchedSecond ?? 0,
  );
  const transitionedToCompleted =
    existing?.status !== "completed" && status === "completed";
  const now = new Date().toISOString();

  const { error: writeError } = await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      course_id: input.courseId,
      lesson_id: input.lessonId,
      status,
      percent,
      max_watched_second: maxWatchedSecond,
      completed_at: status === "completed" ? now : null,
      updated_at: now,
    },
    { onConflict: "user_id,course_id,lesson_id" },
  );
  if (writeError) throw writeError;

  const [
    { data: lessons, error: lessonsError },
    { data: completed, error: completedError },
  ] = await Promise.all([
    supabase
      .from("lessons")
      .select("id,module_id")
      .eq("course_id", input.courseId)
      .eq("is_published", true),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("course_id", input.courseId)
      .eq("status", "completed"),
  ]);
  if (lessonsError) throw lessonsError;
  if (completedError) throw completedError;
  const published = lessons ?? [];
  const completedIds = new Set((completed ?? []).map((item) => item.lesson_id));
  const completedCount = published.filter((item) =>
    completedIds.has(item.id),
  ).length;
  const coursePercent = published.length
    ? Math.round((completedCount / published.length) * 100)
    : 0;
  const { error: enrollmentError } = await supabase
    .from("enrollments")
    .update({
      last_accessed_at: now,
      completed_at: coursePercent === 100 ? now : null,
      status: coursePercent === 100 ? "completed" : "active",
      progress_summary: {
        completedLessonsCount: completedCount,
        totalLessons: published.length,
        percent: coursePercent,
        lastLessonId: input.lessonId,
        updatedAt: now,
      },
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("course_id", input.courseId);
  if (enrollmentError) throw enrollmentError;

  return {
    transitionedToCompleted,
    courseCompleted: coursePercent === 100,
    coursePercent,
  };
}

export async function recordLessonAccess(
  userId: string,
  courseId: string,
  lessonId: string,
) {
  const supabase = createSupabaseServiceClient();
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!lesson) throw new Error("Lesson is not published in this course");
  const { error: updateError } = await supabase
    .from("enrollments")
    .update({
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if (updateError) throw updateError;
}

export async function recalculateCourseProgress(
  userId: string,
  courseId: string,
) {
  const supabase = createSupabaseServiceClient();
  const [
    { data: lessons, error: lessonsError },
    { data: completed, error: completedError },
  ] = await Promise.all([
    supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId)
      .eq("is_published", true),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "completed"),
  ]);
  if (lessonsError) throw lessonsError;
  if (completedError) throw completedError;
  const completedIds = new Set((completed ?? []).map((item) => item.lesson_id));
  const totalLessons = lessons?.length ?? 0;
  const completedLessonsCount = (lessons ?? []).filter((item) =>
    completedIds.has(item.id),
  ).length;
  const percent = totalLessons
    ? Math.round((completedLessonsCount / totalLessons) * 100)
    : 0;
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("enrollments")
    .update({
      status: percent === 100 && totalLessons ? "completed" : "active",
      completed_at: percent === 100 && totalLessons ? now : null,
      progress_summary: {
        completedLessonsCount,
        totalLessons,
        percent,
        updatedAt: now,
      },
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if (error) throw error;
  return { percent, completed: percent === 100 && totalLessons > 0 };
}

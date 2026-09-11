import {
  markLessonCompletedSupabase,
  recalculateProgressSupabase,
  updateLessonProgressSupabase,
} from "@/features/progress/infrastructure/supabaseProgressService.server";

/** Compatibility facade for older callers. Supabase is the only persistence layer. */
export const progressService = {
  markLessonCompleted: (
    userId: string,
    courseId: string,
    _moduleId: string,
    lessonId: string,
  ) => markLessonCompletedSupabase(userId, courseId, lessonId),
  updateLessonProgress: (
    userId: string,
    courseId: string,
    _moduleId: string,
    lessonId: string,
    data: { status: string; percent?: number; maxWatchedSecond?: number },
  ) => updateLessonProgressSupabase(userId, courseId, lessonId, data),
  recalculateEnrollmentProgress: (userId: string, courseId: string) =>
    recalculateProgressSupabase(userId, courseId),
};

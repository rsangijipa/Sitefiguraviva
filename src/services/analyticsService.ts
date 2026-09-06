import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { trackEvent } from "@/lib/telemetry/events";

export const analyticsService = {
  /**
   * Tracks when a user starts or continues a lesson.
   */
  async trackLessonStart(userId: string, courseId: string, lessonId: string) {
    const supabase: any = createSupabaseBrowserClient();
    await supabase
      .from("lesson_progress")
      .upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      });

    trackEvent("lesson_started", { courseId, lessonId });
  },

  /**
   * Tracks lesson completion and updates retention metrics.
   */
  async trackLessonCompletion(
    userId: string,
    courseId: string,
    lessonId: string,
  ) {
    const supabase: any = createSupabaseBrowserClient();
    await supabase
      .from("lesson_progress")
      .upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        status: "completed",
        percent: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    trackEvent("lesson_completed", { courseId, lessonId });
  },

  /**
   * Generates a snapshot of the current course retention.
   * Useful for the Admin Drop-off Dashboard.
   */
  async getCourseRetentionReport(courseId: string) {
    // In production, this would be an aggregation/edge function.
    // MVP: We could fetch a sample of progress docs.
    return {
      courseId,
      totalStudents: 0, // Mock
      dropOffPoints: [],
    };
  },
};

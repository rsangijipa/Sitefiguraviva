import { updateLessonLastAccess } from "@/app/actions/progress";
import { trackEvent } from "@/lib/telemetry/events";

export const analyticsService = {
  /**
   * Tracks when a user starts or continues a lesson.
   */
  async trackLessonStart(userId: string, courseId: string, lessonId: string) {
    const result = await updateLessonLastAccess(courseId, lessonId);
    if (!result.success) throw new Error(result.error);

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

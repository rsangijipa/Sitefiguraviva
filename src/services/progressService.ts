import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export interface CourseProgress {
  userId: string;
  courseId: string;
  lastLessonId?: string;
  lessonProgress: Record<
    string,
    {
      completed: boolean;
      completedAt?: any;
      seekPosition?: number;
    }
  >;
  lastAccessedAt: any;
}

export const progressService = {
  // Get progress for a specific course
  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgress | null> {
    if (!userId || !courseId) return null;

    try {
      const { data, error } = await (createSupabaseBrowserClient() as any)
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return null;
      const lessonProgress: CourseProgress["lessonProgress"] = {};
      for (const row of data)
        lessonProgress[row.lesson_id] = {
          completed: row.status === "completed",
          completedAt: row.completed_at,
          seekPosition: row.max_watched_second,
        };
      return {
        userId,
        courseId,
        lastLessonId: data[0].lesson_id,
        lessonProgress,
        lastAccessedAt: data[0].updated_at,
      };
    } catch (error) {
      console.error("Error fetching progress:", error);
      return null;
    }
  },

  // Get last accessed lesson (Resume capability)
  async getLastAccessedLesson(
    userId: string,
    courseId: string,
  ): Promise<string | null> {
    const progress = await this.getCourseProgress(userId, courseId);
    return progress?.lastLessonId || null;
  },
};

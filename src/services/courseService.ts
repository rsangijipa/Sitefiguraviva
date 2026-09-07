import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export interface Course {
  id: string;
  tenantId: string; // v3 Multi-tenancy
  title: string;
  description: string;
  image?: string;
  totalLessons?: number;
  modulesCount?: number;
  isPublished: boolean;
}

export const courseService = {
  // Get single course details
  async getCourse(courseId: string): Promise<Course | null> {
    if (!courseId) return null;
    const { data } = await createSupabaseBrowserClient()
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();
    return data
      ? ({
          id: data.id,
          tenantId: "default",
          title: data.title,
          description: data.description,
          image: data.image_url,
          isPublished: data.is_published,
        } as Course)
      : null;
  },

  /**
   * Get list of courses by IDs (for "My Courses" view)
   * In Multi-tenant v0, we ensure they belong to the correct tenant context if needed.
   */
  async getCoursesByIds(ids: string[], tenantId?: string): Promise<Course[]> {
    if (!ids || ids.length === 0) return [];

    const { data } = await createSupabaseBrowserClient()
      .from("courses")
      .select("*")
      .in("id", ids);
    const results = (data ?? []).map(
      (row: any) =>
        ({
          id: row.id,
          tenantId: tenantId || "default",
          title: row.title,
          description: row.description,
          image: row.image_url,
          isPublished: row.is_published,
        }) as Course,
    );

    // Log telemetry for course access (SSoT)
    // trackEvent('courses_fetched', { count: results.length });

    return results;
  },

  // Get materials for a course
  async getCourseMaterials(courseId: string): Promise<any[]> {
    if (!courseId) return [];
    try {
      const { data, error } = await createSupabaseBrowserClient()
        .from("lesson_materials")
        .select("*")
        .eq("course_id", courseId);
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error(`Error fetching materials for course ${courseId}:`, error);
      return [];
    }
  },
};

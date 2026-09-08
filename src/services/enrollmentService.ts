import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

// `enrollments.user_id` is a Postgres `uuid` column. A visitor still on a
// legacy Firebase account (not yet migrated to Supabase Auth) has a
// Firebase-style uid instead (e.g. "3YCwOnle2BgWqBeBMgAJ5DOsBEU2"), which
// Postgres rejects with a 400 "invalid input syntax for type uuid" if sent
// into `user_id`. Those rows are keyed by `legacy_firebase_uid` instead —
// same convention as writeEnrollmentMirror in src/lib/auth/enrollment-service.ts.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface Enrollment {
  id: string;
  courseId: string;
  uid: string;
  status:
    | "pending_approval"
    | "active"
    | "completed"
    | "canceled"
    | "refunded"
    | "pending";
  progressSummary?: {
    percent: number;
    completedLessonsCount: number;
    totalLessons: number;
    lastUpdated: any;
  };
  lastLessonId?: string;
  lastAccessedAt?: any;
  enrolledAt: any;
}

export const enrollmentService = {
  // Get all enrollments for a user
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    if (!userId) return [];

    try {
      const idColumn = UUID_RE.test(userId) ? "user_id" : "legacy_firebase_uid";
      const { data, error } = await createSupabaseBrowserClient()
        .from("enrollments")
        .select("*")
        .eq(idColumn, userId)
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        ...row,
        uid: row.user_id,
        courseId: row.course_id,
        enrolledAt: row.enrolled_at || row.created_at,
        progressSummary: row.progress_summary,
      })) as unknown as Enrollment[];
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
  },

  // Get specific enrollment
  async getEnrollment(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    if (!userId || !courseId) return null;

    const idColumn = UUID_RE.test(userId) ? "user_id" : "legacy_firebase_uid";
    const { data, error } = await createSupabaseBrowserClient()
      .from("enrollments")
      .select("*")
      .eq(idColumn, userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (error) throw error;
    return data
      ? ({
          id: data.id,
          ...data,
          uid: data.user_id,
          courseId: data.course_id,
          enrolledAt: data.enrolled_at || data.created_at,
          progressSummary: data.progress_summary,
        } as unknown as Enrollment)
      : null;
  },

  // Get active enrollments only
  async getActiveEnrollments(userId: string): Promise<Enrollment[]> {
    const all = await this.getUserEnrollments(userId);
    return all.filter((e) => e.status === "active" || e.status === "completed");
  },
};

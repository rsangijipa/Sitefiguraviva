import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { TableRow } from "@/infrastructure/supabase/database.types";

type EnrollmentRow = TableRow<"enrollments">;

export type EnrollmentLookupResult = {
  id: string;
  data: EnrollmentRow;
};

/**
 * Reads the canonical enrollment record for the authenticated Supabase user.
 * Enrollment IDs are database-generated UUIDs; `(user_id, course_id)` is the
 * stable business key.
 */
export async function findEnrollmentForCourse(
  userId: string,
  courseId: string,
): Promise<EnrollmentLookupResult | null> {
  if (!userId || !courseId) return null;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? { id: data.id, data } : null;
}

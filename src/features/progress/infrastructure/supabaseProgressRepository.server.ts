import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type { LessonProgressRecord } from "../domain/progress.types";

type LessonProgressRow = TableRow<"lesson_progress">;

function mapProgress(row: LessonProgressRow): LessonProgressRecord {
  return {
    id: row.id,
    userId: row.user_id,
    legacyFirebaseUid: row.legacy_firebase_uid,
    courseId: row.course_id,
    lessonId: row.lesson_id,
    status: row.status,
    percent: row.percent,
    maxWatchedSecond: row.max_watched_second,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

export async function listProgressBySupabaseUser(
  userId: string,
  courseId: string,
): Promise<LessonProgressRecord[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) throw error;
  return (data ?? []).map(mapProgress);
}

export async function listProgressByLegacyFirebaseUid(
  legacyFirebaseUid: string,
  courseId: string,
): Promise<LessonProgressRecord[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("legacy_firebase_uid", legacyFirebaseUid)
    .eq("course_id", courseId);

  if (error) throw error;
  return (data ?? []).map(mapProgress);
}

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

export async function upsertLessonProgress(input: {
  userId: string;
  courseId: string;
  lessonId: string;
  status: "completed" | "in_progress";
  percent?: number;
  maxWatchedSecond?: number;
  completedAt?: string;
}) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: input.userId,
      course_id: input.courseId,
      lesson_id: input.lessonId,
      status: input.status,
      percent: input.percent ?? (input.status === "completed" ? 100 : 0),
      max_watched_second: input.maxWatchedSecond ?? 0,
      completed_at: input.completedAt ?? null,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: "user_id,course_id,lesson_id" },
  );
  if (error) throw error;
}

export async function updateEnrollmentProgressSummary(
  userId: string,
  courseId: string,
  summary: Record<string, unknown>,
) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      progress_summary: summary,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Matrícula não encontrada.");
}

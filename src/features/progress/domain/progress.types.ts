import type { ProgressStatus } from "@/infrastructure/supabase/database.types";

export interface LessonProgressRecord {
  id: string;
  userId: string | null;
  legacyFirebaseUid: string | null;
  courseId: string;
  lessonId: string;
  status: ProgressStatus;
  percent: number;
  maxWatchedSecond: number;
  completedAt: string | null;
  updatedAt: string;
}

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type {
  AssessmentDoc,
  AssessmentSubmissionDoc,
  UserAssessmentProgress,
} from "@/types/assessment";

type AssessmentRow = TableRow<"assessments">;
type SubmissionRow = TableRow<"assessment_submissions">;
type ProgressRow = TableRow<"assessment_progress">;

function mapAssessment(row: AssessmentRow): AssessmentDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id || undefined,
    title: row.title,
    description: row.description || "",
    questions: Array.isArray(row.questions)
      ? (row.questions as unknown as AssessmentDoc["questions"])
      : [],
    passingScore: row.passing_score,
    totalPoints: row.total_points,
    status: row.status,
    isRequired: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
  };
}

function mapSubmission(row: SubmissionRow): AssessmentSubmissionDoc {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    userId: row.user_id || "",
    courseId: row.course_id,
    answers: Array.isArray(row.answers)
      ? (row.answers as unknown as AssessmentSubmissionDoc["answers"])
      : [],
    status: row.status,
    score: row.score,
    percentage: row.percentage,
    passed: row.passed,
    gradedBy: row.graded_by || undefined,
    feedback: row.feedback || undefined,
    attemptNumber: row.attempt_number,
    startedAt: row.started_at,
    submittedAt: row.submitted_at || undefined,
    gradedAt: row.graded_at || undefined,
    lastSavedAt: row.updated_at,
  };
}

function mapProgress(row: ProgressRow): UserAssessmentProgress {
  return {
    assessmentId: row.assessment_id,
    userId: row.user_id || "",
    courseId: row.course_id,
    attempts: row.attempts,
    bestScore: row.best_score,
    bestPercentage: row.best_percentage,
    passed: row.passed,
    lastAttemptAt: row.last_attempt_at,
    submissions: Array.isArray(row.submissions)
      ? (row.submissions as unknown as string[])
      : [],
  };
}

export async function listCourseAssessments(
  courseId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<AssessmentDoc[]> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapAssessment(row as AssessmentRow));
}

export async function getAssessment(
  assessmentId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<AssessmentDoc | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAssessment(data as AssessmentRow) : null;
}

export async function getUserProgress(
  userId: string,
  assessmentId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<UserAssessmentProgress | null> {
  const { data, error } = await supabase
    .from("assessment_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProgress(data as ProgressRow) : null;
}

export async function getUserSubmissions(
  userId: string,
  assessmentId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<AssessmentSubmissionDoc[]> {
  const { data, error } = await supabase
    .from("assessment_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapSubmission(row as SubmissionRow));
}

export async function getSubmission(
  submissionId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<AssessmentSubmissionDoc | null> {
  const { data, error } = await supabase
    .from("assessment_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSubmission(data as SubmissionRow) : null;
}

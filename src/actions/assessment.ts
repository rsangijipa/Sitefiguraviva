"use server";

import { randomUUID } from "crypto";
import {
  gradeSupabaseAssessmentAttempt,
  startSupabaseAssessmentAttempt,
  submitSupabaseAssessmentAttempt,
} from "@/features/assessments/infrastructure/supabaseAssessmentLifecycle.server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { logAudit } from "@/lib/audit";
import { requireAdmin, verifySession } from "@/lib/auth/server";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";
import type {
  AssessmentDoc,
  AssessmentSubmissionDoc,
  StudentAnswer,
} from "@/types/assessment";
import type { UserData } from "@/types/user";

const supabase = () => createSupabaseServiceClient();

type AttemptResult = {
  success?: boolean;
  submissionId?: string;
  error?: string;
};
type GradeResult = AttemptResult & {
  score?: number;
  totalPoints?: number;
  percentage?: number;
  passed?: boolean | null;
  requiresManualReview?: boolean;
};

function assessment(row: any): AssessmentDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id || undefined,
    title: row.title,
    description: row.description || "",
    questions: Array.isArray(row.questions) ? row.questions : [],
    passingScore: Number(row.passing_score),
    totalPoints: Number(row.total_points),
    status: row.status,
    isRequired: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
  } as AssessmentDoc;
}

function submission(row: any): AssessmentSubmissionDoc {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    userId: row.user_id || "",
    courseId: row.course_id,
    answers: Array.isArray(row.answers) ? row.answers : [],
    status: row.status,
    score: Number(row.score),
    percentage: Number(row.percentage),
    passed: row.passed,
    gradedBy: row.graded_by || undefined,
    feedback: row.feedback || undefined,
    attemptNumber: row.attempt_number,
    startedAt: row.started_at,
    submittedAt: row.submitted_at || undefined,
    gradedAt: row.graded_at || undefined,
    lastSavedAt: row.updated_at,
  } as AssessmentSubmissionDoc;
}

function user(row: any): UserData {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    role: row.role,
    status: row.is_active ? "active" : "disabled",
    isAdmin: row.role === "admin",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login_at,
  } as UserData;
}

function refreshAdmin() {
  revalidatePath("/admin/assessments");
  revalidatePath("/admin/assessments/submissions");
}

export async function getAdminAssessments(): Promise<AssessmentDoc[]> {
  await requireAdmin();
  const { data, error } = await supabase()
    .from("assessments")
    .select("*")
    .order("title");
  if (error) throw error;
  return (data || []).map(assessment);
}

export async function getAdminSubmissionMetrics() {
  await requireAdmin();
  const [total, pending] = await Promise.all([
    supabase()
      .from("assessment_submissions")
      .select("*", { count: "exact", head: true }),
    supabase()
      .from("assessment_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),
  ]);
  if (total.error) throw total.error;
  if (pending.error) throw pending.error;
  return { total: total.count || 0, pending: pending.count || 0 };
}

export async function getAdminSubmissionsPage({
  status,
  pageSize = 20,
  cursorId,
}: {
  status?: string;
  pageSize?: number;
  cursorId?: string;
}) {
  await requireAdmin();
  const client = supabase();
  let cursorTimestamp: string | undefined;
  if (cursorId) {
    const { data, error } = await client
      .from("assessment_submissions")
      .select("submitted_at")
      .eq("id", cursorId)
      .maybeSingle();
    if (error) throw error;
    cursorTimestamp = data?.submitted_at || undefined;
  }
  let query = client
    .from("assessment_submissions")
    .select("*")
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(Math.min(Math.max(Math.floor(pageSize), 1), 100));
  if (status) query = query.eq("status", status as any);
  if (cursorTimestamp) query = query.lt("submitted_at", cursorTimestamp);
  const { data, error } = await query;
  if (error) throw error;
  const submissions = (data || []).map(submission);
  const ids = [
    ...new Set(submissions.map((item) => item.userId).filter(Boolean)),
  ];
  const { data: profiles, error: profileError } = ids.length
    ? await client.from("profiles").select("*").in("id", ids)
    : { data: [], error: null };
  if (profileError) throw profileError;
  return {
    submissions,
    users: Object.fromEntries(
      (profiles || []).map((item) => [item.id, user(item)]),
    ) as Record<string, UserData>,
    lastVisible: submissions.at(-1)?.id,
    hasMore:
      submissions.length === Math.min(Math.max(Math.floor(pageSize), 1), 100),
  };
}

export async function startAssessmentAttempt(
  assessmentId: string,
  courseId: string,
): Promise<AttemptResult> {
  try {
    const session = await verifySession();
    if (!session) return { error: "Unauthorized" };
    return await startSupabaseAssessmentAttempt(
      session.uid,
      assessmentId,
      courseId,
    );
  } catch (error) {
    console.error("Start Assessment Attempt Error:", error);
    return { error: "Erro ao iniciar avaliação" };
  }
}

export async function submitAssessmentAttempt(
  submissionId: string,
  answers: StudentAnswer[],
): Promise<AttemptResult> {
  try {
    const session = await verifySession();
    if (!session) return { error: "Unauthorized" };
    return await submitSupabaseAssessmentAttempt(
      session.uid,
      submissionId,
      answers,
    );
  } catch (error) {
    console.error("Submit Assessment Attempt Error:", error);
    return { error: "Erro ao enviar avaliação" };
  }
}

export async function gradeAssessment(
  submissionId: string,
): Promise<GradeResult> {
  try {
    const session = await verifySession();
    if (!session) return { error: "Unauthorized" };
    const limited = await rateLimit(
      session.uid,
      "submitAssessment",
      RateLimitPresets.SUBMIT_ASSIGNMENT,
    );
    if (!limited.allowed)
      return {
        error: `Limite de submissões excedido. Aguarde ${Math.ceil((limited.resetAt - Date.now()) / 1000)}s.`,
      };
    return await gradeSupabaseAssessmentAttempt(session.uid, submissionId);
  } catch (error) {
    console.error("Grade Assessment Error:", error);
    return { error: "Erro ao processar avaliação" };
  }
}

export async function createAssessment(data: Partial<AssessmentDoc>) {
  try {
    const admin = await requireAdmin();
    if (!data.courseId || !data.title)
      return { error: "Curso e título são obrigatórios" };
    const id = randomUUID();
    const totalPoints =
      data.questions?.reduce((sum, question) => sum + question.points, 0) || 0;
    const { error } = await supabase()
      .from("assessments")
      .insert({
        id,
        course_id: data.courseId,
        lesson_id: data.lessonId || null,
        title: data.title,
        description: data.description || null,
        questions: (data.questions || []) as any,
        passing_score: data.passingScore ?? 70,
        total_points: totalPoints,
        status: data.status || "draft",
        created_by: admin.uid,
      });
    if (error) throw error;
    await logAudit({
      action: "ASSESSMENT_CREATED",
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      target: { id, collection: "assessments", summary: data.title },
    });
    refreshAdmin();
    return { success: true, id };
  } catch (error) {
    console.error("Create Assessment Error:", error);
    return { error: "Erro ao criar avaliação" };
  }
}

export async function updateAssessment(
  id: string,
  data: Partial<AssessmentDoc>,
) {
  try {
    const admin = await requireAdmin();
    const totalPoints = data.questions?.reduce(
      (sum, question) => sum + question.points,
      0,
    );
    const { error } = await supabase()
      .from("assessments")
      .update({
        title: data.title,
        description: data.description,
        lesson_id: data.lessonId,
        questions: data.questions as any,
        passing_score: data.passingScore,
        total_points: totalPoints,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    await logAudit({
      action: "ASSESSMENT_UPDATED",
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      target: { id, collection: "assessments" },
    });
    refreshAdmin();
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Error:", error);
    return { error: "Erro ao atualizar avaliação" };
  }
}

export async function deleteAssessment(id: string) {
  try {
    const admin = await requireAdmin();
    const { error } = await supabase()
      .from("assessments")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await logAudit({
      action: "ASSESSMENT_DELETED",
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      target: { id, collection: "assessments" },
    });
    refreshAdmin();
    return { success: true };
  } catch (error) {
    console.error("Delete Assessment Error:", error);
    return { error: "Erro ao excluir avaliação" };
  }
}

export async function updateAssessmentStatus(
  id: string,
  status: "draft" | "published" | "archived",
) {
  return updateAssessment(id, { status } as Partial<AssessmentDoc>);
}

export async function getSubmissionDetail(id: string): Promise<{
  submission: AssessmentSubmissionDoc;
  user: UserData | null;
  assessment: AssessmentDoc | null;
} | null> {
  try {
    await requireAdmin();
    const client = supabase();
    const { data: row, error } = await client
      .from("assessment_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    const [profileResult, assessmentResult] = await Promise.all([
      row.user_id
        ? client
            .from("profiles")
            .select("*")
            .eq("id", row.user_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      client
        .from("assessments")
        .select("*")
        .eq("id", row.assessment_id)
        .maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (assessmentResult.error) throw assessmentResult.error;
    return {
      submission: submission(row),
      user: profileResult.data ? user(profileResult.data) : null,
      assessment: assessmentResult.data
        ? assessment(assessmentResult.data)
        : null,
    };
  } catch (error) {
    console.error("Get Submission Detail Error:", error);
    return null;
  }
}

export async function saveManualGrading(
  submissionId: string,
  gradingData: { answers: StudentAnswer[]; feedback?: string },
) {
  try {
    const admin = await requireAdmin();
    const client = supabase();
    const { data: row, error: submissionError } = await client
      .from("assessment_submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();
    if (submissionError) throw submissionError;
    if (!row) return { error: "Submissão não encontrada" };
    const { data: assessmentRow, error: assessmentError } = await client
      .from("assessments")
      .select("passing_score,total_points")
      .eq("id", row.assessment_id)
      .maybeSingle();
    if (assessmentError) throw assessmentError;
    if (!assessmentRow) return { error: "Avaliação não encontrada" };
    const score = gradingData.answers.reduce(
      (sum, answer) => sum + (answer.pointsEarned || 0),
      0,
    );
    const percentage = assessmentRow.total_points
      ? (score / assessmentRow.total_points) * 100
      : 0;
    const passed = percentage >= Number(assessmentRow.passing_score);
    const { error } = await client
      .from("assessment_submissions")
      .update({
        answers: gradingData.answers as any,
        score,
        percentage,
        passed,
        status: "graded",
        feedback: gradingData.feedback || null,
        graded_by: admin.uid,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
    if (error) throw error;
    const { data: progress } = await client
      .from("assessment_progress")
      .select("*")
      .eq("user_id", row.user_id)
      .eq("assessment_id", row.assessment_id)
      .maybeSingle();
    await client.from("assessment_progress").upsert(
      {
        id: progress?.id || randomUUID(),
        assessment_id: row.assessment_id,
        user_id: row.user_id,
        course_id: row.course_id,
        attempts: progress?.attempts || 1,
        best_score: Math.max(Number(progress?.best_score || 0), score),
        best_percentage: Math.max(
          Number(progress?.best_percentage || 0),
          percentage,
        ),
        passed: Boolean(progress?.passed) || passed,
        last_attempt_at: new Date().toISOString(),
        submissions: Array.isArray(progress?.submissions)
          ? progress.submissions
          : [submissionId],
      } as any,
      { onConflict: "user_id,assessment_id" },
    );
    refreshAdmin();
    revalidatePath(`/admin/assessments/submissions/${submissionId}`);
    return { success: true };
  } catch (error) {
    console.error("Save Manual Grading Error:", error);
    return { error: "Erro ao salvar correção" };
  }
}

"use server";

import {
  readAdminAssessments,
  saveAdminAssessment,
  removeAdminAssessment,
  setAdminAssessmentStatus,
} from "@/features/assessments/infrastructure/adminAssessmentManagement.server";
import { startAttempt, submitAssessment } from "@/app/actions/assessment";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { revalidatePath } from "next/cache";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type {
  AssessmentDoc,
  StudentAnswer,
  AssessmentSubmissionDoc,
} from "@/types/assessment";
import type { UserData } from "@/types/user";
import {
  readSubmissionMetrics,
  readSubmissionsPage,
  readSubmissionDetail,
} from "@/features/assessments/infrastructure/adminAssessmentQueries.server";
import { manualGradeSubmission } from "@/actions/grading";

async function requireUserClaims() {
  const session = await verifySession();
  if (session) {
    return {
      uid: session.uid,
      email: session.email,
      role: session.role || "student",
      admin: session.isAdmin,
    };
  }

  throw new Error("Unauthorized");
}

/**
 * Read assessment management data through the server.
 */
export async function getAdminAssessments(): Promise<AssessmentDoc[]> {
  return readAdminAssessments();
}

export async function getAdminAssessment(
  id: string,
): Promise<AssessmentDoc | null> {
  return (await readAdminAssessments(id))[0] ?? null;
}

export async function getAdminSubmissionMetrics(): Promise<{
  total: number;
  pending: number;
}> {
  return readSubmissionMetrics();
}

export async function getAdminSubmissionsPage({
  status,
  pageSize = 20,
  cursorId,
}: {
  status?: string;
  pageSize?: number;
  cursorId?: string;
}): Promise<{
  submissions: AssessmentSubmissionDoc[];
  users: Record<string, UserData>;
  lastVisible?: string;
  hasMore: boolean;
}> {
  return readSubmissionsPage({ status, pageSize, cursorId });
}

/** Legacy quiz API delegates to the canonical Supabase attempt lifecycle. */
export async function startAssessmentAttempt(
  assessmentId: string,
  courseId: string,
): Promise<{
  success?: boolean;
  submissionId?: string;
  answers?: StudentAnswer[];
  error?: string;
}> {
  try {
    return await startAttempt(assessmentId, courseId);
  } catch {
    console.error("Assessment attempt could not be started");
    return {
      error:
        "Não foi possível iniciar a avaliação. Confira seu acesso e tente novamente.",
    };
  }
}

async function ownedSubmission(submissionId: string) {
  const claims = await requireUserClaims();
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(submissionId))
    throw new Error("Invalid submission");
  const { data, error } = await createSupabaseServiceClient()
    .from("assessment_submissions")
    .select(
      "id,user_id,course_id,assessment_id,status,score,percentage,passed,answers",
    )
    .eq("id", submissionId)
    .eq("user_id", claims.uid)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Submission unavailable");
  await assertCanAccessCourse(claims.uid, data.course_id);
  return { submission: data, claims };
}

export async function submitAssessmentAttempt(
  submissionId: string,
  answers: StudentAnswer[],
) {
  try {
    const { submission, claims } = await ownedSubmission(submissionId);
    if (submission.status !== "pending")
      throw new Error("Attempt already submitted");
    if (
      !Array.isArray(answers) ||
      answers.length > 200 ||
      new Set(answers.map((answer) => answer.questionId)).size !==
        answers.length
    )
      throw new Error("Invalid answers");
    const limited = await rateLimit(
      claims.uid,
      "submitAssessment",
      RateLimitPresets.SUBMIT_ASSIGNMENT,
    );
    if (!limited.allowed)
      return {
        error: "Limite de submissões excedido. Aguarde e tente novamente.",
      };
    const raw = Object.fromEntries(
      answers.map((answer) => [
        answer.questionId,
        answer.storagePath
          ? {
              storagePath: answer.storagePath,
              fileName: answer.fileName,
              mimeType: answer.mimeType,
              fileSize: answer.fileSize,
              ...(answer.textAnswer !== undefined
                ? { textAnswer: answer.textAnswer }
                : {}),
            }
          : (answer.selectedOptions ??
            answer.booleanAnswer ??
            answer.textAnswer),
      ]),
    );
    const result = await submitAssessment(
      submission.assessment_id,
      raw,
      submissionId,
    );
    return { success: true, progressSaved: result.progressSaved };
  } catch {
    console.error("Assessment attempt could not be submitted");
    return {
      error:
        "Não foi possível enviar a avaliação. Confira seu acesso e tente novamente.",
    };
  }
}

/** The canonical submit already grades once; reading its result is idempotent. */
export async function gradeAssessment(submissionId: string) {
  try {
    const { submission } = await ownedSubmission(submissionId);
    if (!["submitted", "graded"].includes(submission.status))
      throw new Error("Attempt not submitted");
    const { data: assessment, error } = await createSupabaseServiceClient()
      .from("assessments")
      .select("total_points")
      .eq("id", submission.assessment_id)
      .eq("course_id", submission.course_id)
      .maybeSingle();
    if (error) throw error;
    if (!assessment) throw new Error("Assessment unavailable");
    const requiresManualReview = submission.status === "submitted";
    return {
      success: true,
      score: submission.score,
      totalPoints: assessment.total_points,
      percentage: submission.percentage,
      passed: requiresManualReview ? null : submission.passed,
      requiresManualReview,
    };
  } catch {
    console.error("Assessment result could not be read");
    return { error: "Não foi possível consultar o resultado da avaliação." };
  }
}

/**
 * Create a new assessment (Admin only)
 */
export async function createAssessment(data: Partial<AssessmentDoc>) {
  try {
    const id = await saveAdminAssessment(data);
    revalidatePath("/admin/assessments");
    return { success: true, id };
  } catch (error) {
    console.error("Create Assessment Error:", error);
    return {
      error:
        "Não foi possível criar a avaliação. Confira o curso, as questões e as respostas corretas.",
    };
  }
}

export async function updateAssessment(
  id: string,
  data: Partial<AssessmentDoc>,
) {
  try {
    await saveAdminAssessment(data, id);
    revalidatePath("/admin/assessments");
    revalidatePath(`/admin/assessments/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Error:", error);
    return {
      error:
        "Não foi possível salvar a avaliação. Confira os dados e tente novamente.",
    };
  }
}

export async function deleteAssessment(id: string) {
  try {
    await removeAdminAssessment(id);
    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Delete Assessment Error:", error);
    return { error: "Não foi possível excluir a avaliação." };
  }
}

export async function updateAssessmentStatus(
  id: string,
  status: "draft" | "published" | "archived",
) {
  try {
    await setAdminAssessmentStatus(id, status);
    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Status Error:", error);
    return { error: "Não foi possível atualizar o status da avaliação." };
  }
}

/**
 * Get single submission detail (Admin only)
 */
export async function getSubmissionDetail(id: string): Promise<{
  submission: AssessmentSubmissionDoc;
  user: UserData | null;
  assessment: AssessmentDoc | null;
} | null> {
  return readSubmissionDetail(id);
}

/**
 * Save manual grading for a submission
 */
export async function saveManualGrading(
  submissionId: string,
  gradingData: {
    answers: StudentAnswer[];
    feedback?: string;
  },
) {
  try {
    const detail = await readSubmissionDetail(submissionId);
    if (!detail?.assessment) return { error: "Submissão não encontrada" };
    const grades = detail.assessment.questions
      .filter(
        (question) =>
          question.type === "essay" || question.type === "practical",
      )
      .map((question) => ({
        questionId: question.id,
        pointsEarned:
          gradingData.answers.find(
            (answer) => answer.questionId === question.id,
          )?.pointsEarned ?? 0,
      }));
    const result = await manualGradeSubmission(
      submissionId,
      grades,
      gradingData.feedback,
    );
    if (result.success) {
      revalidatePath(`/admin/assessments/submissions/${submissionId}`);
      revalidatePath("/admin/assessments/submissions");
    }
    return result;
  } catch {
    return { error: "Erro ao salvar correção" };
  }
}

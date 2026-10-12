"use server";

import {
  readAdminAssessments,
  saveAdminAssessment,
  removeAdminAssessment,
  setAdminAssessmentStatus,
} from "@/features/assessments/infrastructure/adminAssessmentManagement.server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
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

/**
 * Start a new assessment attempt in a server-authoritative way.
 */
export async function startAssessmentAttempt(
  assessmentId: string,
  courseId: string,
) {
  try {
    const claims = await requireUserClaims();
    const uid = claims.uid;

    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(assessmentId)
      .get();
    if (!assessmentSnap.exists) {
      return { error: "Avaliação não encontrada" };
    }

    const assessment = assessmentSnap.data() as AssessmentDoc;
    if (assessment.courseId !== courseId) {
      return { error: "Curso da avaliação inválido" };
    }

    const existingAttempts = await adminDb
      .collection("assessmentSubmissions")
      .where("assessmentId", "==", assessmentId)
      .where("userId", "==", uid)
      .get();

    const maxAttempt = existingAttempts.docs.reduce((max, d) => {
      const value = Number(d.data()?.attemptNumber || 0);
      return value > max ? value : max;
    }, 0);

    const submissionRef = await adminDb
      .collection("assessmentSubmissions")
      .add({
        assessmentId,
        userId: uid,
        courseId,
        answers: [],
        status: "pending",
        attemptNumber: maxAttempt + 1,
        startedAt: Timestamp.now(),
      });

    // Supabase mirror write
    try {
      const supabase = createSupabaseServiceClient();
      await supabase.from("assessment_submissions").insert({
        id: submissionRef.id,
        assessment_id: assessmentId,
        user_id: uid,
        course_id: courseId,
        answers: [],
        status: "pending",
        attempt_number: maxAttempt + 1,
        started_at: new Date().toISOString(),
        score: 0,
        percentage: 0,
        passed: false,
      });
    } catch {
      // ignore
    }

    return { success: true, submissionId: submissionRef.id };
  } catch (error) {
    console.error("Start Assessment Attempt Error:", error);
    return { error: "Erro ao iniciar avaliação" };
  }
}

/**
 * Submit an assessment attempt answer payload before grading.
 */
export async function submitAssessmentAttempt(
  submissionId: string,
  answers: StudentAnswer[],
) {
  try {
    const claims = await requireUserClaims();
    const uid = claims.uid;

    const submissionRef = adminDb
      .collection("assessmentSubmissions")
      .doc(submissionId);
    const submissionSnap = await submissionRef.get();
    if (!submissionSnap.exists) {
      return { error: "Submissão não encontrada" };
    }

    const submission = submissionSnap.data() as AssessmentSubmissionDoc;
    if (submission.userId !== uid) {
      return { error: "Acesso negado" };
    }

    const nowIso = new Date().toISOString();
    await submissionRef.update({
      answers,
      status: "submitted",
      submittedAt: Timestamp.now(),
    });

    try {
      const supabase = createSupabaseServiceClient();
      await supabase
        .from("assessment_submissions")
        .update({
          answers: answers as any,
          status: "submitted",
          submitted_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", submissionId);
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error) {
    console.error("Submit Assessment Attempt Error:", error);
    return { error: "Erro ao enviar avaliação" };
  }
}

/**
 * Grade an assessment submission
 * Auto-grades multiple choice and true/false
 * Marks essays/practicals for manual review
 */
export async function gradeAssessment(submissionId: string) {
  try {
    const claims = await requireUserClaims();

    // Rate limiting: Prevent spam submissions
    const rateLimitResult = await rateLimit(
      claims.uid,
      "submitAssessment",
      RateLimitPresets.SUBMIT_ASSIGNMENT,
    );

    if (!rateLimitResult.allowed) {
      const waitSeconds = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000,
      );
      return {
        error: `Limite de submissões excedido. Aguarde ${waitSeconds}s.`,
      };
    }

    // Get submission
    const submissionRef = adminDb
      .collection("assessmentSubmissions")
      .doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      return { error: "Submissão não encontrada" };
    }

    const submission = submissionSnap.data() as AssessmentSubmissionDoc;

    // Verify ownership
    if (submission.userId !== claims.uid) {
      return { error: "Acesso negado" };
    }

    // Get assessment
    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(submission.assessmentId)
      .get();

    if (!assessmentSnap.exists) {
      return { error: "Avaliação não encontrada" };
    }

    const assessment = assessmentSnap.data() as AssessmentDoc;

    // Auto-grade
    let totalPoints = 0;
    let earnedPoints = 0;
    let requiresManualReview = false;

    const gradedAnswers: StudentAnswer[] = submission.answers.map((answer) => {
      const question = assessment.questions.find(
        (q) => q.id === answer.questionId,
      );

      if (!question) return answer;

      totalPoints += question.points;

      // Multiple Choice grading
      if (question.type === "multiple_choice" && answer.selectedOptions) {
        const correctOptions = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);

        const isCorrect =
          correctOptions.length === answer.selectedOptions.length &&
          correctOptions.every((id) => answer.selectedOptions!.includes(id));

        const pointsEarned = isCorrect ? question.points : 0;
        earnedPoints += pointsEarned;

        return { ...answer, isCorrect, pointsEarned };
      }

      // True/False grading
      if (
        question.type === "true_false" &&
        answer.booleanAnswer !== undefined
      ) {
        const isCorrect = answer.booleanAnswer === question.correctAnswer;
        const pointsEarned = isCorrect ? question.points : 0;
        earnedPoints += pointsEarned;

        return { ...answer, isCorrect, pointsEarned };
      }

      // Essay/Practical - requires manual review
      if (question.type === "essay" || question.type === "practical") {
        requiresManualReview = true;
        return { ...answer, pointsEarned: 0 };
      }

      return answer;
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= assessment.passingScore;

    // Update submission
    const updateData: any = {
      answers: gradedAnswers,
      score: earnedPoints,
      percentage,
      passed: requiresManualReview ? false : passed,
      status: requiresManualReview ? "submitted" : "graded",
      gradedAt: Timestamp.now(),
    };

    await submissionRef.update(updateData);

    // Update user progress in Firestore
    const progressRef = adminDb
      .collection("users")
      .doc(claims.uid)
      .collection("assessmentProgress")
      .doc(submission.assessmentId);

    const progressSnap = await progressRef.get();
    const currentProgress = progressSnap.exists ? progressSnap.data() : null;

    const newBestPercentage = Math.max(
      percentage,
      currentProgress?.bestPercentage || 0,
    );
    const newBestScore = Math.max(
      earnedPoints,
      currentProgress?.bestScore || 0,
    );
    const totalAttempts = (currentProgress?.attempts || 0) + 1;

    await progressRef.set(
      {
        assessmentId: submission.assessmentId,
        userId: claims.uid,
        courseId: submission.courseId,
        attempts: totalAttempts,
        bestScore: newBestScore,
        bestPercentage: newBestPercentage,
        passed: requiresManualReview
          ? false
          : newBestPercentage >= assessment.passingScore,
        lastAttemptAt: Timestamp.now(),
        submissions: [...(currentProgress?.submissions || []), submissionId],
      },
      { merge: true },
    );

    // Sync to Supabase
    try {
      const supabase = createSupabaseServiceClient();
      const nowIso = new Date().toISOString();
      await supabase
        .from("assessment_submissions")
        .update({
          answers: gradedAnswers as any,
          score: earnedPoints,
          percentage,
          passed: requiresManualReview ? false : passed,
          status: requiresManualReview ? "submitted" : "graded",
          graded_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", submissionId);

      await supabase.from("assessment_progress").upsert({
        id: `${claims.uid}_${submission.assessmentId}`,
        assessment_id: submission.assessmentId,
        user_id: claims.uid,
        course_id: submission.courseId,
        attempts: totalAttempts,
        best_score: newBestScore,
        best_percentage: newBestPercentage,
        passed: requiresManualReview
          ? false
          : newBestPercentage >= assessment.passingScore,
        last_attempt_at: nowIso,
        submissions: [
          ...(currentProgress?.submissions || []),
          submissionId,
        ] as any,
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed: requiresManualReview ? null : passed,
      requiresManualReview,
    };
  } catch (error) {
    console.error("Grade Assessment Error:", error);
    return { error: "Erro ao processar avaliação" };
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

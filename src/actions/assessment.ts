"use server";

import { auth, db, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import type {
  AssessmentDoc,
  StudentAnswer,
  AssessmentSubmissionDoc,
} from "@/types/assessment";
import type { UserData } from "@/types/user";

/**
 * Grade an assessment submission
 * Auto-grades multiple choice and true/false
 * Marks essays/practicals for manual review
 */
export async function gradeAssessment(submissionId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    // Rate limiting: Prevent spam submissions
    const rateLimitResult = rateLimit(
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
        return { ...answer, pointsEarned: 0 }; // Will be graded manually
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
      passed: requiresManualReview ? false : passed, // Don't mark as passed if needs review
      status: requiresManualReview ? "submitted" : "graded",
      gradedAt: Timestamp.now(),
    };

    await submissionRef.update(updateData);

    // Update user progress
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    // Calculate total points
    const totalPoints =
      data.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

    const assessmentRef = await adminDb.collection("assessments").add({
      ...data,
      totalPoints,
      status: data.status || "draft",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: claims.uid,
    });

    return { success: true, id: assessmentRef.id };
  } catch (error) {
    console.error("Create Assessment Error:", error);
    return { error: "Erro ao criar avaliação" };
  }
}

/**
 * Update an existing assessment (Admin only)
 */
export async function updateAssessment(
  id: string,
  data: Partial<AssessmentDoc>,
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    // Calculate total points
    const totalPoints =
      data.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

    await adminDb
      .collection("assessments")
      .doc(id)
      .update({
        ...data,
        totalPoints,
        updatedAt: Timestamp.now(),
      });

    // Audit
    await import("@/services/auditService").then((m) =>
      m.auditService.logEvent({
        eventType: "ASSESSMENT_UPDATED",
        actor: { uid: claims.uid, email: claims.email },
        target: { id, collection: "assessments" },
      }),
    );

    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Error:", error);
    return { error: "Erro ao atualizar avaliação" };
  }
}

export async function deleteAssessment(id: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    await adminDb.collection("assessments").doc(id).delete();

    // Audit
    await import("@/services/auditService").then((m) =>
      m.auditService.logEvent({
        eventType: "ASSESSMENT_DELETED",
        actor: { uid: claims.uid, email: claims.email },
        target: { id, collection: "assessments" },
      }),
    );

    revalidatePath("/admin/assessments");
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    await adminDb.collection("assessments").doc(id).update({
      status,
      updatedAt: Timestamp.now(),
    });

    // Audit
    await import("@/services/auditService").then((m) =>
      m.auditService.logEvent({
        eventType: "ASSESSMENT_STATUS_UPDATED",
        actor: { uid: claims.uid, email: claims.email },
        target: { id, collection: "assessments" },
        payload: { status },
      }),
    );

    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Status Error:", error);
    return { error: "Erro ao atualizar status da avaliação" };
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) return null;

    const subSnap = await adminDb
      .collection("assessmentSubmissions")
      .doc(id)
      .get();
    if (!subSnap.exists) return null;

    const data = subSnap.data() as AssessmentSubmissionDoc;

    // Fetch associated data
    const [userSnap, assessmentSnap] = await Promise.all([
      adminDb.collection("users").doc(data.userId).get(),
      adminDb.collection("assessments").doc(data.assessmentId).get(),
    ]);

    return {
      submission: { id: subSnap.id, ...data },
      user: userSnap.exists
        ? ({ uid: userSnap.id, ...userSnap.data() } as UserData)
        : null,
      assessment: assessmentSnap.exists
        ? ({ id: assessmentSnap.id, ...assessmentSnap.data() } as AssessmentDoc)
        : null,
    };
  } catch (error) {
    console.error("Get Submission Detail Error:", error);
    return null;
  }
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden" };
    }

    const subRef = adminDb
      .collection("assessmentSubmissions")
      .doc(submissionId);
    const subSnap = await subRef.get();
    if (!subSnap.exists) return { error: "Submissão não encontrada" };

    const submission = subSnap.data() as AssessmentSubmissionDoc;

    // Get assessment for passing score rules
    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(submission.assessmentId)
      .get();
    if (!assessmentSnap.exists) return { error: "Avaliação não encontrada" };
    const assessment = assessmentSnap.data() as AssessmentDoc;

    // Calculate totals
    const totalScore = gradingData.answers.reduce(
      (sum, a) => sum + (a.pointsEarned || 0),
      0,
    );
    const totalPossiblePoints = assessment.totalPoints || 100;
    const percentage = (totalScore / totalPossiblePoints) * 100;
    const passed = percentage >= assessment.passingScore;

    const updateData = {
      answers: gradingData.answers,
      score: totalScore,
      percentage,
      passed,
      status: "graded" as const,
      feedback: gradingData.feedback || "",
      gradedBy: claims.uid,
      gradedAt: Timestamp.now(),
    };

    await subRef.update(updateData);

    // Update user progress
    const progressRef = adminDb
      .collection("users")
      .doc(submission.userId)
      .collection("assessmentProgress")
      .doc(submission.assessmentId);

    const progressSnap = await progressRef.get();
    const currentProgress = progressSnap.exists ? progressSnap.data() : null;

    const newBestPercentage = Math.max(
      percentage,
      currentProgress?.bestPercentage || 0,
    );
    const newBestScore = Math.max(totalScore, currentProgress?.bestScore || 0);

    await progressRef.set(
      {
        assessmentId: submission.assessmentId,
        userId: submission.userId,
        courseId: submission.courseId,
        bestScore: newBestScore,
        bestPercentage: newBestPercentage,
        passed: newBestPercentage >= assessment.passingScore,
        lastAttemptAt: Timestamp.now(),
      },
      { merge: true },
    );

    revalidatePath(`/admin/assessments/submissions/${submissionId}`);
    revalidatePath("/admin/assessments/submissions");

    return { success: true };
  } catch (error) {
    console.error("Save Manual Grading Error:", error);
    return { error: "Erro ao salvar correção" };
  }
}

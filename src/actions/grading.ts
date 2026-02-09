"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import type { AssessmentSubmissionDoc } from "@/types/assessment";

/**
 * Manual grading for essay and practical questions
 * Admin only
 */
export async function manualGradeSubmission(
  submissionId: string,
  questionGrades: { questionId: string; pointsEarned: number }[],
  feedback?: string,
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

    // Rate limiting
    const rateLimitResult = rateLimit(
      claims.uid,
      "manualGrade",
      { maxRequests: 50, windowMs: 60000 }, // 50 grades per minute
    );

    if (!rateLimitResult.allowed) {
      const waitSeconds = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000,
      );
      return {
        error: `Limite de correções excedido. Aguarde ${waitSeconds}s.`,
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

    // Get assessment
    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(submission.assessmentId)
      .get();

    if (!assessmentSnap.exists) {
      return { error: "Avaliação não encontrada" };
    }

    const assessment = assessmentSnap.data();

    // Update manual grades
    const updatedAnswers = submission.answers.map((answer) => {
      const grade = questionGrades.find(
        (g) => g.questionId === answer.questionId,
      );
      if (grade) {
        return {
          ...answer,
          pointsEarned: grade.pointsEarned,
          isCorrect: grade.pointsEarned > 0,
        };
      }
      return answer;
    });

    // Recalculate total score
    const totalScore = updatedAnswers.reduce(
      (sum, ans) => sum + (ans.pointsEarned || 0),
      0,
    );
    const percentage =
      assessment.totalPoints > 0
        ? (totalScore / assessment.totalPoints) * 100
        : 0;
    const passed = percentage >= assessment.passingScore;

    // Update submission
    await submissionRef.update({
      answers: updatedAnswers,
      score: totalScore,
      percentage,
      passed,
      status: "graded",
      gradedBy: claims.uid,
      gradedAt: Timestamp.now(),
      feedback: feedback || "",
    });

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
        attempts: currentProgress?.attempts || submission.attemptNumber,
        bestScore: newBestScore,
        bestPercentage: newBestPercentage,
        passed: newBestPercentage >= assessment.passingScore,
        lastAttemptAt: Timestamp.now(),
        submissions: currentProgress?.submissions || [submissionId],
      },
      { merge: true },
    );

    // Send notification to student
    const notificationRef = adminDb
      .collection("users")
      .doc(submission.userId)
      .collection("notifications")
      .doc();

    await notificationRef.set({
      title: passed ? "✅ Avaliação Aprovada!" : "📝 Avaliação Corrigida",
      body: passed
        ? `Parabéns! Você foi aprovado(a) em "${assessment.title}" com ${percentage.toFixed(1)}%`
        : `Sua avaliação "${assessment.title}" foi corrigida. Nota: ${percentage.toFixed(1)}%`,
      link: `/portal/courses/${submission.courseId}/assessments/${submission.assessmentId}`,
      type: "assessment_graded",
      isRead: false,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      score: totalScore,
      totalPoints: assessment.totalPoints,
      percentage,
      passed,
    };
  } catch (error) {
    console.error("Manual Grade Error:", error);
    return { error: "Erro ao corrigir avaliação" };
  }
}

/**
 * Get all pending submissions for grading
 * Admin only
 */
export async function getPendingSubmissions(courseId?: string) {
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

    let query = adminDb
      .collection("assessmentSubmissions")
      .where("status", "==", "submitted")
      .orderBy("submittedAt", "desc")
      .limit(50);

    if (courseId) {
      query = query.where("courseId", "==", courseId);
    }

    const snapshot = await query.get();

    const submissions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch user details
        const userSnap = await adminDb
          .collection("users")
          .doc(data.userId)
          .get();
        const userData = userSnap.data();

        // Fetch assessment details
        const assessmentSnap = await adminDb
          .collection("assessments")
          .doc(data.assessmentId)
          .get();
        const assessmentData = assessmentSnap.data();

        return {
          id: doc.id,
          ...data,
          studentName: userData?.displayName || "Anônimo",
          studentEmail: userData?.email || "",
          assessmentTitle: assessmentData?.title || "Sem título",
          submittedAtDate: data.submittedAt?.toDate().toISOString(),
        };
      }),
    );

    return { submissions };
  } catch (error) {
    console.error("Get Pending Submissions Error:", error);
    return { error: "Erro ao buscar submissões" };
  }
}

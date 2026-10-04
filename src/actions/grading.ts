"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { createNotification } from "@/features/notifications/infrastructure/supabaseNotificationRepository.server";
import type { AssessmentSubmissionDoc } from "@/types/assessment";
import { awardCanonicalCompletion } from "@/features/gamification/application/awardCanonicalGamification.server";

async function requireAdminSession() {
  const session = await verifySession();
  if (session && session.isAdmin) {
    return {
      uid: session.uid,
      email: session.email,
      role: session.role || "admin",
    };
  }

  // Fallback for tests or legacy cookies
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (sessionCookie && auth?.verifySessionCookie) {
      const claims = await auth.verifySessionCookie(sessionCookie, true);
      if (claims.role === "admin" || claims.admin === true) {
        return claims;
      }
    }
  } catch {
    // ignore
  }

  throw new Error("Forbidden: Admins only");
}

/**
 * Manual grading for essay and practical questions
 * Admin only
 */
export async function manualGradeSubmission(
  submissionId: string,
  questionGrades: { questionId: string; pointsEarned: number }[],
  feedback?: string,
) {
  try {
    const claims = await requireAdminSession();

    // Rate limiting
    const rateLimitResult = await rateLimit(claims.uid, "manualGrade", {
      maxRequests: 50,
      windowMs: 60000,
    });

    if (!rateLimitResult.allowed) {
      const waitSeconds = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000,
      );
      return {
        error: `Limite de correções excedido. Aguarde ${waitSeconds}s.`,
      };
    }

    // Get submission from Firestore
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
    const totalPoints = assessment.totalPoints || 100;
    const percentage =
      totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const passed = percentage >= assessment.passingScore;

    // Update submission in Firestore
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

    // Update user progress in Firestore
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

    // Sync to Supabase
    try {
      const supabase = createSupabaseServiceClient();
      const nowIso = new Date().toISOString();

      await supabase
        .from("assessment_submissions")
        .update({
          answers: updatedAnswers as any,
          score: totalScore,
          percentage,
          passed,
          status: "graded",
          graded_by: claims.uid,
          graded_at: nowIso,
          updated_at: nowIso,
          feedback: feedback || null,
        })
        .eq("id", submissionId);

      await supabase.from("assessment_progress").upsert({
        id: `${submission.userId}_${submission.assessmentId}`,
        assessment_id: submission.assessmentId,
        user_id: submission.userId,
        course_id: submission.courseId,
        attempts: currentProgress?.attempts || submission.attemptNumber,
        best_score: newBestScore,
        best_percentage: newBestPercentage,
        passed: newBestPercentage >= assessment.passingScore,
        last_attempt_at: nowIso,
        submissions: (currentProgress?.submissions || [submissionId]) as any,
      });

      // Send notification to student via Supabase
      await createNotification(
        submission.userId,
        {
          title: passed ? "✅ Avaliação Aprovada!" : "📝 Avaliação Corrigida",
          body: passed
            ? `Parabéns! Você foi aprovado(a) em "${assessment.title}" com ${percentage.toFixed(1)}%`
            : `Sua avaliação "${assessment.title}" foi corrigida. Nota: ${percentage.toFixed(1)}%`,
          link: `/portal/courses/${submission.courseId}/assessments/${submission.assessmentId}`,
          type: "course_update",
        },
        supabase as any,
      );
    } catch {
      // ignore
    }

    // Award XP if passed
    if (passed) {
      await awardCanonicalCompletion(submission.userId, {
        kind: "quiz",
        courseId: submission.courseId,
        submissionId,
      });
    }

    return {
      success: true,
      score: totalScore,
      totalPoints,
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
  try {
    await requireAdminSession();

    // Try Supabase first
    try {
      const supabase = createSupabaseServiceClient();
      let subQuery = supabase
        .from("assessment_submissions")
        .select("*")
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false })
        .limit(50);

      if (courseId) {
        subQuery = subQuery.eq("course_id", courseId);
      }

      const { data: subData, error: subError } = await subQuery;

      if (!subError && subData && subData.length > 0) {
        const userIds = [...new Set(subData.map((s) => s.user_id).filter(Boolean))];
        const assessIds = [...new Set(subData.map((s) => s.assessment_id).filter(Boolean))];

        const [{ data: profiles }, { data: assessments }] = await Promise.all([
          supabase.from("profiles").select("id, display_name, email").in("id", userIds as string[]),
          supabase.from("assessments").select("id, title").in("id", assessIds as string[]),
        ]);

        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
        const assessMap = new Map((assessments || []).map((a) => [a.id, a]));

        return {
          submissions: subData.map((s) => ({
            id: s.id,
            assessmentId: s.assessment_id,
            userId: s.user_id,
            courseId: s.course_id,
            attemptNumber: s.attempt_number,
            answers: s.answers,
            status: s.status,
            studentName: profileMap.get(s.user_id || "")?.display_name || "Anônimo",
            studentEmail: profileMap.get(s.user_id || "")?.email || "",
            assessmentTitle: assessMap.get(s.assessment_id)?.title || "Sem título",
            submittedAtDate: s.submitted_at || undefined,
          })),
        };
      }
    } catch {
      // fallback
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

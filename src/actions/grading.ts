"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rateLimit";
import { gamificationService } from "@/lib/gamification/gamificationService";
import { XP_VALUES } from "@/lib/gamification";
import type { AssessmentDoc, StudentAnswer } from "@/types/assessment";

type QuestionGrade = { questionId: string; pointsEarned: number };

function asAssessment(row: any): AssessmentDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description || "",
    questions: Array.isArray(row.questions) ? row.questions : [],
    passingScore: Number(row.passing_score),
    totalPoints: Number(row.total_points),
    status: row.status,
  } as AssessmentDoc;
}

/** Manual grading for essay and practical questions. Admin only. */
export async function manualGradeSubmission(
  submissionId: string,
  questionGrades: QuestionGrade[],
  feedback?: string,
) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };
  if (!session.isAdmin) return { error: "Forbidden: Admins only" };

  const limited = await rateLimit(session.uid, "manualGrade", {
    maxRequests: 50,
    windowMs: 60_000,
  });
  if (!limited.allowed)
    return {
      error: `Limite de correções excedido. Aguarde ${Math.ceil((limited.resetAt - Date.now()) / 1000)}s.`,
    };

  try {
    const supabase = createSupabaseServiceClient();
    const { data: submission, error: submissionError } = await supabase
      .from("assessment_submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();
    if (submissionError) throw submissionError;
    if (!submission) return { error: "Submissão não encontrada" };
    if (!submission.user_id) return { error: "Submissão sem aluno vinculado" };

    const { data: assessmentRow, error: assessmentError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", submission.assessment_id)
      .maybeSingle();
    if (assessmentError) throw assessmentError;
    if (!assessmentRow) return { error: "Avaliação não encontrada" };
    const assessment = asAssessment(assessmentRow);
    const gradeByQuestion = new Map<string, number>();
    for (const grade of questionGrades) {
      if (!Number.isFinite(grade.pointsEarned) || grade.pointsEarned < 0)
        return { error: "Todas as notas devem ser números positivos." };
      if (gradeByQuestion.has(grade.questionId))
        return { error: "Há notas duplicadas para a mesma questão." };
      const question = assessment.questions.find(
        (item) => item.id === grade.questionId,
      );
      if (!question || !["essay", "practical"].includes(question.type))
        return {
          error:
            "Uma das questões informadas não pode ser corrigida manualmente.",
        };
      if (grade.pointsEarned > question.points)
        return {
          error: `A nota de "${question.title}" não pode exceder ${question.points}.`,
        };
      gradeByQuestion.set(grade.questionId, grade.pointsEarned);
    }

    const answers = (Array.isArray(submission.answers)
      ? submission.answers
      : []) as unknown as StudentAnswer[];
    const updatedAnswers = answers.map((answer) => {
      const pointsEarned = gradeByQuestion.get(answer.questionId);
      return pointsEarned === undefined
        ? answer
        : { ...answer, pointsEarned, isCorrect: pointsEarned > 0 };
    });
    const score = updatedAnswers.reduce(
      (total, answer) => total + Number(answer.pointsEarned || 0),
      0,
    );
    const percentage =
      assessment.totalPoints > 0 ? (score / assessment.totalPoints) * 100 : 0;
    const passed = percentage >= assessment.passingScore;
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("assessment_submissions")
      .update({
        answers: updatedAnswers as any,
        score,
        percentage,
        passed,
        status: "graded",
        graded_by: session.uid,
        graded_at: now,
        feedback: feedback?.trim() || null,
      })
      .eq("id", submissionId);
    if (updateError) throw updateError;

    const { data: progress, error: progressError } = await supabase
      .from("assessment_progress")
      .select("*")
      .eq("user_id", submission.user_id)
      .eq("assessment_id", submission.assessment_id)
      .maybeSingle();
    if (progressError) throw progressError;
    const submissions = Array.isArray(progress?.submissions)
      ? progress.submissions
      : [];
    if (!submissions.includes(submissionId)) submissions.push(submissionId);
    const { error: progressUpsertError } = await supabase
      .from("assessment_progress")
      .upsert(
        {
          id: progress?.id,
          assessment_id: submission.assessment_id,
          user_id: submission.user_id,
          course_id: submission.course_id,
          attempts: Math.max(
            Number(progress?.attempts || 0),
            submission.attempt_number,
          ),
          best_score: Math.max(Number(progress?.best_score || 0), score),
          best_percentage: Math.max(
            Number(progress?.best_percentage || 0),
            percentage,
          ),
          passed: Boolean(progress?.passed) || passed,
          last_attempt_at: now,
          submissions: submissions as any,
        } as any,
        { onConflict: "user_id,assessment_id" },
      );
    if (progressUpsertError) throw progressUpsertError;

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: submission.user_id,
        type: "assessment_graded",
        title: passed ? "✅ Avaliação aprovada!" : "📝 Avaliação corrigida",
        body: passed
          ? `Parabéns! Você foi aprovado(a) em "${assessment.title}" com ${percentage.toFixed(1)}%.`
          : `Sua avaliação "${assessment.title}" foi corrigida. Nota: ${percentage.toFixed(1)}%.`,
        link: `/portal/courses/${submission.course_id}/assessments/${submission.assessment_id}`,
        metadata: { assessmentId: submission.assessment_id, submissionId },
      });
    if (notificationError) throw notificationError;
    if (passed && !submission.passed) {
      await gamificationService.awardXp(
        submission.user_id,
        XP_VALUES.QUIZ_PASSED,
        "quiz_passed",
        {
          assessmentId: submission.assessment_id,
          courseId: submission.course_id,
        },
      );
    }
    await logAudit({
      action: "ASSESSMENT_MANUALLY_GRADED",
      actor: { uid: session.uid, email: session.email, role: session.role },
      target: {
        collection: "assessment_submissions",
        id: submissionId,
        summary: assessment.title,
      },
      diff: {
        before: {
          score: submission.score,
          percentage: submission.percentage,
          passed: submission.passed,
        },
        after: { score, percentage, passed },
      },
    });
    return {
      success: true,
      score,
      totalPoints: assessment.totalPoints,
      percentage,
      passed,
    };
  } catch (error) {
    console.error("Manual grade failed", error);
    return { error: "Erro ao corrigir avaliação" };
  }
}

/** Lists pending submissions with student and assessment labels for the legacy dashboard. */
export async function getPendingSubmissions(courseId?: string) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };
  if (!session.isAdmin) return { error: "Forbidden: Admins only" };
  try {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("assessment_submissions")
      .select("*")
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .limit(50);
    if (courseId) query = query.eq("course_id", courseId);
    const { data, error } = await query;
    if (error) throw error;
    const rows = data || [];
    const userIds = rows
      .map((row) => row.user_id)
      .filter((id): id is string => Boolean(id));
    const [profilesResult, assessmentsResult] = await Promise.all([
      userIds.length
        ? supabase
            .from("profiles")
            .select("id, display_name, email")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      rows.length
        ? supabase
            .from("assessments")
            .select("id, title")
            .in(
              "id",
              rows.map((row) => row.assessment_id),
            )
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (profilesResult.error) throw profilesResult.error;
    if (assessmentsResult.error) throw assessmentsResult.error;
    const profiles = new Map(
      (profilesResult.data || []).map((row) => [row.id, row]),
    );
    const assessments = new Map(
      (assessmentsResult.data || []).map((row) => [row.id, row]),
    );
    return {
      submissions: rows.map((row) => {
        const profile = row.user_id ? profiles.get(row.user_id) : undefined;
        return {
          id: row.id,
          assessmentId: row.assessment_id,
          assessmentTitle:
            assessments.get(row.assessment_id)?.title || "Sem título",
          studentName: profile?.display_name || "Anônimo",
          studentEmail: profile?.email || "",
          submittedAtDate: row.submitted_at || row.updated_at,
          answers: Array.isArray(row.answers) ? row.answers : [],
          score: Number(row.score),
          percentage: Number(row.percentage),
        };
      }),
    };
  } catch (error) {
    console.error("Get pending submissions failed", error);
    return { error: "Erro ao buscar submissões" };
  }
}

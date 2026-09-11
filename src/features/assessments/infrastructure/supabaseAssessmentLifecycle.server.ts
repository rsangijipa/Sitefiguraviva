import "server-only";

import { randomUUID } from "crypto";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { AssessmentDoc, StudentAnswer } from "@/types/assessment";

function gradeAnswers(assessment: AssessmentDoc, answers: StudentAnswer[]) {
  let totalPoints = 0;
  let earnedPoints = 0;
  let requiresManualReview = false;

  const gradedAnswers = answers.map((answer) => {
    const question = assessment.questions.find(
      (item) => item.id === answer.questionId,
    );
    if (!question) return answer;
    totalPoints += question.points;

    if (question.type === "multiple_choice" && answer.selectedOptions) {
      const correct = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id);
      const isCorrect =
        correct.length === answer.selectedOptions.length &&
        correct.every((id) => answer.selectedOptions!.includes(id));
      const pointsEarned = isCorrect ? question.points : 0;
      earnedPoints += pointsEarned;
      return { ...answer, isCorrect, pointsEarned };
    }

    if (question.type === "true_false" && answer.booleanAnswer !== undefined) {
      const isCorrect = answer.booleanAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      earnedPoints += pointsEarned;
      return { ...answer, isCorrect, pointsEarned };
    }

    if (question.type === "essay" || question.type === "practical") {
      requiresManualReview = true;
      return { ...answer, pointsEarned: 0 };
    }
    return answer;
  });

  const percentage = totalPoints ? (earnedPoints / totalPoints) * 100 : 0;
  return {
    gradedAnswers,
    totalPoints,
    earnedPoints,
    percentage,
    passed: percentage >= assessment.passingScore,
    requiresManualReview,
  };
}

async function updateProgress(input: {
  userId: string;
  assessmentId: string;
  courseId: string;
  submissionId: string;
  score: number;
  percentage: number;
  passed: boolean;
}) {
  const supabase = createSupabaseServiceClient();
  const { data: current, error: readError } = await supabase
    .from("assessment_progress")
    .select("*")
    .eq("user_id", input.userId)
    .eq("assessment_id", input.assessmentId)
    .maybeSingle();
  if (readError) throw readError;

  const submissions = Array.isArray(current?.submissions)
    ? current.submissions
    : [];
  const { error } = await supabase.from("assessment_progress").upsert(
    {
      id: current?.id || randomUUID(),
      assessment_id: input.assessmentId,
      user_id: input.userId,
      course_id: input.courseId,
      attempts: (current?.attempts || 0) + 1,
      best_score: Math.max(Number(current?.best_score || 0), input.score),
      best_percentage: Math.max(
        Number(current?.best_percentage || 0),
        input.percentage,
      ),
      passed: Boolean(current?.passed) || input.passed,
      last_attempt_at: new Date().toISOString(),
      submissions: [...submissions, input.submissionId],
    } as any,
    { onConflict: "user_id,assessment_id" },
  );
  if (error) throw error;
}

export async function startSupabaseAssessmentAttempt(
  userId: string,
  assessmentId: string,
  courseId: string,
) {
  const supabase = createSupabaseServiceClient();
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("course_id")
    .eq("id", assessmentId)
    .maybeSingle();
  if (assessmentError) throw assessmentError;
  if (!assessment || assessment.course_id !== courseId)
    return { error: "Curso da avaliação inválido" } as const;

  const { data: attempts, error: attemptError } = await supabase
    .from("assessment_submissions")
    .select("attempt_number")
    .eq("assessment_id", assessmentId)
    .eq("user_id", userId);
  if (attemptError) throw attemptError;
  const attemptNumber =
    Math.max(
      0,
      ...(attempts || []).map((item) => Number(item.attempt_number || 0)),
    ) + 1;
  const id = randomUUID();
  const { error } = await supabase.from("assessment_submissions").insert({
    id,
    assessment_id: assessmentId,
    user_id: userId,
    course_id: courseId,
    attempt_number: attemptNumber,
    answers: [],
    score: 0,
    percentage: 0,
    passed: false,
    status: "pending",
    started_at: new Date().toISOString(),
  } as any);
  if (error) throw error;
  return { success: true, submissionId: id } as const;
}

export async function submitSupabaseAssessmentAttempt(
  userId: string,
  submissionId: string,
  answers: StudentAnswer[],
) {
  const supabase = createSupabaseServiceClient();
  const { data: submission, error: readError } = await supabase
    .from("assessment_submissions")
    .select("user_id,status")
    .eq("id", submissionId)
    .maybeSingle();
  if (readError) throw readError;
  if (!submission) return { error: "Submissão não encontrada" } as const;
  if (submission.user_id !== userId) return { error: "Acesso negado" } as const;
  if (submission.status !== "pending")
    return { error: "Esta tentativa já foi enviada" } as const;
  const { error } = await supabase
    .from("assessment_submissions")
    .update({
      answers: answers as any,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("user_id", userId);
  if (error) throw error;
  return { success: true } as const;
}

export async function gradeSupabaseAssessmentAttempt(
  userId: string,
  submissionId: string,
) {
  const supabase = createSupabaseServiceClient();
  const { data: submission, error: submissionError } = await supabase
    .from("assessment_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();
  if (submissionError) throw submissionError;
  if (!submission) return { error: "Submissão não encontrada" } as const;
  if (submission.user_id !== userId) return { error: "Acesso negado" } as const;
  if (submission.status !== "submitted")
    return { error: "Submissão ainda não está pronta para correção" } as const;
  const { data: assessmentRow, error: assessmentError } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", submission.assessment_id)
    .maybeSingle();
  if (assessmentError) throw assessmentError;
  if (!assessmentRow) return { error: "Avaliação não encontrada" } as const;
  const assessment = {
    id: assessmentRow.id,
    courseId: assessmentRow.course_id,
    title: assessmentRow.title,
    description: assessmentRow.description || "",
    questions: assessmentRow.questions as unknown as AssessmentDoc["questions"],
    passingScore: Number(assessmentRow.passing_score),
    totalPoints: Number(assessmentRow.total_points),
    status: assessmentRow.status,
    isRequired: false,
    createdAt: assessmentRow.created_at,
    updatedAt: assessmentRow.updated_at,
    createdBy: assessmentRow.created_by || "",
  } as AssessmentDoc;
  const result = gradeAnswers(
    assessment,
    (submission.answers || []) as unknown as StudentAnswer[],
  );
  const passed = result.requiresManualReview ? false : result.passed;
  const { error: updateError } = await supabase
    .from("assessment_submissions")
    .update({
      answers: result.gradedAnswers as any,
      score: result.earnedPoints,
      percentage: result.percentage,
      passed,
      status: result.requiresManualReview ? "submitted" : "graded",
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("user_id", userId);
  if (updateError) throw updateError;
  await updateProgress({
    userId,
    assessmentId: submission.assessment_id,
    courseId: submission.course_id,
    submissionId,
    score: result.earnedPoints,
    percentage: result.percentage,
    passed,
  });
  return {
    success: true,
    score: result.earnedPoints,
    totalPoints: result.totalPoints,
    percentage: result.percentage,
    passed: result.requiresManualReview ? null : result.passed,
    requiresManualReview: result.requiresManualReview,
  } as const;
}

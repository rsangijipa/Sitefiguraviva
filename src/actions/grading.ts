"use server";

import { rateLimit } from "@/lib/rateLimit";
import { requireStaff } from "@/lib/auth/server";
import { assertCanAuthorCourse } from "@/lib/auth/authoring-gate";
import { recordLessonProgress } from "@/features/progress/application/recordLessonProgress.server";
import type { Question, StudentAnswer } from "@/types/assessment";
import type { Json } from "@/infrastructure/supabase/database.types";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { createNotification } from "@/features/notifications/infrastructure/supabaseNotificationRepository.server";
import { readSubmissionsPage } from "@/features/assessments/infrastructure/adminAssessmentQueries.server";
import { awardCanonicalCompletion } from "@/features/gamification/application/awardCanonicalGamification.server";

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
    await requireStaff();
    if (
      !/^[A-Za-z0-9_-]{1,200}$/.test(submissionId) ||
      !Array.isArray(questionGrades) ||
      questionGrades.length > 200 ||
      (feedback?.length ?? 0) > 20000
    )
      throw new Error("Invalid grading input");
    const supabase = createSupabaseServiceClient();
    const { data: submission, error: readError } = await supabase
      .from("assessment_submissions")
      .select(
        "id,user_id,course_id,assessment_id,answers,status,attempt_number,updated_at",
      )
      .eq("id", submissionId)
      .maybeSingle();
    if (readError) throw readError;
    if (
      !submission?.user_id ||
      !["submitted", "graded"].includes(submission.status)
    )
      throw new Error("Submission unavailable");
    const actor = await assertCanAuthorCourse(submission.course_id);
    const limited = await rateLimit(actor.uid, "manualGrade", {
      maxRequests: 50,
      windowMs: 60000,
    });
    if (!limited.allowed)
      return { error: "Limite de correções excedido. Aguarde um minuto." };
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("id,course_id,lesson_id,title,questions,passing_score")
      .eq("id", submission.assessment_id)
      .eq("course_id", submission.course_id)
      .maybeSingle();
    if (assessmentError) throw assessmentError;
    if (!assessment || !Array.isArray(assessment.questions))
      throw new Error("Assessment unavailable");
    const questions = assessment.questions as unknown as Question[];
    const grades = new Map(
      questionGrades.map((grade) => [grade.questionId, grade.pointsEarned]),
    );
    if (grades.size !== questionGrades.length)
      throw new Error("Duplicate grades");
    const manual = questions.filter(
      (question) => question.type === "essay" || question.type === "practical",
    );
    if (
      !manual.length ||
      grades.size !== manual.length ||
      manual.some((question) => !grades.has(question.id))
    )
      throw new Error("Grade every manual question exactly once");
    for (const question of manual) {
      const points = grades.get(question.id)!;
      if (!Number.isFinite(points) || points < 0 || points > question.points)
        throw new Error("Grade outside question bounds");
    }
    const previousAnswers = Array.isArray(submission.answers)
      ? (submission.answers as unknown as StudentAnswer[])
      : [];
    const answers = questions.map((question) => {
      if (!Number.isFinite(question.points) || question.points < 0)
        throw new Error("Invalid question points");
      const answer = previousAnswers.find(
        (item) => item.questionId === question.id,
      ) ?? { questionId: question.id };
      // Persisted objective scores can predate write hardening; recompute from the key.
      let isCorrect = false;
      let pointsEarned = 0;
      if (question.type === "multiple_choice") {
        const expected = question.options
          .filter((option) => option.isCorrect)
          .map((option) => option.id);
        const selected = answer.selectedOptions ?? [];
        isCorrect =
          Array.isArray(selected) &&
          expected.length > 0 &&
          selected.length === expected.length &&
          new Set(selected).size === selected.length &&
          (question.allowMultiple || selected.length <= 1) &&
          selected.every(
            (id) => typeof id === "string" && expected.includes(id),
          );
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === "true_false") {
        isCorrect =
          typeof answer.booleanAnswer === "boolean" &&
          answer.booleanAnswer === question.correctAnswer;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === "essay" || question.type === "practical") {
        pointsEarned = grades.get(question.id)!;
        isCorrect = pointsEarned > 0;
      } else throw new Error("Unsupported question type");
      return { ...answer, pointsEarned, isCorrect };
    });
    const totalPoints = questions.reduce(
      (sum, question) => sum + question.points,
      0,
    );
    if (totalPoints <= 0) throw new Error("Assessment has no points");
    const score = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= assessment.passing_score;
    const now = new Date().toISOString();
    const { data: written, error: writeError } = await supabase
      .from("assessment_submissions")
      .update({
        answers: answers as unknown as Json,
        score,
        percentage,
        passed,
        status: "graded",
        graded_by: actor.uid,
        graded_at: now,
        updated_at: now,
        feedback: feedback || null,
      })
      .eq("id", submissionId)
      .eq("updated_at", submission.updated_at)
      .select("id")
      .maybeSingle();
    if (writeError) throw writeError;
    if (!written) throw new Error("Submission changed; reload before grading");
    const { data: current, error: progressReadError } = await supabase
      .from("assessment_progress")
      .select("attempts,best_score,best_percentage,submissions,passed")
      .eq("user_id", submission.user_id)
      .eq("assessment_id", submission.assessment_id)
      .maybeSingle();
    if (progressReadError) throw progressReadError;
    const bestPercentage = Math.max(percentage, current?.best_percentage ?? 0);
    const { error: progressError } = await supabase
      .from("assessment_progress")
      .upsert(
        {
          user_id: submission.user_id,
          assessment_id: submission.assessment_id,
          course_id: submission.course_id,
          attempts: Math.max(submission.attempt_number, current?.attempts ?? 0),
          best_score: Math.max(score, current?.best_score ?? 0),
          best_percentage: bestPercentage,
          passed: bestPercentage >= assessment.passing_score,
          last_attempt_at: now,
          submissions: [
            ...new Set([
              ...(Array.isArray(current?.submissions)
                ? current.submissions.filter(
                    (id): id is string => typeof id === "string",
                  )
                : []),
              submissionId,
            ]),
          ],
          updated_at: now,
        },
        { onConflict: "user_id,assessment_id" },
      );
    if (progressError) throw progressError;
    let progressSaved = true;
    if (passed && assessment.lesson_id) {
      const [
        { data: lesson, error: lessonError },
        { data: enrollment, error: enrollmentError },
      ] = await Promise.all([
        supabase
          .from("lessons")
          .select("module_id")
          .eq("id", assessment.lesson_id)
          .eq("course_id", submission.course_id)
          .maybeSingle(),
        supabase
          .from("enrollments")
          .select("status,access_until")
          .eq("user_id", submission.user_id)
          .eq("course_id", submission.course_id)
          .maybeSingle(),
      ]);
      if (lessonError || enrollmentError) progressSaved = false;
      else if (
        lesson &&
        enrollment &&
        ["active", "completed"].includes(enrollment.status) &&
        (!enrollment.access_until ||
          new Date(enrollment.access_until).getTime() > Date.now())
      ) {
        try {
          await recordLessonProgress(submission.user_id, {
            courseId: submission.course_id,
            moduleId: lesson.module_id,
            lessonId: assessment.lesson_id,
            status: "completed",
            percent: 100,
          });
        } catch (error) {
          progressSaved = false;
          console.error("Manual grading lesson progress failed", error);
        }
      }
    }
    try {
      await createNotification(
        submission.user_id,
        {
          title: "Avaliação corrigida",
          body: assessment.title + ": " + percentage.toFixed(1) + "%",
          link: "/portal/course/" + submission.course_id,
          type: "course_update",
        },
        supabase,
      );
      if (passed)
        await awardCanonicalCompletion(submission.user_id, {
          kind: "quiz",
          courseId: submission.course_id,
          submissionId,
        });
    } catch (error) {
      console.error("Manual grading notification or award failed", error);
    }
    return {
      success: true,
      score,
      totalPoints,
      percentage,
      passed,
      progressSaved,
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
    const page = await readSubmissionsPage({
      status: "submitted",
      pageSize: 50,
      courseId,
    });
    if (!page.submissions.length) return { submissions: [] };
    const ids = [
      ...new Set(page.submissions.map((submission) => submission.assessmentId)),
    ];
    const { data: assessments, error } = await createSupabaseServiceClient()
      .from("assessments")
      .select("id,title")
      .in("id", ids);
    if (error) throw error;
    const titles = new Map(
      (assessments ?? []).map((assessment) => [
        assessment.id,
        assessment.title,
      ]),
    );
    return {
      submissions: page.submissions.map((submission) => ({
        ...submission,
        studentName: page.users[submission.userId]?.displayName || "Anônimo",
        studentEmail: page.users[submission.userId]?.email || "",
        assessmentTitle: titles.get(submission.assessmentId) || "Sem título",
        submittedAtDate:
          typeof submission.submittedAt === "string"
            ? submission.submittedAt
            : undefined,
      })),
    };
  } catch (error) {
    console.error("Get Pending Submissions Error:", error);
    return { error: "Erro ao buscar submissões" };
  }
}

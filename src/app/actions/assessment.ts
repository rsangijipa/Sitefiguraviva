"use server";

import { createHash } from "node:crypto";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { revalidatePath } from "next/cache";
import { markLessonCompleted } from "@/app/actions/progress";
import type { Question, StudentAnswer } from "@/types/assessment";
import type { Json } from "@/infrastructure/supabase/database.types";

async function context(assessmentId: string, raw: Record<string, unknown>) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(assessmentId))
    throw new Error("Assessment not found");
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    JSON.stringify(raw).length > 100000
  )
    throw new Error("Invalid answers");
  const supabase = createSupabaseServiceClient();
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("id,course_id,lesson_id,status,questions,passing_score")
    .eq("id", assessmentId)
    .maybeSingle();
  if (error) throw error;
  if (!assessment || assessment.status !== "published")
    throw new Error("Assessment unavailable");
  await assertCanAccessCourse(session.uid, assessment.course_id);
  const questions = assessment.questions as unknown as Question[];
  if (!Array.isArray(questions) || !questions.length)
    throw new Error("Assessment has no questions");
  const answers: StudentAnswer[] = questions.map((question) => {
    if (!Number.isFinite(question.points) || question.points < 0)
      throw new Error("Invalid assessment points");
    const value = raw[question.id];
    if (value === undefined) return { questionId: question.id };
    if (question.type === "multiple_choice") {
      const selectedOptions = Array.isArray(value) ? value : [value];
      if (
        selectedOptions.some(
          (option) =>
            typeof option !== "string" ||
            !question.options.some((item) => item.id === option),
        ) ||
        new Set(selectedOptions).size !== selectedOptions.length ||
        (!question.allowMultiple && selectedOptions.length > 1)
      )
        throw new Error("Invalid selected options");
      return { questionId: question.id, selectedOptions };
    }
    if (question.type === "true_false") {
      if (typeof value !== "boolean") throw new Error("Invalid boolean answer");
      return { questionId: question.id, booleanAnswer: value };
    }
    if (
      question.type === "practical" &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const file = value as Record<string, unknown>;
      if (
        typeof file.storagePath !== "string" ||
        file.storagePath.length > 600 ||
        typeof file.fileName !== "string" ||
        file.fileName.length > 120 ||
        typeof file.mimeType !== "string" ||
        file.mimeType.length > 150 ||
        !Number.isSafeInteger(file.fileSize) ||
        Number(file.fileSize) < 1 ||
        Number(file.fileSize) > 10 * 1024 * 1024 ||
        (file.textAnswer !== undefined &&
          (typeof file.textAnswer !== "string" ||
            file.textAnswer.length > 20000))
      )
        throw new Error("Invalid attachment");
      return {
        questionId: question.id,
        storagePath: file.storagePath,
        fileName: file.fileName,
        mimeType: file.mimeType,
        fileSize: Number(file.fileSize),
        ...(file.textAnswer !== undefined
          ? { textAnswer: file.textAnswer as string }
          : {}),
      };
    }
    if (typeof value !== "string" || value.length > 20000)
      throw new Error("Invalid text answer");
    return { questionId: question.id, textAnswer: value };
  });
  return { supabase, assessment, questions, answers, uid: session.uid };
}

async function draft(ctx: Awaited<ReturnType<typeof context>>) {
  const { supabase, assessment, uid } = ctx;
  const { data: last, error } = await supabase
    .from("assessment_submissions")
    .select("id,status,attempt_number,started_at,answers")
    .eq("user_id", uid)
    .eq("assessment_id", assessment.id)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (last?.status === "pending") return last;
  if (last) throw new Error("Attempt already submitted");
  const attempt = 1;
  // A stable UUID makes concurrent initial autosaves share the same attempt.
  const hex = createHash("sha256")
    .update(`${uid}:${assessment.id}:${attempt}`)
    .digest("hex");
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
  const { error: insertError } = await supabase
    .from("assessment_submissions")
    .upsert(
      {
        id,
        assessment_id: assessment.id,
        course_id: assessment.course_id,
        user_id: uid,
        attempt_number: attempt,
        status: "pending",
        answers: [],
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (insertError) throw insertError;
  return { id, status: "pending", attempt_number: attempt, answers: [] };
}

function assertAttachmentPaths(
  ctx: Awaited<ReturnType<typeof context>>,
  submissionId: string,
) {
  for (const answer of ctx.answers) {
    if (!answer.storagePath) continue;
    const prefix = `${ctx.uid}/${submissionId}/${answer.questionId}/`;
    const filename = answer.storagePath.slice(prefix.length);
    if (
      !answer.storagePath.startsWith(prefix) ||
      !/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(filename) ||
      filename.includes("..")
    )
      throw new Error("Invalid attachment ownership");
  }
}

/** Compatibility entry point for quiz players, using the same canonical draft. */
export async function startAttempt(assessmentId: string, courseId: string) {
  const ctx = await context(assessmentId, {});
  if (ctx.assessment.course_id !== courseId)
    throw new Error("Curso da avaliação inválido");
  const pending = await draft(ctx);
  return {
    success: true,
    submissionId: pending.id,
    answers: pending.answers as unknown as StudentAnswer[],
  };
}

export async function saveDraft(
  assessmentId: string,
  raw: Record<string, unknown>,
) {
  const ctx = await context(assessmentId, raw);
  const pending = await draft(ctx);
  assertAttachmentPaths(ctx, pending.id);
  const savedAt = new Date().toISOString();
  const { data, error } = await ctx.supabase
    .from("assessment_submissions")
    .update({ answers: ctx.answers as unknown as Json, updated_at: savedAt })
    .eq("id", pending.id)
    .eq("user_id", ctx.uid)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Attempt already submitted");
  return { success: true, savedAt };
}

export async function submitAssessment(
  assessmentId: string,
  raw: Record<string, unknown>,
  expectedSubmissionId?: string,
) {
  const ctx = await context(assessmentId, raw);
  const pending = await draft(ctx);
  if (expectedSubmissionId && pending.id !== expectedSubmissionId)
    throw new Error("Attempt mismatch");
  assertAttachmentPaths(ctx, pending.id);
  let score = 0;
  let total = 0;
  let requiresManualGrading = false;
  for (const question of ctx.questions) {
    const answer = ctx.answers.find((item) => item.questionId === question.id)!;
    total += question.points;
    let correct = false;
    if (question.type === "multiple_choice") {
      const expected = question.options
        .filter((item) => item.isCorrect)
        .map((item) => item.id);
      const selected = answer.selectedOptions ?? [];
      correct =
        expected.length > 0 &&
        selected.length === expected.length &&
        selected.every((id) => expected.includes(id));
    } else if (question.type === "true_false") {
      correct =
        answer.booleanAnswer !== undefined &&
        answer.booleanAnswer === question.correctAnswer;
    } else requiresManualGrading = true;
    answer.isCorrect = correct;
    answer.pointsEarned = correct ? question.points : 0;
    score += answer.pointsEarned;
  }
  if (total <= 0) throw new Error("Assessment has no points");
  const grade = (score / total) * 100;
  const passed =
    !requiresManualGrading && grade >= ctx.assessment.passing_score;
  const now = new Date().toISOString();
  const { data, error } = await ctx.supabase
    .from("assessment_submissions")
    .update({
      answers: ctx.answers as unknown as Json,
      score,
      percentage: grade,
      passed,
      status: requiresManualGrading ? "submitted" : "graded",
      submitted_at: now,
      graded_at: requiresManualGrading ? null : now,
      updated_at: now,
    })
    .eq("id", pending.id)
    .eq("user_id", ctx.uid)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Attempt already submitted");
  const { error: progressError } = await ctx.supabase
    .from("assessment_progress")
    .upsert(
      {
        user_id: ctx.uid,
        assessment_id: ctx.assessment.id,
        course_id: ctx.assessment.course_id,
        attempts: pending.attempt_number,
        best_score: score,
        best_percentage: grade,
        passed,
        last_attempt_at: now,
        submissions: [data.id],
        updated_at: now,
      },
      { onConflict: "user_id,assessment_id" },
    );
  if (progressError)
    console.error("Assessment progress summary could not be saved");
  let progressSaved = !progressError;
  if (passed && ctx.assessment.lesson_id) {
    const { data: lesson, error: lessonError } = await ctx.supabase
      .from("lessons")
      .select("module_id")
      .eq("id", ctx.assessment.lesson_id)
      .eq("course_id", ctx.assessment.course_id)
      .maybeSingle();
    if (lessonError || !lesson) progressSaved = false;
    else {
      const result = await markLessonCompleted(
        ctx.assessment.course_id,
        lesson.module_id,
        ctx.assessment.lesson_id,
      );
      progressSaved = progressSaved && result.success;
    }
  }
  revalidatePath(`/portal/course/${ctx.assessment.course_id}`);
  return {
    success: true,
    submissionId: data.id,
    grade,
    passed,
    requiresManualGrading,
    progressSaved,
  };
}

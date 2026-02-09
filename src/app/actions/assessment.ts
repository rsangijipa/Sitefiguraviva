"use server";

import { auth, db } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import {
  AssessmentDoc,
  AssessmentSubmissionDoc,
  Question,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
} from "@/types/assessment";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { gamificationService } from "@/lib/gamification/gamificationService";
import { XP_VALUES } from "@/lib/gamification";

// Helper: Verify Auth
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthorized");

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch {
    throw new Error("Unauthorized");
  }
}

// Action: Save Draft (Autosave)
export async function saveDraft(
  assessmentId: string,
  answers: Record<string, any>,
) {
  const uid = await getAuthenticatedUser();
  const submissionId = `${uid}_${assessmentId}_draft`; // Simple ID strategy for draft

  // Upsert draft
  await db.collection("submissions").doc(submissionId).set(
    {
      assessmentId,
      userId: uid,
      status: "pending", // Changed from 'in_progress' to 'pending' to match AssessmentSubmissionDoc
      answers: [], // TODO: Map Record<string, any> to StudentAnswer[]
      // We are storing raw answers for draft, but for strict type compliance we might need to adjust.
      // For now, using merge: true allows partial data which might not fully validate against Submission doc if we were strict,
      // but Firestore is schemaless so this is fine for the draft document.
      draftAnswers: answers,
      lastSavedAt: FieldValue.serverTimestamp(),
      attemptNumber: 1, // TODO: Handle multi-attempt logic later
    },
    { merge: true },
  );

  return { success: true, savedAt: new Date().toISOString() };
}

// Action: Submit & Grade
export async function submitAssessment(
  assessmentId: string,
  userAnswers: Record<string, any>,
) {
  const uid = await getAuthenticatedUser();

  // 1. Fetch Source of Truth (Assessment with Correct Answers)
  const assessmentDoc = await db
    .collection("assessments")
    .doc(assessmentId)
    .get();
  if (!assessmentDoc.exists) throw new Error("Assessment not found");

  const assessment = assessmentDoc.data() as AssessmentDoc;

  // 2. Grading Logic
  let totalScore = 0;
  let maxScore = 0;
  const feedback: Record<string, { correct: boolean; score: number }> = {};
  let requiresManualGrading = false;

  // We assume questions are embedded
  const questions = assessment.questions || [];

  questions.forEach((q: Question) => {
    const answerVal = userAnswers[q.id];
    maxScore += q.points;

    let earned = 0;
    let isCorrect = false;

    if (q.type === "multiple_choice") {
      const mcq = q as MultipleChoiceQuestion;
      // Logic for Multiple Choice
      if (mcq.allowMultiple) {
        // Multiple correct answers allowed
        const correctIds = mcq.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);
        // Ensure answerVal is array and matches exactly (ignoring order)
        if (
          Array.isArray(answerVal) &&
          answerVal.length === correctIds.length &&
          answerVal.every((v: any) => correctIds.includes(v))
        ) {
          earned = q.points;
          isCorrect = true;
        }
      } else {
        // Single choice (behaved like 'single_choice' in old code)
        const correctOption = mcq.options.find((o) => o.isCorrect);
        if (correctOption && answerVal === correctOption.id) {
          earned = q.points;
          isCorrect = true;
        }
      }
    } else if (q.type === "true_false") {
      const tfq = q as TrueFalseQuestion;
      if (answerVal === tfq.correctAnswer) {
        earned = q.points;
        isCorrect = true;
      }
    } else if (q.type === "essay" || q.type === "practical") {
      requiresManualGrading = true;
      // No auto points for manual grading types
    }

    totalScore += earned;
    feedback[q.id] = { correct: isCorrect, score: earned };
  });

  const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const passed = percent >= (assessment.passingScore || 70);

  // 3. Save Submission
  const submissionId = `${uid}_${assessmentId}_${Date.now()}`; // Unique for history

  // Convert record to StudentAnswer[]
  const answersList = Object.entries(userAnswers).map(([qId, val]) => {
    // This is a simplification. Ideally we map based on question type.
    return {
      questionId: qId,
      // We'd popuplate fields based on type, but for now putting raw value where we can or extending type
      // Since StudentAnswer interface is specific, let's try to fit it:
      selectedOptions: Array.isArray(val)
        ? val
        : typeof val === "string"
          ? [val]
          : undefined,
      booleanAnswer: typeof val === "boolean" ? val : undefined,
      textAnswer: typeof val === "string" ? val : undefined,
      // Note: practical fileUrl handling needs more logic
    };
  });

  const submission: AssessmentSubmissionDoc = {
    id: submissionId,
    assessmentId,
    userId: uid,
    courseId: assessment.courseId,
    attemptNumber: 1, // Logic needed to increment
    status: requiresManualGrading ? "submitted" : "graded",
    answers: answersList,
    score: totalScore,
    percentage: percent,
    passed,
    submittedAt: Timestamp.now(),
    startedAt: Timestamp.now(), // placeholder, should be passed from client or fetched from draft
  };

  await db.collection("submissions").doc(submissionId).set(submission);

  // 4. Update Draft to Closed? (Or just delete it)
  await db
    .collection("submissions")
    .doc(`${uid}_${assessmentId}_draft`)
    .delete();

  // 5. Update Enrollment/Progress via Event Bus
  // This is the "Total Sync" pattern
  try {
    const { publishEvent } = await import("@/lib/events/bus"); // Dynamic import to avoid cycles if any

    await publishEvent({
      type: "ASSESSMENT_GRADED",
      actorUserId: uid,
      targetId: submissionId,
      context: {
        assessmentId: assessmentId,
        courseId: assessment.courseId,
        moduleId: assessment.moduleId || "unknown",
      },
      payload: {
        submittedAt: submission.submittedAt as any,
        grade: percent,
        passed,
        score: totalScore,
      },
    });
  } catch (e) {
    console.error("Failed to publish event", e);
  }

  // 6. Award XP if passed and auto-graded
  if (passed && !requiresManualGrading) {
    await gamificationService.awardXp(
      uid,
      XP_VALUES.QUIZ_PASSED,
      "quiz_passed",
      { assessmentId, courseId: assessment.courseId },
    );
  }

  return {
    success: true,
    submissionId,
    grade: percent,
    passed,
    requiresManualGrading,
  };
}

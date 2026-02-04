
"use server";

import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { Answer, Assessment, Question, Submission } from '@/types/assessment';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Helper: Verify Auth
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) throw new Error("Unauthorized");

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        return decodedClaims.uid;
    } catch {
        throw new Error("Unauthorized");
    }
}

// Action: Save Draft (Autosave)
export async function saveDraft(assessmentId: string, answers: Record<string, any>) {
    const uid = await getAuthenticatedUser();
    const submissionId = `${uid}_${assessmentId}_draft`; // Simple ID strategy for draft

    // Upsert draft
    await db.collection('submissions').doc(submissionId).set({
        assessmentId,
        userId: uid,
        status: 'in_progress',
        answers,
        lastSavedAt: FieldValue.serverTimestamp(),
        attemptNumber: 1 // TODO: Handle multi-attempt logic later
    }, { merge: true });

    return { success: true, savedAt: new Date().toISOString() };
}

// Action: Submit & Grade
export async function submitAssessment(assessmentId: string, userAnswers: Record<string, any>) {
    const uid = await getAuthenticatedUser();

    // 1. Fetch Source of Truth (Assessment with Correct Answers)
    const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
    if (!assessmentDoc.exists) throw new Error("Assessment not found");

    const assessment = assessmentDoc.data() as Assessment; // Assumes Admin SDK returns full data including answers

    // 2. Grading Logic
    let totalScore = 0;
    let maxScore = 0;
    const feedback: Record<string, { correct: boolean, score: number }> = {};
    let requiresManualGrading = false;

    // We assume questions are embedded or we fetch them if separate collection
    // For this MVP, assuming embedded in 'questions' field or fetched via helper
    const questions = assessment.questions || [];

    questions.forEach((q: Question) => {
        const answerVal = userAnswers[q.id];
        maxScore += q.points;

        let earned = 0;
        let isCorrect = false;

        if (q.type === 'multiple_choice' || q.type === 'single_choice') {
            // Check against options
            // Note: In a real secure system, we'd check against a separate 'answers' map or stripped field
            // Here assuming options have 'isCorrect' flag safe in Firestore (not sent to client usually)

            // Logic for Single Choice
            if (q.type === 'single_choice') {
                const correctOption = q.options.find(o => o.isCorrect);
                if (correctOption && answerVal === correctOption.id) {
                    earned = q.points;
                    isCorrect = true;
                }
            }
            // Logic for Multiple Choice (All or Nothing for MVP)
            else if (q.type === 'multiple_choice') {
                const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
                // Ensure answerVal is array and matches exactly (ignoring order)
                if (Array.isArray(answerVal) &&
                    answerVal.length === correctIds.length &&
                    answerVal.every(v => correctIds.includes(v))) {
                    earned = q.points;
                    isCorrect = true;
                }
            }
        }
        else if (q.type === 'text') {
            requiresManualGrading = true;
            // No auto points for text
        }

        totalScore += earned;
        feedback[q.id] = { correct: isCorrect, score: earned };
    });

    const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percent >= (assessment.passingScore || 70);

    // 3. Save Submission
    const submissionId = `${uid}_${assessmentId}_${Date.now()}`; // Unique for history
    const submission: Partial<Submission> = {
        id: submissionId,
        assessmentId,
        userId: uid,
        attemptNumber: 1, // Logic needed to increment
        status: requiresManualGrading ? 'submitted' : 'graded',
        answers: userAnswers as any, // Need to map to Answer interface properly if strict
        score: totalScore,
        grade: percent,
        passed,
        submittedAt: Timestamp.now() as any,
    };

    await db.collection('submissions').doc(submissionId).set(submission);

    // 4. Update Draft to Closed? (Or just delete it)
    await db.collection('submissions').doc(`${uid}_${assessmentId}_draft`).delete();

    // 5. Update Enrollment/Progress via Event Bus
    // This is the "Total Sync" pattern
    try {
        const { publishEvent } = await import('@/lib/events/bus'); // Dynamic import to avoid cycles if any

        await publishEvent({
            type: 'ASSESSMENT_GRADED',
            actorUserId: uid,
            targetId: submissionId,
            context: {
                assessmentId: assessmentId,
                courseId: assessment.courseId,
                moduleId: assessment.moduleId
            },
            payload: {
                submittedAt: submission.submittedAt as any,
                grade: percent,
                passed,
                score: totalScore
            }
        });
    } catch (e) {
        console.error("Failed to publish event", e);
        // Don't fail the request, just log. Consistency can be repaired later.
    }

    return {
        success: true,
        submissionId,
        grade: percent,
        passed,
        requiresManualGrading
    };
}

'use server';

import { auth, db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Updates the progress of a specific lesson for the current user.
 * Ensures usage of session cookies for security.
 */
export async function updateLessonProgress(
    courseId: string,
    moduleId: string, // Added for PRG-02
    lessonId: string,
    data: { status: 'completed' | 'in_progress'; percent?: number; maxWatchedSecond?: number } // Added for VP-02
) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        return { error: 'Unauthorized', status: 401 };
    }

    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        const uid = claims.uid;

        // PRG-02: Anti-Spoof / Existence Check
        // Verify lesson actually belongs to this course/module structure
        const lessonPath = `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
        const lessonRef = db.doc(lessonPath);
        const lessonSnap = await lessonRef.get();

        if (!lessonSnap.exists) {
            console.warn(`[Suspicious] User ${uid} attempted to update non-existent lesson ${lessonPath}`);
            return { error: 'Invalid lesson context', status: 400 };
        }

        const progressId = `${uid}_${courseId}_${lessonId}`;
        const enrollmentId = `${uid}_${courseId}`;

        const progressRef = db.collection('progress').doc(progressId);
        const enrollmentRef = db.collection('enrollments').doc(enrollmentId);

        // Run as transaction to update summary safely
        await db.runTransaction(async (t) => {
            const progressDoc = await t.get(progressRef);
            const enrollmentDoc = await t.get(enrollmentRef);

            // PRG-01: Strict Enrollment Check
            if (!enrollmentDoc.exists || enrollmentDoc.data()?.status !== 'active') {
                throw new Error('Enrollment inactive or not found.');
            }

            const now = FieldValue.serverTimestamp();
            const existingData = progressDoc.exists ? progressDoc.data() : null;
            const wasCompleted = existingData?.status === 'completed';
            const isCompleting = data.status === 'completed';

            // PRG-03: Idempotency & Non-Regression
            // If already completed, DO NOT overwrite completedAt
            const originalCompletedAt = existingData?.completedAt;

            // VP-02: Metrics Throttling/Merging
            // Keep maxWatchedSecond if new value is smaller
            const currentMax = existingData?.maxWatchedSecond || 0;
            const newMax = Math.max(currentMax, data.maxWatchedSecond || 0);

            // 1. Update/Create Progress Doc
            t.set(progressRef, {
                userId: uid,
                courseId,
                moduleId, // Useful for indexing
                lessonId,
                status: wasCompleted ? 'completed' : data.status, // Once completed, stay completed (unless explicit reset logic exist, but standard flow shouldn't regress)
                percent: isCompleting || wasCompleted ? 100 : (data.percent || 0),
                maxWatchedSecond: newMax, // Persist metric
                updatedAt: now,
                // Only set completedAt if completing NOW and wasn't before.
                // If it was already completed, keep the original.
                ...(isCompleting && !wasCompleted ? { completedAt: now } : (wasCompleted ? { completedAt: originalCompletedAt } : {}))
            }, { merge: true });

            // 2. Update Enrollment Summary if Status Changed from !Completed -> Completed
            if (isCompleting && !wasCompleted) {
                const enrollmentData = enrollmentDoc.data();
                const currentCompleted = (enrollmentData?.progressSummary?.completedLessonsCount || 0) + 1;

                // PRG-05: Calculate real percentage
                let totalLessons = enrollmentData?.progressSummary?.totalLessons || 0;

                // Fallback: If totalLessons is missing in enrollment, fetch from course
                if (totalLessons <= 0) {
                    const courseRef = db.collection('courses').doc(courseId);
                    const courseSnap = await t.get(courseRef);
                    totalLessons = courseSnap.data()?.stats?.lessonsCount || 0;
                }

                const newPercent = totalLessons > 0
                    ? Math.min(100, Math.round((currentCompleted / totalLessons) * 100))
                    : 0;

                t.update(enrollmentRef, {
                    'progressSummary.completedLessonsCount': currentCompleted,
                    'progressSummary.totalLessons': totalLessons,
                    'progressSummary.percent': newPercent,
                    'lastAccessedAt': now,
                    updatedAt: now
                });
            } else {
                // Just touch lastAccessed
                t.update(enrollmentRef, {
                    'lastAccessedAt': now,
                    updatedAt: now
                });
            }
        });

        revalidatePath(`/portal/curso/${courseId}`);
        return { success: true };

    } catch (error: any) {
        console.error("Update Progress Error:", error);
        return { error: error.message || 'Failed to update progress', status: 500 };
    }
}

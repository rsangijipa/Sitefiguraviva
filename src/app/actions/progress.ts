
"use server";

import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { publishEvent } from '@/lib/events/bus';

export async function completeLesson(courseId: string, lessonId: string) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) throw new Error("Unauthorized");

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch {
        throw new Error("Unauthorized");
    }

    // 1. Verify Enrollment Active (Security Guard)
    const enrollmentRef = db.collection('enrollments').doc(`${uid}_${courseId}`);
    const enrollmentSnap = await enrollmentRef.get();

    if (!enrollmentSnap.exists || enrollmentSnap.data()?.status !== 'active') {
        throw new Error("Enrollment not active or missing");
    }

    // 2. Update Progress (Direct Write)
    // Uses set with merge to create doc if missing, and merge deep fields
    const progressRef = db.collection('progress').doc(`${uid}_${courseId}`);

    await progressRef.set({
        userId: uid,
        courseId: courseId,
        lastAccessedAt: new Date(), // Using native Date for compatibility with client SDK types often used
        lessonProgress: {
            [lessonId]: {
                completed: true,
                completedAt: new Date().toISOString()
            }
        }
    }, { merge: true });

    // 3. Publish Event (Audit)
    await publishEvent({
        type: 'LESSON_COMPLETED',
        actorUserId: uid,
        targetId: lessonId,
        context: {
            courseId,
            lessonId
        },
        payload: {
            method: 'manual_completion'
        }
    });

    return { success: true };
}


"use server";

import { auth } from '@/lib/firebase/admin';
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

    // Publish Event
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

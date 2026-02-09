"use server";

import { adminDb, auth } from "@/lib/firebase/admin";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { publishEvent } from "@/lib/events/bus";

import { issueCertificate } from '@/app/actions/certificate';

// ...

export async function markLessonCompleted(courseId: string, moduleId: string, lessonId: string) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        throw new Error("Unauthorized");
    }

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch (e) {
        throw new Error("Unauthorized");
    }

    await assertCanAccessCourse(uid, courseId);

    try {
        // Use the new SSoT Service
        await import('@/lib/progress/progressService').then(m =>
            m.progressService.markLessonCompleted(uid, courseId, moduleId, lessonId)
        );

        revalidatePath(`/portal/course/${courseId}/lesson/${lessonId}`);
        revalidatePath(`/portal/course/${courseId}`);

        return { success: true };
    } catch (error) {
        console.error("Error marking lesson completed:", error);
        return { success: false, error: "Failed to update progress" };
    }
}

export async function updateLessonProgress(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: { status: 'in_progress' | 'completed'; percent?: number; maxWatchedSecond?: number }
) {
    // 1. Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) throw new Error("Unauthorized");

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch (e) {
        throw new Error("Unauthorized");
    }

    // 2. Access Gate
    await assertCanAccessCourse(uid, courseId);

    try {
        if (data.status === 'completed') {
            // Use the SSoT service for completion (triggers recalc)
            await import('@/lib/progress/progressService').then(m =>
                m.progressService.markLessonCompleted(uid, courseId, moduleId, lessonId)
            );
        } else {
            // Lightweight update for in-progress (video tracking)
            // We can keep this "fast" and not trigger full recalculation every second
            const progressRef = adminDb.collection('progress').doc(`${uid}_${courseId}_${lessonId}`);
            await progressRef.set({
                userId: uid,
                courseId,
                moduleId,
                lessonId,
                status: 'in_progress',
                updatedAt: FieldValue.serverTimestamp(),
                device: 'web',
                ...data
            }, { merge: true });
        }

        // Only revalidate if completed, to avoid thrashing
        if (data.status === 'completed') {
            revalidatePath(`/portal/course/${courseId}`);
            revalidatePath(`/portal/course/${courseId}/lesson/${lessonId}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating lesson progress:", error);
        return { success: false, error: "Failed to update progress" };
    }
}

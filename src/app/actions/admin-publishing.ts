'use server'

import { revalidatePath } from 'next/cache';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { assertIsTutorOrAdmin } from '@/lib/auth/authoring-gate';



async function hasContent(courseId: string) {
    const modulesSnap = await adminDb.collection('courses').doc(courseId).collection('modules').limit(1).get();
    if (modulesSnap.empty) return false;

    // Check if at least one module has lessons
    const firstModule = modulesSnap.docs[0];
    const lessonsSnap = await firstModule.ref.collection('lessons').limit(1).get();
    return !lessonsSnap.empty;
}

export async function toggleCourseStatus(courseId: string, currentStatus: string) {
    try {
        await assertIsTutorOrAdmin();
    } catch (e) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const newStatus = currentStatus === 'open' ? 'draft' : 'open';
        const isPublished = newStatus === 'open';

        if (isPublished) {
            const valid = await hasContent(courseId);
            if (!valid) {
                return { success: false, error: 'Cannot publish empty course. Add modules and lessons first.' };
            }
        }

        const updates: any = {
            status: newStatus,
            isPublished: isPublished,
            updatedAt: FieldValue.serverTimestamp()
        };

        if (isPublished) {
            updates.publishedAt = FieldValue.serverTimestamp();
        }

        await adminDb.collection('courses').doc(courseId).update(updates);

        // Revalidate all relevant paths
        revalidatePath('/admin/courses');
        revalidatePath('/');
        revalidatePath('/curso');
        revalidatePath(`/curso/${courseId}`);
        revalidatePath(`/portal/courses`); // Student dashboard

        return { success: true, newStatus, isPublished };
    } catch (error) {
        console.error('Failed to toggle course status:', error);
        return { success: false, error: 'Database update failed' };
    }
}

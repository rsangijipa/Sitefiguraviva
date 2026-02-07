'use server'

import { revalidatePath } from 'next/cache';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { verifySession } from '@/lib/auth/server';
import { FieldValue } from 'firebase-admin/firestore';

// Helper to check admin permission without redirecting
async function isAuthorizedAdmin() {
    const session = await verifySession();
    if (!session) return false;

    // 1. Custom Claims
    if (session.admin === true || session.role === 'admin') return true;

    // 2. Firestore Profile
    try {
        const doc = await adminDb.collection('users').doc(session.uid).get();
        const role = doc.data()?.role;
        return role === 'admin' || role === 'administrador';
    } catch (e) {
        console.error('Auth check failed:', e);
        return false;
    }
}

export async function toggleCourseStatus(courseId: string, currentStatus: string) {
    if (!await isAuthorizedAdmin()) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const newStatus = currentStatus === 'open' ? 'draft' : 'open';
        const isPublished = newStatus === 'open';

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

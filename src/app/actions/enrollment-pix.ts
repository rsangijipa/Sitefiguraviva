"use server";

import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { verifySession, requireAdmin } from '@/lib/auth/server';
import { FieldValue } from 'firebase-admin/firestore';
import { EnrollmentDoc, EnrollmentStatus } from '@/types/lms';
import { logAudit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * Aluno solicita acesso via PIX.
 * Cria uma matrícula com status 'pending'.
 */
export async function createEnrollmentPending(courseId: string) {
    const session = await verifySession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const uid = session.uid;

    const enrollmentId = `${uid}_${courseId}`;
    const enrollmentRef = adminDb.collection('enrollments').doc(enrollmentId);

    try {
        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(enrollmentRef);

            if (snap.exists) {
                const data = snap.data() as EnrollmentDoc;
                if (data.status === 'active' || data.status === 'completed') {
                    // Já possui acesso ou concluiu, não faz nada
                    return;
                }
                // Se estiver cancelado ou expirado, permitir re-solicitação? 
                // Para PIX, mantemos pending se já estiver pending.
                if (data.status === 'pending') return;
            }

            const newEnrollment: Partial<EnrollmentDoc> = {
                userId: uid,
                courseId: courseId,
                status: 'pending',
                paymentMethod: 'pix',
                createdAt: FieldValue.serverTimestamp() as any,
                updatedAt: FieldValue.serverTimestamp() as any,
            };

            tx.set(enrollmentRef, newEnrollment, { merge: true });
        });

        revalidatePath(`/curso/${courseId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create pending enrollment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Admin aprova matrícula PIX.
 */
export async function approvePixEnrollment(userId: string, courseId: string) {
    const adminSession = await requireAdmin();
    if (!adminSession) return { success: false, error: 'Unauthorized' };

    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = adminDb.collection('enrollments').doc(enrollmentId);

    try {
        const result = await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(enrollmentRef);
            if (!snap.exists) throw new Error('Enrollment not found');

            const data = snap.data() as EnrollmentDoc;
            if (data.status === 'active') return { alreadyActive: true };

            const approvalId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            const updates: Partial<EnrollmentDoc> = {
                status: 'active',
                paymentMethod: 'pix',
                paidAt: FieldValue.serverTimestamp() as any,
                approvedBy: adminSession.uid,
                approvedAt: FieldValue.serverTimestamp() as any,
                sourceRef: approvalId,
                updatedAt: FieldValue.serverTimestamp() as any,
            };

            tx.update(enrollmentRef, updates);

            return { success: true, updates };
        });

        if (result.success) {
            await logAudit({
                actor: { uid: adminSession.uid, email: adminSession.email, role: 'admin' },
                action: 'PIX_APPROVED',
                target: { collection: 'enrollments', id: enrollmentId, summary: `PIX approved for user ${userId}` },
                diff: { after: result.updates }
            });
            revalidatePath(`/admin/enrollments`);
            revalidatePath(`/portal/course/${courseId}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Failed to approve PIX:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Admin reprova matrícula PIX.
 */
export async function rejectPixEnrollment(userId: string, courseId: string, reason: string) {
    const adminSession = await requireAdmin();
    if (!adminSession) return { success: false, error: 'Unauthorized' };

    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = adminDb.collection('enrollments').doc(enrollmentId);

    try {
        const result = await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(enrollmentRef);
            if (!snap.exists) throw new Error('Enrollment not found');

            const updates: Partial<EnrollmentDoc> = {
                status: 'canceled',
                rejectionReason: reason,
                approvedBy: adminSession.uid, // "Decided by"
                approvedAt: FieldValue.serverTimestamp() as any,
                updatedAt: FieldValue.serverTimestamp() as any,
            };

            tx.update(enrollmentRef, updates);
            return { success: true, updates };
        });

        await logAudit({
            actor: { uid: adminSession.uid, email: adminSession.email, role: 'admin' },
            action: 'PIX_REJECTED',
            target: { collection: 'enrollments', id: enrollmentId, summary: `PIX rejected for user ${userId}: ${reason}` },
            diff: { after: result.updates }
        });

        revalidatePath(`/admin/enrollments`);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to reject PIX:', error);
        return { success: false, error: error.message };
    }
}

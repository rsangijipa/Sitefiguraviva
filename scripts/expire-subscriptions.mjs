import { adminDb } from '../src/lib/firebase/admin.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Script to find expired subscriptions and mark them as 'expired'.
 * Designed to be run as a cron job.
 */
async function expireSubscriptionsJob() {
    console.log('[JOB] Starting expireSubscriptionsJob...');
    const now = new Date();

    try {
        const expiredQuery = await adminDb.collection('enrollments')
            .where('status', '==', 'active')
            .where('paymentMethod', '==', 'subscription')
            .where('accessUntil', '<=', now)
            .get();

        if (expiredQuery.empty) {
            console.log('[JOB] No expired subscriptions found.');
            return;
        }

        console.log(`[JOB] Found ${expiredQuery.size} expired enrollments. Processing...`);

        const batch = adminDb.batch();
        const auditBatch = adminDb.batch();

        for (const doc of expiredQuery.docs) {
            const data = doc.data();
            const enrollmentId = doc.id;
            const uid = data.userId;
            const courseId = data.courseId;

            // Update main enrollment
            batch.update(doc.ref, {
                status: 'expired',
                updatedAt: FieldValue.serverTimestamp()
            });

            // Update mirror in users subcollection
            const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);
            batch.update(userEnrollmentRef, {
                status: 'expired',
                updatedAt: FieldValue.serverTimestamp()
            });

            // Create Audit Log
            const auditRef = adminDb.collection('audit_logs').doc();
            auditBatch.set(auditRef, {
                eventType: 'SUBSCRIPTION_EXPIRED',
                uid,
                courseId,
                enrollmentId,
                actor: { uid: 'system', role: 'cron' },
                timestamp: FieldValue.serverTimestamp(),
                version: '1.0'
            });
        }

        await batch.commit();
        await auditBatch.commit();

        console.log(`[JOB] Successfully expired ${expiredQuery.size} enrollments.`);
    } catch (error) {
        console.error('[JOB] FATAL ERROR:', error);
        process.exit(1);
    }
}

expireSubscriptionsJob().then(() => {
    console.log('[JOB] Finished.');
    process.exit(0);
});

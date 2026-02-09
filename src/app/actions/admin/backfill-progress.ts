'use server';

import { db, adminDb } from '@/lib/firebase/admin';
import { progressService } from '@/lib/progress/progressService';

/**
 * Admin Action to Backfill/Recalculate Progress for ALL enrollments.
 * Use with caution on large datasets. Run in batches if needed.
 */
export async function backfillProgress() {
    console.log("Starting Progress Backfill...");

    try {
        const enrollmentsSnap = await adminDb.collection('enrollments')
            .where('status', 'in', ['active', 'completed']) // Recalculate active and completed
            .get();

        const total = enrollmentsSnap.size;
        console.log(`Found ${total} enrollments to process.`);

        let processed = 0;
        let errors = 0;

        // Process in chunks to avoid timeout if possible, though Server Actions have timeout limits.
        // For Vercel Pro (Serverless), limit is usually 60s. For Edge, 30s.
        // We do it serially for safety in this script, or parallel with limit.

        const results = [];

        for (const doc of enrollmentsSnap.docs) {
            const data = doc.data();
            const { userId, courseId } = data;

            if (!userId || !courseId) {
                console.warn(`skipping invalid enrollment ${doc.id}`);
                continue;
            }

            try {
                await progressService.recalculateEnrollmentProgress(userId, courseId);
                processed++;
            } catch (err: any) {
                console.error(`Failed to recalc ${doc.id}:`, err);
                errors++;
                results.push({ id: doc.id, error: err.message });
            }
        }

        console.log(`Backfill Complete. Processed: ${processed}, Errors: ${errors}`);
        return { success: true, processed, errors, details: results };

    } catch (error: any) {
        console.error("Backfill Fatal Error:", error);
        return { success: false, error: error.message };
    }
}

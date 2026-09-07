
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
let db;

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        initializeApp({
            credential: cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin Initialized (Key File)");
    } else {
        // Fallback to Application Default Credentials (ADC) or Emulator
        initializeApp({
            credential: applicationDefault()
        });
        console.log("🔥 Firebase Admin Initialized (ADC)");
    }

    db = getFirestore();
} catch (error) {
    console.error("❌ Failed to init Firebase:", error);
    process.exit(1);
}

async function reconcile() {
    console.log("Starting Reconciliation Job...");
    const args = process.argv.slice(2);
    const fixMode = args.includes('--fix');

    try {
        // 1. Fetch Active Enrollments
        const enrollmentsSnap = await db.collection('enrollments').where('status', '==', 'active').get();
        console.log(`Found ${enrollmentsSnap.size} active enrollments.`);

        let driftCount = 0;

        for (const enrollmentDoc of enrollmentsSnap.docs) {
            const data = enrollmentDoc.data();
            const { userId, courseId, progressSummary } = data;

            // Skip if missing critical data
            if (!userId || !courseId) continue;

            const currentCompletedCount = progressSummary?.completedLessonsCount || 0;

            // 2. Count Actual Completed Lessons
            const progressSnap = await db.collection('progress')
                .where('userId', '==', userId)
                .where('courseId', '==', courseId)
                .where('status', '==', 'completed')
                .count()
                .get();

            const actualCompletedCount = progressSnap.data().count;

            // 3. Compare
            if (actualCompletedCount !== currentCompletedCount) {
                console.warn(`[DRIFT] User: ${userId} | Course: ${courseId}`);
                console.warn(`       Expected (Summary): ${currentCompletedCount}`);
                console.warn(`       Actual (Progress):  ${actualCompletedCount}`);

                driftCount++;

                if (fixMode) {
                    const totalLessons = progressSummary?.totalLessons || 0;
                    let newPercent = 0;
                    if (totalLessons > 0) {
                        newPercent = Math.min(100, Math.round((actualCompletedCount / totalLessons) * 100));
                    }

                    await enrollmentDoc.ref.update({
                        'progressSummary.completedLessonsCount': actualCompletedCount,
                        'progressSummary.percent': newPercent,
                        'lastReconciledAt': new Date()
                    });
                    console.log(`       ✅ FIXED.`);
                }
            }
        }

        // 4. Record Job Status
        await db.collection('system_status').doc('reconciliation_job').set({
            lastRun: new Date(),
            activeEnrollmentsScanned: enrollmentsSnap.size,
            driftsFound: driftCount,
            status: driftCount > 0 ? 'drift_detected' : 'healthy'
        });

        console.log("------------------------------------------------");
        console.log(`Job Complete. Drifts Found: ${driftCount}`);
        if (!fixMode && driftCount > 0) console.log("Run with --fix to repair.");

    } catch (e) {
        console.error("Job Failed:", e);
        process.exit(1);
    }
}

reconcile().then(() => process.exit(0));

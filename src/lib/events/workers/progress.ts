
import { db } from '@/lib/firebase/admin';
import { DomainEvent, publishEvent } from '../bus';
import { FieldValue } from 'firebase-admin/firestore';

export async function handleProgressUpdate(event: DomainEvent) {
    const { actorUserId, context } = event;
    const { courseId } = context;

    if (!courseId) return;

    console.log(`[Worker] Recalculating progress for User:${actorUserId} Course:${courseId}`);

    // 1. Fetch Course Structure (Total Lessons)
    // NOTE: In high-scale, cache this "Total Lesson Count" in the course document root.
    // For now, calculating dynamically or assuming field exists.
    const courseDoc = await db.collection('courses').doc(courseId).get();
    const courseData = courseDoc.data();

    // Fallback: Count lessons manually if not in metadata (expensive but reliable for MVP)
    let totalLessons = courseData?.totalLessons || 0;
    if (!totalLessons) {
        const modulesSnap = await db.collection('courses').doc(courseId).collection('modules').get();
        for (const mod of modulesSnap.docs) {
            const lessonsSnap = await mod.ref.collection('lessons').get(); // Costly! Optimization needed later.
            totalLessons += lessonsSnap.size;
        }
    }

    if (totalLessons === 0) return; // Divide by zero safety

    // 2. Fetch User Completed Items
    // We query the 'progress' collection for this user/course
    // BUT 'progress' is granular. We can also check 'events' history or just query 'progress' where completed=true

    // Optimization: We could use the 'enrollment.progressSummary.completedLessons' array if we trusted it, 
    // but the worker should be authoritative. Let's query the granular source of truth.
    // However, Firestore query cost is high here. 
    // BETTER ALTERNATIVE: The event payload should tell us what completed, and we push it to the array.

    const enrollmentRef = db.collection('enrollments').doc(`${actorUserId}_${courseId}`);

    await db.runTransaction(async (t) => {
        const enrollmentDoc = await t.get(enrollmentRef);
        if (!enrollmentDoc.exists) return; // Should not happen

        const currentData = enrollmentDoc.data();
        let completedSet = new Set(currentData?.progressSummary?.completedLessons || []);

        // Add new completion from event
        if (event.type === 'LESSON_COMPLETED' && context.lessonId) {
            completedSet.add(context.lessonId);
        }
        else if (event.type === 'ASSESSMENT_GRADED' && event.payload.passed) {
            // If assessments count towards progress (optional)
            // For simplicity, let's say "Lesson Completed" event is fired AFTER assessment pass too
        }

        const completedCount = completedSet.size;
        const percent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

        // 3. Update Enrollment
        t.update(enrollmentRef, {
            'progressSummary.completedLessons': Array.from(completedSet),
            'progressSummary.percent': percent,
            'progressSummary.lastUpdated': FieldValue.serverTimestamp(),
            // 'status': percent === 100 ? 'completed' : currentData?.status // Be careful overriding status
        });

        // 4. Check Completion
        if (percent === 100 && currentData?.status !== 'completed') {
            // Trigger Certificate logic
            // We can do this here or async. Ideally publish new event.
            // But we can't publish inside transaction easily without side effects.
            // So we return a flag to publish after.
        }
    });

    // Post-transaction Side Effects (Certificate)
    // Re-fetch to check if we hit 100% just now (or pass flag) -> Simplified for MVP
    const updatedEnrollment = await enrollmentRef.get();
    if (updatedEnrollment.data()?.progressSummary?.percent === 100) {

        // Check if certificate already exists
        const certsSnap = await db.collection('certificates')
            .where('userId', '==', actorUserId)
            .where('courseId', '==', courseId)
            .limit(1)
            .get();

        if (certsSnap.empty) {
            console.log(`[Worker] Issuing Certificate for User ${actorUserId} Course ${courseId}...`);

            // Generate simple validation code (ABC-1234)
            const validationCode = `FV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().substring(8)}`;

            // Fetch User Name (Assuming passed in context or fetch user profile)
            // For MVP, fetch default profile
            const userDoc = await db.collection('users').doc(actorUserId).get();
            const studentName = userDoc.data()?.displayName || 'Aluno Figura Viva';

            // Create Certificate
            const certRef = db.collection('certificates').doc();
            await certRef.set({
                id: certRef.id,
                userId: actorUserId,
                courseId: courseId,
                studentName: studentName,
                courseTitle: courseData?.title || 'Curso Figura Viva',
                instructorName: 'Gilberto C.', // Dynamic in future
                workloadHours: courseData?.workload || 20, // Check course schema
                validationCode: validationCode,
                issuedAt: FieldValue.serverTimestamp()
            });

            // Publish Event
            await publishEvent({
                type: 'CERTIFICATE_ISSUED',
                actorUserId: actorUserId,
                targetId: certRef.id,
                context: { courseId },
                payload: { validationCode }
            });
        }
    }
}

'use server';

import { auth, db } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { publishEvent } from '@/lib/events/bus';
import { CourseDoc, EnrollmentDoc, ProgressDoc, LessonDoc } from '@/types/lms';
import crypto from 'crypto';
import { assertCanAccessCourse } from '@/lib/auth/access-gate';

/**
 * Generates a unique short verification code for certificates.
 */
async function generateVerificationCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let code = 'FV-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Server Action to issue a course certificate.
 * Performs a full server-side re-check of eligibility and structural integrity.
 */
export async function issueCertificate(courseId: string) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        return { error: 'AUTH_REQUIRED', status: 401 };
    }

    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        const uid = claims.uid;
        const now = FieldValue.serverTimestamp();
        const enrollmentId = `${uid}_${courseId}`;

        // ORBITAL 01 & 05: Single Source of Truth Access Gate
        await assertCanAccessCourse(uid, courseId);

        // Continue with transaction for issuing
        const courseRef = db.collection('courses').doc(courseId);
        const enrollmentRef = db.collection('enrollments').doc(enrollmentId);

        const [courseSnap, enrollmentSnap] = await Promise.all([
            courseRef.get(),
            enrollmentRef.get()
        ]);

        const course = courseSnap.data() as CourseDoc;
        const enrollment = enrollmentSnap.data() as EnrollmentDoc;

        // 2. Determine Academic Version (Policy A: By Enrollment Version)
        const courseVersionAtCompletion = enrollment.courseVersionAtEnrollment || course.contentRevision || 1;
        const certNaturalKey = `${uid}_${courseId}_v${courseVersionAtCompletion}`;
        const certRef = db.collection('certificates').doc(certNaturalKey);

        // 3. Idempotency Check
        const existingCert = await certRef.get();
        if (existingCert.exists) {
            const data = existingCert.data();
            return {
                success: true,
                certificateId: existingCert.id,
                verificationCode: data?.code || data?.verificationCode,
                issuedAt: data?.issuedAt
            };
        }

        // 4. FULL RECHECK - Build the "Considered Lessons" set
        let consideredLessonIds: string[] = [];
        let lessonsSnapshot: { id: string; title: string }[] = [];

        if (enrollment.courseSnapshotAtEnrollment?.publishedLessonIds) {
            consideredLessonIds = enrollment.courseSnapshotAtEnrollment.publishedLessonIds;
            // Note: If using enrollment snapshot, we might need a way to get titles for the certificate snapshot
            // For now, if titles are missing, we'll fetch them from the current structure or just use IDs
        } else {
            // Live query of published structure
            const modulesSnap = await db.collection(`courses/${courseId}/modules`)
                .where('isPublished', '==', true)
                .orderBy('order')
                .get();

            for (const modDoc of modulesSnap.docs) {
                const lessonsSnap = await db.collection(`courses/${courseId}/modules/${modDoc.id}/lessons`)
                    .where('isPublished', '==', true)
                    .orderBy('order')
                    .get();

                lessonsSnap.docs.forEach(lDoc => {
                    const lData = lDoc.data() as LessonDoc;
                    consideredLessonIds.push(lDoc.id);
                    lessonsSnapshot.push({ id: lDoc.id, title: lData.title });
                });
            }
        }

        if (consideredLessonIds.length === 0) {
            return { error: 'COURSE_EMPTY_OR_UNPUBLISHED', status: 400 };
        }

        // 5. FULL RECHECK - Read student's completed progress
        const progressSnap = await db.collection('progress')
            .where('userId', '==', uid)
            .where('courseId', '==', courseId)
            .where('status', '==', 'completed')
            .get();

        const completedSet = new Set(progressSnap.docs.map(d => (d.data() as ProgressDoc).lessonId));

        // 6. Apply Completion Rules (Default: All Lessons)
        const requiredCount = consideredLessonIds.length;
        let completedRequiredCount = 0;

        consideredLessonIds.forEach(id => {
            if (completedSet.has(id)) completedRequiredCount++;
        });

        if (completedRequiredCount < requiredCount) {
            return {
                error: 'PROGRESS_INCOMPLETE',
                status: 400,
                details: { required: requiredCount, completed: completedRequiredCount }
            };
        }

        // 7. Generate Verification Code and Data
        const verificationCode = await generateVerificationCode();
        const studentNameSnapshot = enrollment.userId; // Fallback to UID, ideally fetch user display name

        // Fetch User name for Snapshot
        const userSnap = await db.collection('users').doc(uid).get();
        const userName = userSnap.data()?.displayName || uid;

        const integrityHash = crypto.createHash('sha256').update(
            JSON.stringify({ uid, courseId, courseVersionAtCompletion, consideredLessonIds })
        ).digest('hex');

        // 8. Transactional Commit
        await db.runTransaction(async (tx) => {
            // Re-verify idempotency inside transaction
            const certInTx = await tx.get(certRef);
            if (certInTx.exists) return;

            // Create Certificate
            tx.set(certRef, {
                userId: uid,
                courseId,
                courseVersionAtCompletion,
                issuedAt: now,
                code: verificationCode,
                userName,
                courseTitle: course.title,
                integrityHash,
                courseSnapshot: {
                    courseId,
                    courseVersionAtCompletion,
                    totalLessonsConsidered: requiredCount,
                    lessons: lessonsSnapshot
                },
                issuedBy: 'system'
            });

            // Update Enrollment Status
            tx.update(enrollmentRef, {
                status: 'completed',
                completedAt: now,
                'progressSummary.percent': 100,
                'progressSummary.completedLessonsCount': requiredCount,
                updatedAt: now
            });

            // Append Audit Log
            const auditRef = db.collection('audit_logs').doc();
            tx.set(auditRef, {
                eventType: 'CERTIFICATE_ISSUED',
                userId: uid,
                courseId,
                enrollmentId,
                certificateId: certNaturalKey,
                courseVersion: courseVersionAtCompletion,
                timestamp: now,
                actor: { type: 'system' }
            });
        });

        // 9. Publish Event (Asynchronous secondary flow)
        await publishEvent({
            type: 'CERTIFICATE_ISSUED',
            actorUserId: uid,
            targetId: certNaturalKey,
            context: { courseId },
            payload: { verificationCode, courseVersion: courseVersionAtCompletion }
        });

        return {
            success: true,
            certificateId: certNaturalKey,
            verificationCode,
            issuedAt: new Date().toISOString()
        };

    } catch (error: any) {
        console.error("Issue Certificate Error:", error);
        return { error: error.message || 'INTERNAL_ERROR', status: 500 };
    }
}

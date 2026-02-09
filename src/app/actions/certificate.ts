"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { publishEvent } from "@/lib/events/bus";
import { CourseDoc, EnrollmentDoc, ProgressDoc, LessonDoc } from "@/types/lms";
import crypto from "crypto";
import { assertCanAccessCourse } from "@/lib/courses/access";

/**
 * Generates a unique short verification code for certificates.
 */
async function generateVerificationCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 for clarity
  let code = "FV-";
  // Add Year to make it cleaner and scalable: FV-23-XXXXX
  const year = new Date().getFullYear().toString().slice(-2);
  code += `${year}-`;

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Server Action to issue a course certificate.
 * Performs a full server-side re-check of eligibility and structural integrity.
 * Hardened for SSoT & Idempotency.
 */
export async function issueCertificate(courseId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "AUTH_REQUIRED", status: 401 };
  }

  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = claims.uid;
    const now = FieldValue.serverTimestamp();
    const enrollmentId = `${uid}_${courseId}`;

    // ORBITAL 01 & 05: Single Source of Truth Access Gate
    await assertCanAccessCourse(uid, courseId);

    // Continue with transaction for issuing
    const courseRef = adminDb.collection("courses").doc(courseId);
    const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);

    const [courseSnap, enrollmentSnap] = await Promise.all([
      courseRef.get(),
      enrollmentRef.get(),
    ]);

    const course = courseSnap.data() as CourseDoc;
    const enrollment = enrollmentSnap.data() as EnrollmentDoc;

    // 2. Determine Academic Version (Policy A: By Enrollment Version)
    const courseVersionAtCompletion =
      enrollment.courseVersionAtEnrollment || course.contentRevision || 1;

    // STRICT ID: Certificate ID must be predictable for idempotency
    const certNaturalKey = `${uid}_${courseId}`;
    const certRef = adminDb.collection("certificates").doc(certNaturalKey);

    // 3. Idempotency Check (Fast Path)
    const existingCert = await certRef.get();
    if (existingCert.exists) {
      const data = existingCert.data();
      return {
        success: true,
        certificateId: existingCert.id,
        verificationCode: data?.code || data?.verificationCode,
        issuedAt: data?.issuedAt,
      };
    }

    // 4. FULL RECHECK - Build the "Considered Lessons" set
    let consideredLessonIds: string[] = [];
    let lessonsSnapshot: { id: string; title: string }[] = [];

    // STRICT RULE: Only currently published content counts for issuance
    const modulesSnap = await adminDb
      .collection(`courses/${courseId}/modules`)
      .orderBy("order")
      .get();

    const publishedModules = modulesSnap.docs.filter(
      (m) => m.data().isPublished !== false,
    );

    for (const modDoc of publishedModules) {
      const lessonsSnap = await adminDb
        .collection(`courses/${courseId}/modules/${modDoc.id}/lessons`)
        .orderBy("order")
        .get();

      lessonsSnap.docs.forEach((lDoc) => {
        const lData = lDoc.data() as LessonDoc;
        if (lData.isPublished !== false) {
          consideredLessonIds.push(lDoc.id);
          lessonsSnapshot.push({ id: lDoc.id, title: lData.title });
        }
      });
    }

    if (consideredLessonIds.length === 0) {
      return { error: "COURSE_EMPTY_OR_UNPUBLISHED", status: 400 };
    }

    // 5. FULL RECHECK - Read student's completed progress
    const progressSnap = await adminDb
      .collection("progress")
      .where("userId", "==", uid)
      .where("courseId", "==", courseId)
      .where("status", "==", "completed")
      .get();

    const completedSet = new Set(
      progressSnap.docs.map((d) => (d.data() as ProgressDoc).lessonId),
    );

    // 6. Apply Completion Rules (All Published Lessons)
    const requiredCount = consideredLessonIds.length;
    let completedRequiredCount = 0;

    consideredLessonIds.forEach((id) => {
      if (completedSet.has(id)) completedRequiredCount++;
    });

    if (completedRequiredCount < requiredCount) {
      console.warn(
        `[Certificate] Missing lessons for ${uid}. Req: ${requiredCount}, Has: ${completedRequiredCount}`,
      );
      // If we are here, it means progressService thought we were 100%, but re-check failed.
      // This might happen if a lesson was just published.
      // We block issuance.
      return {
        error: "PROGRESS_INCOMPLETE", // Frontend will show "Wait, you have 99%?"
        status: 400,
        details: { required: requiredCount, completed: completedRequiredCount },
      };
    }

    // 7. Generate Verification Code and Data
    const verificationCode = await generateVerificationCode();

    // Fetch User name for Snapshot
    const userSnap = await adminDb.collection("users").doc(uid).get();
    const userName = userSnap.data()?.displayName || enrollment.userName || uid;

    const integrityHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          uid,
          courseId,
          courseVersionAtCompletion,
          consideredLessonIds,
          issuedAt: new Date().toISOString(),
        }),
      )
      .digest("hex");

    // 8. Transactional Commit
    await adminDb.runTransaction(async (tx) => {
      // Re-verify idempotency inside transaction
      const certInTx = await tx.get(certRef);
      if (certInTx.exists) return;

      // Public Verification Doc Ref
      const publicRef = adminDb
        .collection("certificatePublic")
        .doc(verificationCode);

      // Create Private Certificate
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
          lessons: lessonsSnapshot,
        },
        issuedBy: "system",
        templateVersion: "v1",
      });

      // Create Public Verification Record
      tx.set(publicRef, {
        code: verificationCode,
        userName,
        courseTitle: course.title,
        issuedAt: now,
        isValid: true,
      });

      // Update Enrollment Status
      tx.update(enrollmentRef, {
        status: "completed",
        completedAt: now,
        certificateId: certNaturalKey, // Link back
        "progressSummary.percent": 100,
        "progressSummary.completedLessonsCount": requiredCount,
        updatedAt: now,
      });

      // Append Audit Log
      const auditRef = adminDb.collection("audit_logs").doc();
      tx.set(auditRef, {
        eventType: "CERTIFICATE_ISSUED",
        userId: uid,
        courseId,
        enrollmentId,
        certificateId: certNaturalKey,
        courseVersion: courseVersionAtCompletion,
        timestamp: now,
        actor: { type: "system" },
      });
    });

    // 9. Publish Event (Asynchronous secondary flow)
    await publishEvent({
      type: "CERTIFICATE_ISSUED",
      actorUserId: uid,
      targetId: certNaturalKey,
      context: { courseId },
      payload: { verificationCode, courseVersion: courseVersionAtCompletion },
    });

    return {
      success: true,
      certificateId: certNaturalKey,
      verificationCode,
      issuedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Issue Certificate Error:", error);
    return { error: error.message || "INTERNAL_ERROR", status: 500 };
  }
}

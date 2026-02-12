import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { CourseDoc, EnrollmentDoc, ProgressDoc, LessonDoc } from "@/types/lms";
import crypto from "crypto";
import { assertCanAccessCourse } from "@/lib/courses/access";

/**
 * Generates a unique short verification code for certificates.
 */
async function generateVerificationCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FV-";
  const year = new Date().getFullYear().toString().slice(-2);
  code += `${year}-`;

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface IssueCertificateResult {
  success: boolean;
  certificateId?: string;
  verificationCode?: string;
  issuedAt?: string;
  error?: string;
  status?: number;
  details?: any;
}

/**
 * Canonical Certificate Issuer Service.
 * Idempotent, server-authoritative, and secured.
 */
export class CertificateIssuer {
  /**
   * Issues a certificate for a user and course.
   * re-checks eligibility server-side.
   */
  static async issue(
    courseId: string,
    uid: string,
    actorUid: string,
    isAdmin: boolean,
  ): Promise<IssueCertificateResult> {
    try {
      // 1. Security check: actor must be the user OR an admin
      if (uid !== actorUid && !isAdmin) {
        return { success: false, error: "UNAUTHORIZED", status: 403 };
      }

      const certNaturalKey = `${uid}_${courseId}`;
      const certRef = adminDb.collection("certificates").doc(certNaturalKey);
      const enrollmentId = certNaturalKey;
      const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);

      // 2. Idempotency Check
      const existingCert = await certRef.get();
      if (existingCert.exists) {
        const data = existingCert.data();
        return {
          success: true,
          certificateId: existingCert.id,
          verificationCode: data?.code || data?.verificationCode,
          issuedAt: data?.issuedAt?.toDate
            ? data.issuedAt.toDate().toISOString()
            : data?.issuedAt,
        };
      }

      // 3. Access & Data Fetching
      await assertCanAccessCourse(uid, courseId);

      const courseRef = adminDb.collection("courses").doc(courseId);
      const [courseSnap, enrollmentSnap] = await Promise.all([
        courseRef.get(),
        enrollmentRef.get(),
      ]);

      if (!courseSnap.exists) throw new Error("COURSE_NOT_FOUND");
      if (!enrollmentSnap.exists) throw new Error("ENROLLMENT_NOT_FOUND");

      const course = courseSnap.data() as CourseDoc;
      const enrollment = enrollmentSnap.data() as EnrollmentDoc;

      // 4. Calculate Version & Required Lessons
      const courseVersionAtCompletion =
        enrollment.courseVersionAtEnrollment || course.contentRevision || 1;

      let consideredLessonIds: string[] = [];
      let lessonsSnapshot: { id: string; title: string }[] = [];

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
        return {
          success: false,
          error: "COURSE_EMPTY_OR_UNPUBLISHED",
          status: 400,
        };
      }

      // 5. Re-check Progress
      const progressSnap = await adminDb
        .collection("progress")
        .where("userId", "==", uid)
        .where("courseId", "==", courseId)
        .where("status", "==", "completed")
        .get();

      const completedSet = new Set(
        progressSnap.docs.map((d) => (d.data() as ProgressDoc).lessonId),
      );

      const requiredCount = consideredLessonIds.length;
      let completedRequiredCount = 0;
      consideredLessonIds.forEach((id) => {
        if (completedSet.has(id)) completedRequiredCount++;
      });

      if (completedRequiredCount < requiredCount) {
        return {
          success: false,
          error: "PROGRESS_INCOMPLETE",
          status: 400,
          details: {
            required: requiredCount,
            completed: completedRequiredCount,
          },
        };
      }

      // 6. Generate Verification & Integrity Hash
      const verificationCode = await generateVerificationCode();
      const userSnap = await adminDb.collection("users").doc(uid).get();
      const studentName =
        userSnap.data()?.displayName || enrollment.userName || "Estudante";
      const now = FieldValue.serverTimestamp();
      const validationUrl = `/verify/${verificationCode}`;

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

      // 7. Transactional Commit
      await adminDb.runTransaction(async (tx) => {
        tx.set(certRef, {
          userId: uid,
          courseId,
          courseVersionAtCompletion,
          issuedAt: now,
          completedAt: now, // Support both fields
          certificateNumber: verificationCode,
          code: verificationCode, // Keep for backward compat
          studentName,
          userName: studentName, // Keep for backward compat
          courseName: course.title,
          courseTitle: course.title, // Keep for backward compat
          validationUrl,
          integrityHash,
          instructorName: course.instructorName || "Lilian Gusmão",
          instructorTitle: course.instructorTitle || "Diretora Pedagógica",
          courseWorkload: course.workload || 40,
          courseSnapshot: {
            courseId,
            courseVersionAtCompletion,
            totalLessonsConsidered: requiredCount,
            lessons: lessonsSnapshot,
          },
          issuedBy: actorUid === uid ? "system" : "admin",
          templateVersion: "v1",
          status: "issued",
        });

        tx.set(adminDb.collection("certificatePublic").doc(verificationCode), {
          certificateNumber: verificationCode,
          studentName,
          courseName: course.title,
          issuedAt: now,
          isValid: true,
          validationUrl,
        });

        tx.update(enrollmentRef, {
          status: "completed",
          completedAt: now,
          certificateId: certNaturalKey,
          "progressSummary.percent": 100,
          "progressSummary.completedLessonsCount": requiredCount,
          updatedAt: now,
        });

        // Audit Log
        try {
          const { auditService } = await import("@/lib/audit");
          auditService.logEventInTransaction(tx, {
            eventType: "CERTIFICATE_ISSUED",
            actor: { uid: actorUid },
            target: { id: certNaturalKey, collection: "certificates" },
            payload: { courseId, verificationCode },
          });
        } catch (e) {
          console.warn(
            "Audit logging failed but proceeding with certificate issuance",
            e,
          );
        }
      });

      return {
        success: true,
        certificateId: certNaturalKey,
        verificationCode,
        issuedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("[CertificateIssuer] Error:", error);
      return {
        success: false,
        error: error.message || "INTERNAL_ERROR",
        status: 500,
      };
    }
  }
}

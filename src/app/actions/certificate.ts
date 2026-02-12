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

import { CertificateIssuer } from "@/lib/certificates/issuer";

/**
 * Server Action to issue a course certificate.
 * Proxies to the canonical CertificateIssuer.
 */
export async function issueCertificate(courseId: string, targetUid?: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "AUTH_REQUIRED", status: 401 };
  }

  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const actorUid = claims.uid;
    const isAdmin = !!claims.admin || claims.role === "admin";
    const uid = targetUid && isAdmin ? targetUid : actorUid;

    const result = await CertificateIssuer.issue(
      courseId,
      uid,
      actorUid,
      isAdmin,
    );

    if (result.success) {
      // 9. Publish Event (Keep action-specific events here if needed)
      await publishEvent({
        type: "CERTIFICATE_ISSUED",
        actorUserId: uid,
        targetId: result.certificateId!,
        context: { courseId },
        payload: { verificationCode: result.verificationCode },
      });

      return result;
    }

    return {
      error: result.error,
      status: result.status,
      details: result.details,
    };
  } catch (error: any) {
    console.error("Issue Certificate Action Error:", error);
    return { error: error.message || "INTERNAL_ERROR", status: 500 };
  }
}

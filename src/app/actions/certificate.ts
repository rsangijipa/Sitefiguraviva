"use server";

import { issueCertificate as issueCertificateCanonical } from "@/actions/certificate";

/**
 * Compatibility wrapper for legacy app-action imports.
 * Canonical implementation lives in "@/actions/certificate".
 */
export async function issueCertificate(courseId: string, targetUid?: string) {
  const result = await issueCertificateCanonical(courseId, targetUid);

  if ("success" in result && result.success) {
    return {
      success: true,
      certificateId: result.certificateId,
      verificationCode: result.certificateNumber,
    };
  }

  if (result.error === "Unauthorized") {
    return { error: "AUTH_REQUIRED", status: 401 };
  }

  return {
    error: result.error,
    details: result.details,
    status: "status" in result ? result.status : undefined,
  };
}

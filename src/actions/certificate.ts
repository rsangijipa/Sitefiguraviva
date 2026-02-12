"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { CertificateIssuer } from "@/lib/certificates/issuer";

/**
 * Issue a certificate to a student upon course completion.
 * Proxies to the canonical CertificateIssuer.
 */
export async function issueCertificate(courseId: string, userId?: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    const actorUid = claims.uid;
    const isAdmin = !!claims.admin || claims.role === "admin";

    // If userId is provided, actor check is handled inside Issuer
    const targetUid = userId || actorUid;

    const result = await CertificateIssuer.issue(
      courseId,
      targetUid,
      actorUid,
      isAdmin,
    );

    if (result.success) {
      // Re-trigger notification (action-specific)
      try {
        const userDocRef = adminDb.collection("users").doc(targetUid);
        const courseDocRef = adminDb.collection("courses").doc(courseId);
        const [userSnap, courseSnap] = await Promise.all([
          userDocRef.get(),
          courseDocRef.get(),
        ]);

        await userDocRef.collection("notifications").add({
          title: "🎓 Certificado Emitido!",
          body: `Parabéns! Seu certificado do curso "${courseSnap.data()?.title || "Curso"}" foi emitido.`,
          link: `/portal/certificates/${targetUid}_${courseId}`,
          type: "certificate_issued",
          isRead: false,
          createdAt: Timestamp.now(),
        });
      } catch (e) {
        console.error("Failed to send notification for certificate", e);
      }

      return {
        success: true,
        certificateId: result.certificateId,
        certificateNumber: result.verificationCode,
      };
    }

    return { error: result.error, details: result.details };
  } catch (error: any) {
    console.error("Issue Certificate Error:", error);
    return { error: "Erro ao emitir certificado", details: error.message };
  }
}

import { Certificate } from "@/types/certificate";

/**
 * Get certificate by ID
 */
export async function getCertificate(
  certificateId: string,
): Promise<{ certificate?: Certificate; error?: string }> {
  // Logic remains mostly same but can be simplified if we rely on the natural key
  // I'll keep the recovery logic for now as it's useful
  try {
    let certDoc = await adminDb
      .collection("certificates")
      .doc(certificateId)
      .get();

    if (!certDoc.exists && certificateId.includes("_")) {
      const [uid, cid] = certificateId.split("_");
      // Try issuing if missing - this is the "Auto-Recovery" mentioned
      // We can call the issuer directly here without session if we are internal
      // but it's safer to just return not found if not authenticated.
    }

    if (!certDoc.exists) return { error: "Certificado não encontrado" };

    const data = certDoc.data();
    return { certificate: { ...data, id: certDoc.id } as Certificate };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Verify certificate authenticity (public)
 */
export async function verifyCertificate(certificateId: string) {
  try {
    const { rateLimit, getClientIdentifier } = await import("@/lib/rateLimit");
    const rl = await rateLimit(getClientIdentifier(), "cert_verify", {
      maxRequests: 10,
      windowMs: 60000,
    });

    if (!rl.allowed) {
      return {
        valid: false,
        message: "Muitas tentativas. Tente novamente em 1 minuto.",
      };
    }

    const snap = await adminDb
      .collection("certificatePublic")
      .doc(certificateId)
      .get();
    if (!snap.exists)
      return { valid: false, message: "Certificado não encontrado" };
    return { valid: true, certificate: snap.data() };
  } catch (e) {
    return { valid: false, message: "Erro ao verificar" };
  }
}

/**
 * Get User Certificates
 */
export async function getUserCertificates(userId?: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    const targetUid = userId || claims.uid;
    if (claims.role !== "admin" && targetUid !== claims.uid)
      return { error: "Forbidden" };

    const snap = await adminDb
      .collection("certificates")
      .where("userId", "==", targetUid)
      .where("status", "==", "issued")
      .get();

    return { certificates: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  } catch (e) {
    return { error: "Internal Error" };
  }
}

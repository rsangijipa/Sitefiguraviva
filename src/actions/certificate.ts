"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { createNotification } from "@/features/notifications/infrastructure/supabaseNotificationRepository.server";
import {
  getCertificate as getCertificateFromRepo,
  getUserCertificates as getUserCertificatesFromRepo,
} from "@/features/certificates/infrastructure/supabaseCertificateRepository.server";
import { issueCertificateSupabase } from "@/features/certificates/infrastructure/supabaseCertificateIssuer.server";

/**
 * Issue a certificate to a student upon course completion.
 * Uses the canonical Supabase certificate issuer.
 */
export async function issueCertificate(courseId: string, userId?: string) {
  try {
    const claims = await verifySession();
    if (!claims) return { error: "Unauthorized" };
    const actorUid = claims.uid;
    const isAdmin = !!claims.admin || claims.role === "admin";

    // If userId is provided, actor check is handled inside Issuer
    const targetUid = userId || actorUid;

    const result = await issueCertificateSupabase(
      courseId,
      targetUid,
      actorUid,
      isAdmin,
    );

    if (result.success) {
      // Re-trigger notification (action-specific)
      try {
        const supabase = createSupabaseServiceClient();
        await createNotification(
          targetUid,
          {
            title: "🎓 Certificado Emitido!",
            body: "Seu certificado de conclusão foi emitido.",
            link: `/portal/certificates/${targetUid}_${courseId}`,
            type: "certificate_available" as any,
          },
          supabase,
        );
      } catch (e) {
        console.error("Failed to send notification for certificate", e);
      }

      return {
        success: true,
        certificateId: result.certificateId,
        certificateNumber: result.verificationCode,
      };
    }

    return {
      error: result.error,
      details: (result as { details?: unknown }).details,
    };
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
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .or(`id.eq.${certificateId},code.eq.${certificateId}`)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { error: "Certificado não encontrado" };
    const certificate = await getCertificateFromRepo(
      data.user_id,
      data.course_id,
      supabase,
    );
    return certificate
      ? { certificate }
      : { error: "Certificado não encontrado" };
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

    const { data, error } = await createSupabaseServiceClient()
      .from("certificates")
      .select("*")
      .eq("code", certificateId)
      .maybeSingle();
    if (error || !data)
      return { valid: false, message: "Certificado não encontrado" };
    return { valid: true, certificate: data };
  } catch (e) {
    return { valid: false, message: "Erro ao verificar" };
  }
}

/**
 * Get User Certificates
 */
export async function getUserCertificates(userId?: string) {
  try {
    const claims = await verifySession();
    if (!claims) return { error: "Unauthorized" };
    const targetUid = userId || claims.uid;
    if (claims.role !== "admin" && targetUid !== claims.uid)
      return { error: "Forbidden" };

    const certificates = await getUserCertificatesFromRepo(
      targetUid,
      createSupabaseServiceClient(),
    );
    return { certificates };
  } catch (e) {
    return { error: "Internal Error" };
  }
}

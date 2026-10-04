import { issueCertificateSupabase } from "@/features/certificates/infrastructure/supabaseCertificateIssuer.server";

/**
 * Compatibility facade for legacy imports.
 * Certificate issuance is implemented only by the Supabase issuer.
 */
export class CertificateIssuer {
  static async issue(
    courseId: string,
    uid: string,
    actorUid: string,
    isAdmin: boolean,
  ) {
    return issueCertificateSupabase(courseId, uid, actorUid, isAdmin);
  }
}

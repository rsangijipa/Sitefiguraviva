import {
  getCertificate as getCertificateFromRepo,
  getUserCertificates as getUserCertificatesFromRepo,
} from "@/features/certificates/infrastructure/supabaseCertificateRepository.server";
import type { Certificate } from "@/types/certificate";

export const certificateService = {
  async getCertificate(
    userId: string,
    courseId: string,
  ): Promise<Certificate | null> {
    return getCertificateFromRepo(userId, courseId);
  },

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return getUserCertificatesFromRepo(userId);
  },
};

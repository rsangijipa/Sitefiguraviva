"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import type { Certificate } from "@/types/analytics";

/**
 * Generate a unique certificate number
 * Format: IFV-YYYY-NNNNNN
 */
function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `IFV-${year}-${random}`;
}

/**
 * Issue a certificate to a student upon course completion
 * Admin or Auto-triggered
 */
export async function issueCertificate(userId: string, courseId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    // Get user details
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return { error: "Usuário não encontrado" };
    }
    const userData = userDoc.data();

    // Get course details
    const courseDoc = await adminDb.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) {
      return { error: "Curso não encontrado" };
    }
    const courseData = courseDoc.data();

    // Check if certificate already exists
    const existingCertQuery = await adminDb
      .collection("certificates")
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .where("status", "==", "issued")
      .limit(1)
      .get();

    if (!existingCertQuery.empty) {
      return {
        success: true, // Changed: Don't error if already issued, just return existing
        certificateId: existingCertQuery.docs[0].id,
        certificateNumber: existingCertQuery.docs[0].data().certificateNumber,
        message: "Certificado já foi emitido anteriormente",
      };
    }

    // Verify course completion - CHECK BOTH POSSIBLE FIELD NAMES
    const progressDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("courseProgress")
      .doc(courseId)
      .get();

    if (!progressDoc.exists) {
      return { error: "Progresso do curso não encontrado" };
    }

    const progress = progressDoc.data();

    // DEBUG: Log progress data
    console.log("Progress data:", JSON.stringify(progress, null, 2));

    // Check multiple possible field names for completion
    const completionPercentage =
      progress?.completionPercentage || progress?.progress || 0;

    if (completionPercentage < 100) {
      return {
        error: `Curso não foi completado (${completionPercentage}%). Completar todos os módulos e avaliações.`,
        debug: {
          completionPercentage,
          progressData: progress,
        },
      };
    }

    // Verify all assessments passed - ONLY IF ASSESSMENTS EXIST
    const assessmentsQuery = await adminDb
      .collection("assessments")
      .where("courseId", "==", courseId)
      .where("isRequired", "==", true)
      .get();

    console.log(`Found ${assessmentsQuery.size} required assessments`);

    if (assessmentsQuery.size > 0) {
      for (const assessmentDoc of assessmentsQuery.docs) {
        const assessmentProgressDoc = await adminDb
          .collection("users")
          .doc(userId)
          .collection("assessmentProgress")
          .doc(assessmentDoc.id)
          .get();

        const assessmentProgress = assessmentProgressDoc.data();
        console.log(
          `Assessment ${assessmentDoc.id} progress:`,
          assessmentProgress,
        );

        if (!assessmentProgressDoc.exists || !assessmentProgress?.passed) {
          return {
            error: `Avaliação "${assessmentDoc.data().title}" precisa ser aprovada antes de emitir certificado`,
            debug: {
              assessmentId: assessmentDoc.id,
              assessmentProgress: assessmentProgress || "Not found",
            },
          };
        }
      }
    }

    // Generate certificate
    const certificateNumber = generateCertificateNumber();
    const certificateId = adminDb.collection("certificates").doc().id;
    const validationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://figuraviva.com"}/verify/${certificateId}`;

    const certificate: Omit<Certificate, "id"> = {
      userId,
      courseId,
      studentName: userData?.displayName || userData?.email || "Aluno",
      courseName: courseData?.title || "Curso",
      completedAt: progress.completedAt || Timestamp.now(),
      issuedAt: Timestamp.now(),
      certificateNumber,
      instructorName: courseData?.instructorName || "Lilian Gusmão",
      instructorTitle: courseData?.instructorTitle || "Diretora Pedagógica",
      courseWorkload: courseData?.workload || 40,
      validationUrl,
      status: "issued",
    };

    // Save certificate
    await adminDb
      .collection("certificates")
      .doc(certificateId)
      .set(certificate);

    // Update user progress
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("courseProgress")
      .doc(courseId)
      .update({
        certificateIssued: true,
        certificateId,
        certificateIssuedAt: Timestamp.now(),
      });

    // Send notification
    const notificationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .doc();

    await notificationRef.set({
      title: "🎓 Certificado Emitido!",
      body: `Parabéns! Seu certificado do curso "${courseData?.title}" foi emitido.`,
      link: `/portal/certificates/${certificateId}`,
      type: "certificate_issued",
      isRead: false,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      certificateId,
      certificateNumber,
    };
  } catch (error: any) {
    console.error("Issue Certificate Error:", error);
    return {
      error: "Erro ao emitir certificado",
      details: error?.message || "Unknown error",
    };
  }
}

/**
 * Get certificate by ID (NO AUTH REQUIRED for student viewing their own)
 * Handles both legacy and current certificate schemas
 */
/**
 * Get certificate by ID (NO AUTH REQUIRED for student viewing their own)
 * Handles both legacy and current certificate schemas
 * ALSO HANDLES: Composite IDs (userId_courseId) for auto-recovery
 */
export async function getCertificate(certificateId: string) {
  try {
    let certDoc;
    let actualCertificateId = certificateId;

    // 1. Check if ID is composite (UserId_CourseId)
    // The image showed an ID like "d7..._Ti..." which is 28 chars + _ + 20 chars
    if (certificateId.includes("_")) {
      const [userId, courseId] = certificateId.split("_");

      if (userId && courseId) {
        console.log(
          `[getCertificate] Detected composite ID: ${userId}_${courseId}`,
        );

        // Try to find existing certificate by query
        const existingQuery = await adminDb
          .collection("certificates")
          .where("userId", "==", userId)
          .where("courseId", "==", courseId)
          .where("status", "==", "issued")
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          console.log(
            `[getCertificate] Found existing certificate via composite ID`,
          );
          certDoc = existingQuery.docs[0];
          actualCertificateId = certDoc.id;
        } else {
          console.log(
            `[getCertificate] No certificate found for composite ID. Attempting auto-issue...`,
          );
          // AUTO-RECOVERY: If no certificate exists, try to issue one!
          // We need to bypass the session check in issueCertificate if we want this to work strictly server-side
          // BUT, issueCertificate relies on cookies.
          // Let's copy the logic or call it if we can.

          // For safety, let's call issueCertificate. logic inside validates everything.
          // Note: issueCertificate expects a session. If this call comes from a public context without session, it might fail.
          // But this is the /portal/ route, so user should be logged in.

          // We'll wrap this in a try/catch specifically for issuance
          try {
            // Since we are already in a Server Action context, we can try to call the logic directly
            // OR just call issueCertificate if we trust the session is there.
            // The safer bet properly "fixing" the stuck student problem is to just run the issuance logic
            // directly here but adapted (or call existing export).

            const result = await issueCertificate(userId, courseId);
            if (result.success && result.certificateId) {
              console.log(
                `[getCertificate] Auto-issued certificate: ${result.certificateId}`,
              );
              // Now fetch the newly created cert
              certDoc = await adminDb
                .collection("certificates")
                .doc(result.certificateId)
                .get();
              actualCertificateId = result.certificateId;
            } else {
              console.error(`[getCertificate] Auto-issue failed:`, result);
              return {
                error:
                  result.error ||
                  "Certificado não encontrado e não pôde ser gerado.",
              };
            }
          } catch (err) {
            console.error("Auto-issue error", err);
          }
        }
      }
    }

    // 2. If certDoc is still undefined (was not composite or auto-issue failed/logic skipped), try direct lookup
    if (!certDoc) {
      certDoc = await adminDb
        .collection("certificates")
        .doc(actualCertificateId)
        .get();
    }

    if (!certDoc || !certDoc.exists) {
      return { error: "Certificado não encontrado" };
    }

    const data = certDoc.data();

    if (!data) return { error: "Dados do certificado corrompidos" };

    // Normalize certificate data to match expected Certificate type from analytics.ts
    const certificate: Certificate = {
      id: certDoc.id,
      userId: data?.userId || "",
      courseId: data?.courseId || "",
      studentName: data?.studentName || data?.userName || "Aluno",
      courseName: data?.courseName || data?.courseTitle || "Curso",
      completedAt: data?.completedAt || data?.issuedAt || Timestamp.now(),
      issuedAt: data?.issuedAt || Timestamp.now(),
      certificateNumber: data?.certificateNumber || data?.code || "N/A",
      instructorName: data?.instructorName || "Lilian Gusmão",
      instructorTitle: data?.instructorTitle || "Diretora Pedagógica",
      courseWorkload: data?.courseWorkload || data?.metadata?.hours || 40,
      validationUrl:
        data?.validationUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL || "https://figuraviva.com"}/verify/${certDoc.id}`,
      status: data?.status || "issued",
    };

    return { certificate };
  } catch (error: any) {
    console.error("Get Certificate Error:", error);
    return { error: `Erro ao buscar certificado: ${error.message}` };
  }
}

/**
 * Verify certificate authenticity (public route - NO AUTH)
 */
export async function verifyCertificate(certificateId: string) {
  try {
    const certDoc = await adminDb
      .collection("certificates")
      .doc(certificateId)
      .get();

    if (!certDoc.exists) {
      return {
        valid: false,
        message: "Certificado não encontrado ou inválido",
      };
    }

    const certificate = certDoc.data() as Certificate;

    if (certificate.status === "revoked") {
      return {
        valid: false,
        message: "Certificado revogado",
      };
    }

    return {
      valid: true,
      certificate: {
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        workload: certificate.courseWorkload,
      },
      message: "Certificado válido e autêntico",
    };
  } catch (error) {
    console.error("Verify Certificate Error:", error);
    return {
      valid: false,
      message: "Erro ao verificar certificado",
    };
  }
}

/**
 * Get all certificates for a user (Student view)
 */
export async function getUserCertificates(userId?: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    const targetUserId = userId || claims.uid;

    // Students can only view their own certificates
    if (claims.role !== "admin" && targetUserId !== claims.uid) {
      return { error: "Forbidden" };
    }

    const certificatesQuery = await adminDb
      .collection("certificates")
      .where("userId", "==", targetUserId)
      .where("status", "==", "issued")
      .orderBy("issuedAt", "desc")
      .get();

    const certificates = certificatesQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Certificate[];

    return { certificates };
  } catch (error) {
    console.error("Get User Certificates Error:", error);
    return { error: "Erro ao buscar certificados" };
  }
}

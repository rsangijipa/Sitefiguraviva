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
 */
export async function getCertificate(certificateId: string) {
  try {
    const certDoc = await adminDb
      .collection("certificates")
      .doc(certificateId)
      .get();

    if (!certDoc.exists) {
      return { error: "Certificado não encontrado" };
    }

    const certificate = { id: certDoc.id, ...certDoc.data() } as Certificate;

    return { certificate };
  } catch (error) {
    console.error("Get Certificate Error:", error);
    return { error: "Erro ao buscar certificado" };
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

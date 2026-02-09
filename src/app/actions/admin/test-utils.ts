"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";

/**
 * Generate a test certificate for development/testing
 * ADMIN ONLY
 */
export async function generateTestCertificate() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    // Must be admin
    const userDoc = await adminDb.collection("users").doc(claims.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== "admin") {
      return {
        error:
          "Acesso negado. Apenas administradores podem gerar certificados de teste.",
      };
    }

    // Create test certificate
    const certificateNumber = `IFV-TEST-${Date.now().toString().slice(-6)}`;
    const certRef = adminDb.collection("certificates").doc();

    const testCertificate = {
      userId: claims.uid,
      courseId: "test-course-001",
      studentName: userData?.displayName || claims.email || "Aluno de Teste",
      courseName: "Curso de Teste - Gestalt-Terapia Fundamentals",
      completedAt: Timestamp.now(),
      issuedAt: Timestamp.now(),
      certificateNumber,
      instructorName: "Lilian Vanessa Gusmão",
      instructorTitle: "Psicóloga e Gestalt-terapeuta",
      courseWorkload: 40,
      validationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://figuraviva.com"}/verify/${certRef.id}`,
      status: "issued",
      // Test metadata
      isTest: true,
      createdBy: claims.uid,
    };

    await certRef.set(testCertificate);

    return {
      success: true,
      certificateId: certRef.id,
      certificateNumber,
      message: "Certificado de teste criado com sucesso!",
    };
  } catch (error: any) {
    console.error("Generate Test Certificate Error:", error);
    return {
      error: "Erro ao gerar certificado de teste",
      details: error?.message || "Unknown error",
    };
  }
}

/**
 * Delete test certificates
 * ADMIN ONLY
 */
export async function deleteTestCertificates() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    // Must be admin
    const userDoc = await adminDb.collection("users").doc(claims.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== "admin") {
      return { error: "Acesso negado" };
    }

    // Find and delete all test certificates
    const testCerts = await adminDb
      .collection("certificates")
      .where("isTest", "==", true)
      .get();

    const batch = adminDb.batch();
    testCerts.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      deleted: testCerts.size,
      message: `${testCerts.size} certificados de teste removidos.`,
    };
  } catch (error: any) {
    console.error("Delete Test Certificates Error:", error);
    return {
      error: "Erro ao deletar certificados de teste",
      details: error?.message,
    };
  }
}

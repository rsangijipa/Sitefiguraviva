"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Helper to ensure the user is an admin.
 * @throws Error if not authenticated or not an admin.
 */
async function assertIsAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    throw new Error("Unauthenticated");
  }

  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

  // Check role in token first (fastest)
  if (decodedToken.role === "admin" || decodedToken.admin === true) {
    return decodedToken;
  }

  // Double check database source of truth (safest)
  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
  const userData = userDoc.data();

  if (userData?.role !== "admin") {
    throw new Error("Access Denied: Admin role required.");
  }

  return decodedToken;
}

export async function updateSiteSettings(
  key: "founder" | "institute" | "seo" | "team" | "legal" | "config",
  data: any,
) {
  try {
    const user = await assertIsAdmin();
    const updatedAt = Timestamp.now();

    await adminDb
      .collection("siteSettings")
      .doc(key)
      .set(
        {
          ...data,
          updatedAt,
          updatedBy: user.email,
        },
        { merge: true },
      );

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings", "page");
    revalidatePath("/public-library", "page");
    revalidatePath("/public-gallery", "page");
    return { success: true, updatedAt: updatedAt.toDate().toISOString() };
  } catch (error: any) {
    console.error(`Error updating settings/${key}:`, error);
    return { success: false, error: error.message };
  }
}

export async function seedSiteSettingsAction() {
  try {
    await assertIsAdmin();
    const batch = adminDb.batch();

    // Import defaults from a place that doesn't trigger client-side firebase
    // For now, let's just use the ones already here and add legal
    const defaults = {
      founder: {
        name: "Lilian Vanessa Nicacio Gusmão Vianei",
        role: "Psicóloga e Gestalt-terapeuta",
        bio: "Psicóloga, gestalt-terapeuta e pesquisadora...",
        image: "/assets/lilian-vanessa.jpeg",
        link: "http://lattes.cnpq.br/",
      },
      institute: {
        title: "O Instituto Figura Viva",
        subtitle:
          "Um espaço vivo de acolhimento clínico e formação profissional — onde o encontro transforma.",
        address: "Rua Santos Dumont, 156 - Uniao, Ouro Preto D'Oeste - RO",
        phone: "(69) 99248-1585",
        manifesto_title: "Habitar a Fronteira",
        manifesto_text: "Na Gestalt, a vida acontece no contato...",
        quote: "O encontro é a fronteira onde a vida se renova.",
      },
      seo: {
        defaultTitle: "Instituto Figura Viva | Gestalt-Terapia",
        defaultDescription:
          "O Instituto Figura Viva é um espaço de excelência em formação, clínica e pesquisa em Gestalt-terapia.",
        ogImage: "/assets/og-image.jpg",
        keywords: ["Gestalt", "Psicologia", "Formação", "Terapia", "Rondônia"],
      },
      legal: {
        privacy: {
          title: "Política de Privacidade",
          lastUpdated: "Janeiro de 2026",
          content: [
            {
              heading: "1. Introdução",
              text: "O Instituto Figura Viva respeita a sua privacidade...",
            },
          ],
        },
        terms: {
          title: "Termos de Uso",
          lastUpdated: "Janeiro de 2026",
          content: [
            {
              heading: "1. Aceite dos Termos",
              text: "Ao acessar o site...",
            },
          ],
        },
      },
      config: {
        enableParticles: true,
        visualMode: "modern",
        showAudioControl: true,
        whatsappNumber: "556992481585",
        whatsappMessage:
          "Olá! Gostaria de saber mais sobre as formações do Instituto Figura Viva.",
      },
    };

    const founderRef = adminDb.collection("siteSettings").doc("founder");
    const instituteRef = adminDb.collection("siteSettings").doc("institute");
    const seoRef = adminDb.collection("siteSettings").doc("seo");
    const legalRef = adminDb.collection("siteSettings").doc("legal");
    const configRef = adminDb.collection("siteSettings").doc("config");

    const [fSnap, iSnap, sSnap, lSnap, cSnap] = await Promise.all([
      founderRef.get(),
      instituteRef.get(),
      seoRef.get(),
      legalRef.get(),
      configRef.get(),
    ]);

    if (!fSnap.exists)
      batch.set(founderRef, {
        ...defaults.founder,
        updatedAt: Timestamp.now(),
      });
    if (!iSnap.exists)
      batch.set(instituteRef, {
        ...defaults.institute,
        updatedAt: Timestamp.now(),
      });
    if (!sSnap.exists)
      batch.set(seoRef, { ...defaults.seo, updatedAt: Timestamp.now() });
    if (!lSnap.exists)
      batch.set(legalRef, { ...defaults.legal, updatedAt: Timestamp.now() });
    if (!cSnap.exists)
      batch.set(configRef, { ...defaults.config, updatedAt: Timestamp.now() });

    await batch.commit();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, error: error.message };
  }
}

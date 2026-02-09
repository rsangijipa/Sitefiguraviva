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
  key: "founder" | "institute" | "seo" | "team",
  data: any,
) {
  try {
    const user = await assertIsAdmin();

    await adminDb
      .collection("siteSettings")
      .doc(key)
      .set(
        {
          ...data,
          updatedAt: Timestamp.now(),
          updatedBy: user.email,
        },
        { merge: true },
      );

    revalidatePath("/", "layout"); // Revalidate everything as header/footer might change
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating settings/${key}:`, error);
    return { success: false, error: error.message };
  }
}

export async function seedSiteSettingsAction() {
  try {
    await assertIsAdmin();
    const batch = adminDb.batch();

    const defaults = {
      founder: {
        name: "Lilian Gusmão",
        role: "Fundadora e Responsável Técnica",
        bio: "Psicóloga com mais de 20 anos de experiência...",
        image: "/uploads/lilian.jpg", // Placeholder
        link: "http://lattes.cnpq.br/...",
      },
      institute: {
        title: "Instituto Figura Viva",
        subtitle:
          "Um espaço vivo de acolhimento clínico e formação profissional.",
        address: "Rua Exemplo, 123 - Ouro Preto D'Oeste/RO",
        phone: "(69) 99999-9999",
        manifesto_title: "Nossa Essência",
        manifesto_text: "Acreditamos na potência do encontro...",
        quote: "Onde a vida acontece.",
      },
      seo: {
        title: "Instituto Figura Viva",
        description: "Página oficial do Instituto Figura Viva.",
        keywords: ["psicologia", "gestalt", "formação"],
      },
    };

    const founderRef = adminDb.collection("siteSettings").doc("founder");
    const instituteRef = adminDb.collection("siteSettings").doc("institute");
    const seoRef = adminDb.collection("siteSettings").doc("seo");

    const [fSnap, iSnap, sSnap] = await Promise.all([
      founderRef.get(),
      instituteRef.get(),
      seoRef.get(),
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

    await batch.commit();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, error: error.message };
  }
}

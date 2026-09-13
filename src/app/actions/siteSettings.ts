"use server";

import { revalidatePath } from "next/cache";

/**
 * Helper to ensure the user is an admin.
 * @throws Error if not authenticated or not an admin.
 */
import { requireAdmin } from "@/lib/auth/server";
import { z } from "zod";
import {
  upsertPublicPage,
  type PublicPageKey,
} from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";

const siteSettingsSchema = z.record(z.string(), z.any());

export async function updateSiteSettings(key: PublicPageKey, data: unknown) {
  try {
    const user = await requireAdmin();

    // Basic structural validation
    const validatedData = siteSettingsSchema.parse(data);
    const updatedAt = await upsertPublicPage(key, {
      ...validatedData,
      updatedBy: user.email ?? "admin",
    });

    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings", "page");
    revalidatePath("/public-library", "page");
    revalidatePath("/public-gallery", "page");
    return { success: true, updatedAt };
  } catch (error: any) {
    console.error(`Error updating settings/${key}:`, error);
    return { success: false, error: error.message };
  }
}

export async function seedSiteSettingsAction() {
  try {
    await requireAdmin();

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
        ogImage: "",
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
        whatsappNumber: "5569992481585",
        whatsappMessage:
          "Olá! Gostaria de saber mais sobre as formações do Instituto Figura Viva.",
      },
    };

    await Promise.all(
      Object.entries(defaults).map(([key, value]) =>
        upsertPublicPage(key as PublicPageKey, value),
      ),
    );
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, error: error.message };
  }
}

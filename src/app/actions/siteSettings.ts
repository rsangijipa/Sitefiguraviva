"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper to ensure the user is an admin.
 * @throws Error if not authenticated or not an admin.
 */
import { requireAdmin } from "@/lib/auth/server";
import { z } from "zod";

const siteSettingsSchema = z.record(z.string(), z.any());

export async function updateSiteSettings(
  key: "founder" | "institute" | "seo" | "team" | "legal" | "config",
  data: any,
) {
  try {
    const user = await requireAdmin();

    // Basic structural validation
    const validatedData = siteSettingsSchema.parse(data);
    const updatedAt = new Date().toISOString();
    const { error } = await createSupabaseServiceClient()
      .from("public_pages")
      .upsert({
        key,
        content: { ...validatedData, updatedAt, updatedBy: user.email },
        is_published: true,
        updated_at: updatedAt,
      } as any);
    if (error) throw error;

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
    const supabase = createSupabaseServiceClient();

    // Keep the seed payload local so the action remains independent of client state.
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

    const { data: existing, error: readError } = await supabase
      .from("public_pages")
      .select("key")
      .in("key", ["founder", "institute", "seo", "legal", "config"]);
    if (readError) throw readError;
    const existingKeys = new Set((existing ?? []).map((row: any) => row.key));
    const rows = Object.entries(defaults)
      .filter(([key]) => !existingKeys.has(key))
      .map(([key, content]) => ({ key, content, is_published: true }));
    if (rows.length) {
      const { error } = await supabase.from("public_pages").insert(rows as any);
      if (error) throw error;
    }
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, error: error.message };
  }
}

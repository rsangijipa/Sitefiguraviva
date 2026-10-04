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

const shortText = z.string().trim().max(500);
const bodyText = z.string().trim().max(30000);
const imageUrl = z
  .string()
  .max(2000)
  .refine(
    (value) => !value || /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value),
    "URL de imagem inválida.",
  );
const externalUrl = z
  .string()
  .max(2000)
  .refine(
    (value) => !value || /^https?:\/\//i.test(value),
    "Informe um link HTTP ou HTTPS.",
  );
const settingsSchemas = {
  home: z.object({
    heroTitle: shortText.min(1),
    heroAccent: shortText,
    heroDescription: bodyText,
    coursesTitle: shortText,
    coursesDescription: bodyText,
    blogTitle: shortText,
    libraryTitle: shortText,
    blogDescription: bodyText,
    faqTitle: shortText,
    faqs: z
      .array(
        z.object({
          question: shortText.min(1, "Preencha todas as perguntas."),
          answer: bodyText.min(1, "Preencha todas as respostas."),
        }),
      )
      .max(50),
  }),
  founder: z.object({
    name: shortText.min(1),
    role: shortText,
    bio: bodyText,
    image: imageUrl,
    link: externalUrl,
  }),
  institute: z.object({
    title: shortText.min(1),
    subtitle: bodyText,
    manifesto_title: shortText,
    manifesto_text: bodyText,
    manifesto_body: bodyText,
    manifesto_description: bodyText,
    quote: bodyText,
    address: shortText,
    phone: shortText,
  }),
  config: z.object({
    whatsappNumber: z
      .string()
      .trim()
      .regex(
        /^\d{10,15}$/,
        "Informe o WhatsApp com DDI, DDD e telefone, apenas números.",
      ),
    whatsappMessage: bodyText,
    showAudioControl: z.boolean(),
  }),
  seo: z.object({
    defaultTitle: shortText.min(1),
    defaultDescription: bodyText,
    ogImage: imageUrl,
    keywords: z.array(shortText).max(100),
  }),
  legal: z.record(z.string(), z.unknown()),
};

export async function updateSiteSettings(key: PublicPageKey, data: unknown) {
  try {
    const user = await requireAdmin();

    // Basic structural validation
    if (!(key in settingsSchemas))
      throw new Error("Seção de configurações indisponível.");
    const validatedData =
      settingsSchemas[key as keyof typeof settingsSchemas].parse(data);
    const updatedAt = await upsertPublicPage(key, {
      ...validatedData,
      updatedBy: user.email ?? "admin",
    });

    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings", "page");
    revalidatePath("/instituto", "page");
    revalidatePath("/instituto/fundadora", "page");
    revalidatePath("/instituto/manifesto", "page");
    revalidatePath("/public-library", "page");
    revalidatePath("/public-gallery", "page");
    return { success: true, updatedAt };
  } catch (error: any) {
    console.error(`Error updating settings/${key}:`, error);
    return {
      success: false,
      error:
        error instanceof z.ZodError ? error.issues[0]?.message : error.message,
    };
  }
}

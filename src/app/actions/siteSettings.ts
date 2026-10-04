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
  patchPublicConfig,
  getPublicPage,
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
    const payload = {
      ...validatedData,
      updatedBy: user.email ?? "admin",
    };
    const updatedAt =
      key === "config"
        ? await patchPublicConfig(payload)
        : await upsertPublicPage(key, payload);

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

const googleSchema = z.object({
  calendarId: z.string().trim().max(500),
  driveFolderId: z
    .string()
    .trim()
    .max(200)
    .regex(/^[\w-]*$/, "ID da pasta inválido."),
  formsUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          !url.username &&
          !url.password &&
          (url.hostname === "forms.gle" ||
            (url.hostname === "docs.google.com" &&
              url.pathname.startsWith("/forms/")))
        );
      } catch {
        return false;
      }
    }, "Informe um link HTTPS do Google Forms."),
  youtubeId: z
    .string()
    .trim()
    .max(200)
    .regex(/^[\w@-]*$/, "ID do YouTube inválido."),
});
const emptyGoogle = {
  calendarId: "",
  driveFolderId: "",
  formsUrl: "",
  youtubeId: "",
};

export async function getGoogleSettings() {
  await requireAdmin();
  const config = await getPublicPage<Record<string, unknown>>(
    "config",
    emptyGoogle,
  );
  return Object.fromEntries(
    Object.keys(emptyGoogle).map((key) => [
      key,
      typeof config[key] === "string" ? config[key] : "",
    ]),
  ) as typeof emptyGoogle;
}

export async function updateGoogleSettings(data: unknown) {
  try {
    const actor = await requireAdmin();
    const values = googleSchema.parse(data);
    const updatedAt = await patchPublicConfig({
      ...values,
      updatedBy: actor.email ?? "admin",
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/google");
    revalidatePath("/admin/settings");
    return { success: true, updatedAt };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.issues[0]?.message
          : "Não foi possível salvar as integrações. Tente novamente.",
    };
  }
}

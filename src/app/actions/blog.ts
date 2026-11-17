"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { z } from "zod";
import {
  DIARY_BACKGROUNDS,
  DIARY_KINDS,
  DIARY_SETTINGS_KEY,
  DIARY_SIZES,
  DIARY_TONES,
} from "@/features/blog/diary-blocks";
import { getYouTubeVideoId, safeContentUrl } from "@/lib/course-content/media";

// Posts live only in Supabase's `posts` table (see
// src/features/content/infrastructure/supabaseContentRepository.ts).
// O formato do bloco do diário (foto, vídeo, frase…) fica em legacy_payload.
const blogPostSchema = z
  .object({
    title: z.string().trim().max(200).optional().default(""),
    excerpt: z.string().optional().default(""),
    content: z.string().optional().default(""),
    type: z.enum(["blog", "news", "announcement", "library"]).default("blog"),
    image: z.string().url().or(z.literal("")).optional(),
    pdf_url: z.string().url().or(z.literal("")).optional(),
    post_format: z.enum(DIARY_KINDS).default("article"),
    youtube_url: z.string().trim().optional().default(""),
    quote_author: z.string().trim().max(160).optional().default(""),
    card_size: z.enum(DIARY_SIZES).default("medium"),
    tone: z.enum(DIARY_TONES).default("paper"),
    author: z.string().trim().max(120).optional().default(""),
    readingTime: z.string().trim().max(40).optional().default(""),
  })
  .superRefine((value, context) => {
    const issue = (path: string, message: string) =>
      context.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (value.type === "library" && !value.pdf_url) {
      issue(
        "pdf_url",
        "Um arquivo PDF é obrigatório para materiais da biblioteca",
      );
    }
    const format = value.post_format;
    if (!value.title && (value.type === "library" || format !== "quote")) {
      issue("title", "Título é obrigatório");
    }
    if (value.type === "library") return;

    if (
      (format === "article" || format === "text" || format === "quote") &&
      !value.content.trim()
    ) {
      issue(
        "content",
        format === "quote"
          ? "Escreva a frase."
          : "Conteúdo é obrigatório para este bloco",
      );
    }
    if (format === "photo" && !value.image)
      issue("image", "Envie a fotografia do bloco.");
    if (format === "video" && !getYouTubeVideoId(value.youtube_url)) {
      issue("youtube_url", "Cole um link válido do YouTube.");
    }
  });

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function saveBlogPostAction(id: string | null, data: unknown) {
  try {
    await requireAdmin();
    const input = blogPostSchema.parse(data);
    const supabase = createSupabaseServiceClient();
    const postId = id ?? randomUUID();

    // Frases soltas podem vir sem título: usa o começo da frase.
    const title =
      input.title || plainText(input.content).slice(0, 80) || "Frase";

    // Slug é único na tabela; blocos curtos repetem títulos com facilidade.
    let slug = slugify(title) || postId.slice(0, 8);
    const { data: clash, error: clashError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", postId)
      .limit(1);
    if (clashError) throw clashError;
    if (clash && clash.length > 0) slug = `${slug}-${postId.slice(0, 6)}`;

    let legacy: Record<string, unknown> = {};
    if (id) {
      const { data: current, error } = await supabase
        .from("posts")
        .select("legacy_payload")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const value = current?.legacy_payload;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        legacy = { ...(value as Record<string, unknown>) };
      }
    }
    delete legacy.bg_style;
    const youtubeId = getYouTubeVideoId(input.youtube_url);

    const payload = {
      title,
      excerpt: input.excerpt || null,
      content: input.content || "",
      type: input.type,
      image_url: safeContentUrl(input.image) || null,
      pdf_url: input.pdf_url || null,
      legacy_payload: {
        ...legacy,
        post_format: input.post_format,
        youtube_url: youtubeId
          ? `https://www.youtube.com/watch?v=${youtubeId}`
          : null,
        quote_author: input.quote_author || null,
        card_size: input.card_size,
        tone: input.tone,
        author: input.author || null,
        readingTime: input.readingTime || null,
      },
      slug,
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = id
      ? await supabase.from("posts").update(payload).eq("id", id)
      : await supabase.from("posts").insert({
          ...payload,
          id: postId,
          created_at: new Date().toISOString(),
        });

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving blog post:", error);
    const message =
      error instanceof z.ZodError
        ? error.issues.map((issue) => issue.message).join(" ")
        : error.message;
    return { success: false, error: message };
  }
}

export async function deleteBlogPostAction(id: string) {
  try {
    await requireAdmin();
    const { error } = await createSupabaseServiceClient()
      .from("posts")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message };
  }
}

const diarySettingsSchema = z.object({
  background: z
    .string()
    .refine(
      (value) => DIARY_BACKGROUNDS.some((item) => item.id === value),
      "Fundo inválido",
    ),
  backgroundImageUrl: z.string().trim().optional().nullable(),
  order: z.array(z.string().min(1).max(80)).max(1000),
});

/** Salva o fundo do diário e a ordem dos blocos (public_pages, chave blog_diary). */
export async function saveDiarySettingsAction(data: unknown) {
  try {
    await requireAdmin();
    const input = diarySettingsSchema.parse(data);
    const { error } = await createSupabaseServiceClient()
      .from("public_pages")
      .upsert(
        {
          key: DIARY_SETTINGS_KEY,
          content: {
            background: input.background,
            backgroundImageUrl: safeContentUrl(input.backgroundImageUrl),
            order: [...new Set(input.order)],
          },
          is_published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    if (error) throw error;

    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving diary settings:", error);
    return { success: false, error: error.message };
  }
}

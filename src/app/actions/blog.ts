"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient, createSupabaseAnonServerClient } from "@/infrastructure/supabase/server";
import { z } from "zod";
import { getYouTubeVideoId } from "@/lib/course-content/media";

const blogPostSchema = z
  .object({
    title: z.string().min(1, "Título é obrigatório"),
    excerpt: z.string().optional().default(""),
    content: z.string().optional().default(""),
    type: z.enum(["blog", "news", "announcement", "library"]).default("blog"),
    image: z.string().url().or(z.literal("")).optional(),
    pdf_url: z.string().url().or(z.literal("")).optional(),
    post_format: z
      .enum(["article", "quote", "photo", "video"])
      .default("article")
      .optional(),
    youtube_url: z.string().optional().default(""),
    quote_author: z.string().optional().default(""),
    card_size: z.enum(["normal", "large", "tall"]).default("normal").optional(),
    bg_style: z.enum(["default", "watercolor", "forest", "terracotta"]).optional().default("default"),
    author: z.string().trim().max(160).optional(),
    date: z.string().max(32).optional(),
    readingTime: z.string().max(32).optional(),
  })
  .superRefine((value, context) => {
    if (value.type === "blog" && value.post_format === "video" && !getYouTubeVideoId(value.youtube_url)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["youtube_url"], message: "Informe um link válido do YouTube" });
    if (value.type === "blog" && value.post_format === "photo" && !value.image) context.addIssue({ code: z.ZodIssueCode.custom, path: ["image"], message: "Adicione uma fotografia" });
    if (value.type === "blog" && value.post_format === "quote" && !value.content.trim() && !value.excerpt.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["content"], message: "Escreva a frase" });
    if (value.type === "library" && !value.pdf_url) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pdf_url"],
        message: "Um arquivo PDF é obrigatório para materiais da biblioteca",
      });
    }

    if (
      value.type !== "library" &&
      (value.post_format ?? "article") === "article" &&
      !value.content?.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Conteúdo é obrigatório para artigos",
      });
    }
  });

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveBlogPostAction(id: string | null, data: any) {
  try {
    await requireAdmin();
    const validatedData = blogPostSchema.parse(data);
    const slug = slugify(validatedData.title);

    const supabase = createSupabaseServiceClient();
    let existing: Record<string, unknown> = {};
    if (id) {
      const { data: current, error } = await supabase.from("posts").select("legacy_payload").eq("id", id).single();
      if (error) throw error;
      if (current?.legacy_payload && typeof current.legacy_payload === "object" && !Array.isArray(current.legacy_payload)) existing = current.legacy_payload as Record<string, unknown>;
    }
    const payload = {
      title: validatedData.title,
      excerpt: validatedData.excerpt || null,
      content: validatedData.content || "",
      type: validatedData.type,
      image_url: validatedData.image || null,
      external_url: validatedData.youtube_url || null,
      pdf_url: validatedData.pdf_url || null,
      legacy_payload: {
        ...existing,
        author: validatedData.author || null,
        date: validatedData.date || null,
        readingTime: validatedData.readingTime || null,
        post_format: validatedData.post_format || "article",
        youtube_url: validatedData.youtube_url || null,
        quote_author: validatedData.quote_author || null,
        card_size: validatedData.card_size || "normal",
        bg_style: validatedData.bg_style || "default",
      },
      slug,
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = id
      ? await supabase.from("posts").update(payload).eq("id", id)
      : await supabase.from("posts").insert({
          ...payload,
          id: randomUUID(),
          created_at: new Date().toISOString(),
        });

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving blog post:", error);
    return { success: false, error: error.message };
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

export async function saveBlogThemeAction(theme: string) {
  try {
    await requireAdmin();
    const allowed = z.enum(["paper", "watercolor", "linen", "sage", "dark"]).parse(theme);
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("public_pages").upsert(
      {
        key: "blog_theme",
        content: { theme: allowed },
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving blog theme:", error);
    return { success: false, error: error.message };
  }
}

export async function getBlogThemeAction(): Promise<string> {
  try {
    const { data } = await createSupabaseAnonServerClient()
      .from("public_pages")
      .select("content")
      .eq("key", "blog_theme")
      .maybeSingle();

    return (data?.content as any)?.theme || "paper";
  } catch {
    return "paper";
  }
}

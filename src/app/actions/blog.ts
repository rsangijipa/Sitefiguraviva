"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient, createSupabaseAnonServerClient } from "@/infrastructure/supabase/server";
import { z } from "zod";

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
    bg_style: z.string().optional().default("default"),
  })
  .superRefine((value, context) => {
    if (value.type === "library" && !value.pdf_url) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pdf_url"],
        message: "Um arquivo PDF é obrigatório para materiais da biblioteca",
      });
    }

    if (
      value.type !== "library" &&
      value.post_format === "article" &&
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
    const payload = {
      title: validatedData.title,
      excerpt: validatedData.excerpt || null,
      content: validatedData.content || "",
      type: validatedData.type,
      image_url: validatedData.image || null,
      external_url: validatedData.youtube_url || null,
      pdf_url: validatedData.pdf_url || null,
      legacy_payload: {
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
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("public_pages").upsert(
      {
        key: "blog_theme",
        content: { theme },
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

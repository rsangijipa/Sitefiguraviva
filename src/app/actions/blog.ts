"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { z } from "zod";

// Posts live only in Supabase's `posts` table (see
// src/features/content/infrastructure/supabaseContentRepository.ts). This
// action used to write to Firestore while both public blog pages and the
// admin list/delete actions already read/wrote Supabase, so anything
// created or edited here silently diverged from what the site showed.
const blogPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  type: z.enum(["blog", "news", "announcement", "library"]).default("blog"),
  image: z.string().url().or(z.literal("")).optional(),
  pdf_url: z.string().url().or(z.literal("")).optional(),
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
      content: validatedData.content,
      type: validatedData.type,
      image_url: validatedData.image || null,
      pdf_url: validatedData.pdf_url || null,
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

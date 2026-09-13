"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin as assertIsAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { z } from "zod";

const galleryInput = z.object({
  title: z.string().trim().min(1).max(160),
  src: z.string().url(),
  caption: z.string().trim().max(1000).optional().default(""),
  tags: z.string().optional().default(""),
  category: z.string().trim().max(80).optional(),
});

export async function saveGalleryItemAction(id: string | null, data: unknown) {
  try {
    await assertIsAdmin();

    const input = galleryInput.parse(data);
    const payload = {
      image_url: input.src,
      title: input.title,
      caption: input.caption || null,
      tags: input.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_published: true,
      legacy_payload: input.category ? { category: input.category } : {},
      updated_at: new Date().toISOString(),
    };
    const supabase = createSupabaseServiceClient();

    if (id) {
      const { error } = await supabase
        .from("gallery_items")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("gallery_items")
        .insert({ id: crypto.randomUUID(), ...payload });
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/public-gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving gallery item:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    await assertIsAdmin();
    const { error } = await createSupabaseServiceClient()
      .from("gallery_items")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/public-gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: error.message };
  }
}

"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin as assertIsAdmin } from "@/lib/auth/server";

export async function saveGalleryItemAction(id: string | null, data: any) {
  try {
    await assertIsAdmin();

    const supabase = createSupabaseServiceClient();
    const payload = {
      id: id || randomUUID(),
      image_url: data.image_url || data.imageUrl || data.url,
      title: data.title || null,
      caption: data.caption || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      width: data.width || null,
      height: data.height || null,
      is_published: data.is_published ?? data.isPublished ?? true,
      legacy_payload: data,
    };
    if (!payload.image_url) throw new Error("Imagem obrigatória.");

    const { error } = await supabase
      .from("gallery_items")
      .upsert(payload as any);
    if (error) throw error;

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

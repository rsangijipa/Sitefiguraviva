"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin as assertIsAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { z } from "zod";
import { mergeGalleryLegacyPayload } from "@/features/public-site/gallery/gallery-payload";

const galleryInput = z.object({
  title: z.string().trim().min(1).max(160),
  src: z.string().url(),
  caption: z.string().trim().max(1000).optional().default(""),
  tags: z.string().optional().default(""),
  category: z.string().trim().max(80).optional(),
  year: z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => String(value ?? "").trim())
    .refine(
      (value) =>
        value === "" ||
        (/^\d{4}$/.test(value) &&
          Number(value) >= 1900 &&
          Number(value) <= new Date().getFullYear() + 1),
      "Ano deve ter quatro dígitos (ex.: 2024).",
    ),
  /** Cor predominante calculada no navegador após o upload (#rrggbb). */
  dominant_color: z.string().optional().nullable(),
});

export async function saveGalleryItemAction(id: string | null, data: unknown) {
  try {
    await assertIsAdmin();

    const input = galleryInput.parse(data);
    const supabase = createSupabaseServiceClient();
    let currentLegacy: unknown = {};
    let imageChanged = true;
    if (id) {
      const { data: current, error } = await supabase
        .from("gallery_items")
        .select("legacy_payload, image_url")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      currentLegacy = current?.legacy_payload ?? {};
      imageChanged = current?.image_url !== input.src;
    }
    const payload = {
      image_url: input.src,
      title: input.title,
      caption: input.caption || null,
      tags: input.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_published: true,
      legacy_payload: mergeGalleryLegacyPayload(currentLegacy, {
        ...input,
        imageChanged,
      }) as never,
      updated_at: new Date().toISOString(),
    };

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

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin as assertIsAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { z } from "zod";

const BOOK_COVERS_BUCKET = "public-book-covers";

const bookInput = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().default(""),
  coverImageUrl: z.string().trim().url(),
  coverStoragePath: z.string().trim().min(1),
  purchaseUrl: z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "O link de compra precisa começar com http:// ou https://.",
    }),
  publicationYear: z
    .union([z.number().int().min(0).max(9999), z.null()])
    .optional(),
});

function revalidateBookPaths() {
  revalidatePath("/");
  revalidatePath("/estante");
  revalidatePath("/admin/books");
}

export async function saveBookAction(id: string | null, data: unknown) {
  try {
    await assertIsAdmin();

    const input = bookInput.parse(data);
    const supabase = createSupabaseServiceClient();

    const payload = {
      title: input.title,
      author: input.author,
      description: input.description || "",
      cover_image_url: input.coverImageUrl,
      cover_storage_path: input.coverStoragePath,
      purchase_url: input.purchaseUrl,
      publication_year: input.publicationYear ?? null,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await supabase
        .from("book_recommendations")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { count, error: countError } = await supabase
        .from("book_recommendations")
        .select("id", { count: "exact", head: true });
      if (countError) throw countError;

      const { error } = await supabase.from("book_recommendations").insert({
        ...payload,
        is_published: false,
        sort_order: (count ?? 0) + 1,
      });
      if (error) throw error;
    }

    revalidateBookPaths();
    return { success: true };
  } catch (error: any) {
    console.error("Error saving book recommendation:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBookAction(id: string) {
  try {
    await assertIsAdmin();
    const supabase = createSupabaseServiceClient();

    const { data: book, error: fetchError } = await supabase
      .from("book_recommendations")
      .select("cover_storage_path")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from("book_recommendations")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    if (book?.cover_storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BOOK_COVERS_BUCKET)
        .remove([book.cover_storage_path]);
      if (storageError) {
        console.error("Error deleting book cover from storage:", storageError);
      }
    }

    revalidateBookPaths();
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting book recommendation:", error);
    return { success: false, error: error.message };
  }
}

export async function setBookPublishedAction(id: string, isPublished: boolean) {
  try {
    await assertIsAdmin();
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from("book_recommendations")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;

    revalidateBookPaths();
    return { success: true };
  } catch (error: any) {
    console.error("Error updating book publish state:", error);
    return { success: false, error: error.message };
  }
}

export async function reorderBooksAction(orderedIds: string[]) {
  try {
    await assertIsAdmin();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, error: "Lista de reordenação inválida." };
    }

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.rpc("reorder_book_recommendations", {
      p_ids: orderedIds,
    });
    if (error) throw error;

    revalidateBookPaths();
    return { success: true };
  } catch (error: any) {
    console.error("Error reordering book recommendations:", error);
    return { success: false, error: error.message };
  }
}

export async function listBooksAction() {
  try {
    await assertIsAdmin();
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("book_recommendations")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;

    return { success: true, data: data ?? [] };
  } catch (error: any) {
    console.error("Error listing book recommendations:", error);
    return { success: false, error: error.message, data: [] };
  }
}

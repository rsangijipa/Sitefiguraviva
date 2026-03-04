"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-server";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  type: z.enum(["blog", "news", "announcement", "library"]).default("blog"),
  image: z.string().url().or(z.literal("")).optional(),
});

export async function saveBlogPostAction(id: string | null, data: any) {
  try {
    await requireAdmin();
    const validatedData = blogPostSchema.parse(data);

    const slug = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-{2,}/g, "-");

    const payload = {
      ...validatedData,
      slug,
      updated_at: FieldValue.serverTimestamp(),
      isPublished: true,
    };

    if (id) {
      await adminDb.collection("posts").doc(id).update(payload);
    } else {
      await adminDb.collection("posts").add({
        ...payload,
        created_at: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath("/");
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
    await adminDb.collection("posts").doc(id).delete();

    revalidatePath("/");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message };
  }
}

"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { requireAdmin as assertIsAdmin } from "@/lib/auth/server";

export async function saveGalleryItemAction(id: string | null, data: any) {
  try {
    await assertIsAdmin();

    const payload = {
      ...data,
      updated_at: FieldValue.serverTimestamp(),
      isPublished: true,
    };

    if (id) {
      await adminDb.collection("gallery").doc(id).update(payload);
    } else {
      await adminDb.collection("gallery").add({
        ...payload,
        created_at: FieldValue.serverTimestamp(),
      });
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
    await adminDb.collection("gallery").doc(id).delete();

    revalidatePath("/");
    revalidatePath("/public-gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: error.message };
  }
}

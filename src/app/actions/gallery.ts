"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function assertIsAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    throw new Error("Unauthenticated");
  }

  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

  if (decodedToken.role === "admin" || decodedToken.admin === true) {
    return decodedToken;
  }

  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
  const userData = userDoc.data();

  if (userData?.role !== "admin") {
    throw new Error("Access Denied: Admin role required.");
  }

  return decodedToken;
}

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

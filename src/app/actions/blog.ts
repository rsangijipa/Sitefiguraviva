"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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

export async function saveBlogPostAction(id: string | null, data: any) {
  try {
    await assertIsAdmin();

    const slug = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-{2,}/g, "-");

    const payload = {
      ...data,
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
    await assertIsAdmin();
    await adminDb.collection("posts").doc(id).delete();

    revalidatePath("/");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message };
  }
}

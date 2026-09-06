"use server";

import { auth, db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface AddMaterialData {
  title: string;
  type: "link" | "pdf";
  url: string;
  description?: string;
  filePath?: string;
}

export async function addMaterial(courseId: string, data: AddMaterialData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden" };
    }

    const ref = db.collection("courses").doc(courseId).collection("materials");

    await ref.add({
      ...data,
      createdAt: Timestamp.now(),
      createdBy: claims.uid,
    });

    revalidatePath(`/admin/courses/${courseId}/materials`);
    revalidatePath(`/portal/materials`);
    revalidatePath(`/portal/course/${courseId}`); // Fix: Update course page content
    return { success: true };
  } catch (error) {
    console.error("Add Material Error:", error);
    return { error: "Failed to add material" };
  }
}

export async function deleteMaterial(
  courseId: string,
  materialId: string,
  filePath?: string,
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true)
      return { error: "Forbidden" };

    const materialRef = db
      .collection("courses")
      .doc(courseId)
      .collection("materials")
      .doc(materialId);
    const materialDoc = await materialRef.get();
    const resolvedFilePath =
      filePath || materialDoc.data()?.filePath || materialDoc.data()?.file_path;

    if (resolvedFilePath) {
      const { deleteStorageObject } =
        await import("@/infrastructure/supabase/storage.server");
      await deleteStorageObject({ bucket: "uploads", path: resolvedFilePath });
    }

    await materialRef.delete();

    revalidatePath(`/admin/courses/${courseId}/materials`);
    revalidatePath(`/portal/materials`);
    revalidatePath(`/portal/course/${courseId}`); // Fix: Update course page content
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete" };
  }
}

"use server";

import {
  addAdminMaterial,
  deleteAdminMaterial,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { requireAdmin } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

interface AddMaterialData {
  title: string;
  type: "link" | "pdf";
  url: string;
  description?: string;
  filePath?: string;
}

function refreshMaterialPages(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/materials`);
  revalidatePath("/portal/materials");
  revalidatePath(`/portal/course/${courseId}`);
}

export async function addMaterial(courseId: string, data: AddMaterialData) {
  try {
    await requireAdmin();
    await addAdminMaterial(courseId, {
      ...data,
      isPublished: true,
    });
    refreshMaterialPages(courseId);
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
  try {
    await requireAdmin();
    await deleteAdminMaterial(materialId, filePath);
    refreshMaterialPages(courseId);
    return { success: true };
  } catch (error) {
    console.error("Delete Material Error:", error);
    return { error: "Failed to delete" };
  }
}

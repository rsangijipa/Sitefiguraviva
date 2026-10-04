"use server";

import { saveLessonContent, getLessonContent } from "@/lib/courseService";
import { Block } from "@/types/lms";
import { revalidatePath } from "next/cache";

export async function getLessonContentAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  try {
    const data = await getLessonContent(courseId, moduleId, lessonId);
    return data
      ? { success: true, data }
      : { success: false, error: "Conteúdo indisponível." };
  } catch {
    console.error("Lesson content unavailable");
    return { success: false, error: "Conteúdo indisponível." };
  }
}

export async function updateLessonBlocksAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  blocks: Block[],
) {
  try {
    await saveLessonContent(courseId, moduleId, lessonId, blocks);
    // Revalidate the builder page and the student course page
    revalidatePath(`/admin/courses/${courseId}/builder`);
    revalidatePath(`/portal/course/${courseId}`);
    return { success: true };
  } catch {
    console.error("Lesson content update failed");
    return { success: false, error: "Não foi possível salvar o conteúdo." };
  }
}

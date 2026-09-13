"use server";

import { revalidatePath } from "next/cache";
import { assertIsTutorOrAdmin } from "@/lib/auth/authoring-gate";
import {
  bumpAdminCourseRevision,
  getAdminPublishingSnapshot,
  listAdminLessons,
  listAdminModules,
  updateAdminCourse,
  updateAdminLesson,
  updateAdminModule,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

function revalidateCourse(courseId: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath("/curso");
  revalidatePath(`/curso/${courseId}`);
  revalidatePath("/portal/courses");
}

export async function validateCoursePublishable(courseId: string) {
  const { course, modules, lessons } =
    await getAdminPublishingSnapshot(courseId);
  if (!course) return { valid: false, errors: ["Curso não encontrado."] };
  const errors: string[] = [];
  if (!course.title) errors.push("Curso precisa de um título.");
  if (!course.description) errors.push("Curso precisa de uma descrição.");
  if (!course.coverImage && !course.image)
    errors.push("Curso precisa de uma imagem de capa.");
  const publishedModules = modules.filter((module) => module.isPublished);
  if (publishedModules.length === 0)
    errors.push("O curso precisa ter pelo menos um módulo publicado.");
  for (const courseModule of publishedModules) {
    const publishedLessons = lessons.filter(
      (lesson) => lesson.moduleId === courseModule.id && lesson.isPublished,
    );
    if (publishedLessons.length === 0) {
      errors.push(
        `O módulo "${courseModule.title || "Sem título"}" está publicado, mas não possui aulas publicadas.`,
      );
      continue;
    }
    for (const lesson of publishedLessons) {
      if (!Array.isArray(lesson.blocks) || lesson.blocks.length === 0) {
        errors.push(
          `A aula "${lesson.title || "Sem título"}" está publicada, mas não possui conteúdo (blocos).`,
        );
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export async function toggleCourseStatus(
  courseId: string,
  currentStatus: string,
) {
  try {
    const actor = await assertIsTutorOrAdmin();
    const newStatus = currentStatus === "open" ? "draft" : "open";
    const isPublished = newStatus === "open";
    if (isPublished) {
      const result = await validateCoursePublishable(courseId);
      if (!result.valid)
        return { success: false, error: result.errors.join(" | ") };
    }
    await updateAdminCourse(courseId, { status: newStatus, isPublished });
    const newRevision = await bumpAdminCourseRevision(courseId);
    await import("@/lib/audit").then((m) =>
      m.auditService.logEvent({
        eventType: "COURSE_STATUS_UPDATED",
        actor: { uid: actor.uid, email: actor.email },
        target: { id: courseId, collection: "courses" },
        payload: {
          status: newStatus,
          isPublished,
          contentRevision: newRevision,
        },
      }),
    );
    revalidateCourse(courseId);
    return { success: true, newStatus, isPublished };
  } catch (error) {
    console.error("Failed to toggle course status:", error);
    return { success: false, error: "Database update failed" };
  }
}

export async function bumpCourseRevision(courseId: string) {
  try {
    await assertIsTutorOrAdmin();
    const newRevision = await bumpAdminCourseRevision(courseId);
    revalidateCourse(courseId);
    return { success: true, newRevision };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database update failed",
    };
  }
}

export async function toggleModulePublish(
  courseId: string,
  moduleId: string,
  isPublished: boolean,
) {
  try {
    await assertIsTutorOrAdmin();
    const courseModule = (await listAdminModules(courseId)).find(
      (item) => item.id === moduleId,
    );
    if (!courseModule)
      return { success: false, error: "Módulo não encontrado neste curso." };
    if (
      isPublished &&
      !(await listAdminLessons(courseId, moduleId)).some(
        (lesson) => lesson.isPublished,
      )
    ) {
      return {
        success: false,
        error: "O módulo precisa ter pelo menos uma aula publicada.",
      };
    }
    await updateAdminModule(moduleId, { isPublished });
    await bumpAdminCourseRevision(courseId);
    revalidateCourse(courseId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database update failed",
    };
  }
}

export async function toggleLessonPublish(
  courseId: string,
  moduleId: string,
  lessonId: string,
  isPublished: boolean,
) {
  try {
    await assertIsTutorOrAdmin();
    const lesson = (await listAdminLessons(courseId, moduleId)).find(
      (item) => item.id === lessonId,
    );
    if (!lesson)
      return { success: false, error: "Aula não encontrada neste módulo." };
    if (
      isPublished &&
      (!Array.isArray(lesson.blocks) || lesson.blocks.length === 0)
    ) {
      return {
        success: false,
        error: "A aula precisa ter conteúdo (blocos) para ser publicada.",
      };
    }
    await updateAdminLesson(lessonId, { isPublished });
    await bumpAdminCourseRevision(courseId);
    revalidateCourse(courseId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database update failed",
    };
  }
}

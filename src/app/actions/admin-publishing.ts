"use server";

import { revalidatePath } from "next/cache";
import { assertIsTutorOrAdmin } from "@/lib/auth/authoring-gate";
import {
  getAdminCourse,
  listAdminModules,
  listAdminLessons,
  updateAdminCourse,
  updateAdminModule,
  updateAdminLesson,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

function hasPublishedContent(lesson: any): boolean {
  if (typeof lesson.content === "string" && lesson.content.trim()) return true;
  return (
    Array.isArray(lesson.blocks) &&
    lesson.blocks.some((b: any) => b?.isPublished !== false)
  );
}

export async function validateCoursePublishable(courseId: string) {
  const errors: string[] = [];
  const course = await getAdminCourse(courseId);
  if (!course) return { valid: false, errors: ["Curso não encontrado."] };
  if (!course.title) errors.push("Curso precisa de um título.");
  if (!course.description) errors.push("Curso precisa de uma descrição.");
  if (!course.image) errors.push("Curso precisa de uma imagem de capa.");
  const modules = await listAdminModules(courseId);
  const publishedModules = modules.filter((m: any) => m.isPublished !== false);
  if (!publishedModules.length)
    errors.push("O curso precisa ter pelo menos um módulo publicado.");
  let hasLesson = false;
  for (const courseModule of publishedModules) {
    const lessons = await listAdminLessons(courseId, courseModule.id);
    const publishedLessons = lessons.filter(
      (l: any) => l.isPublished !== false,
    );
    if (!publishedLessons.length)
      errors.push(
        `O módulo "${courseModule.title || "Sem título"}" não possui aulas publicadas.`,
      );
    for (const lesson of publishedLessons) {
      hasLesson = true;
      if (!hasPublishedContent(lesson))
        errors.push(
          `A aula "${lesson.title || "Sem título"}" não possui conteúdo.`,
        );
    }
  }
  if (publishedModules.length && !hasLesson)
    errors.push("O curso precisa ter pelo menos uma aula publicada.");
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
    const course = await getAdminCourse(courseId);
    if (!course) throw new Error("Curso não encontrado.");
    await updateAdminCourse(courseId, {
      status: newStatus as any,
      isPublished,
    });
    const { auditService } = await import("@/lib/audit");
    await auditService.logEvent({
      eventType: "COURSE_STATUS_UPDATED",
      actor: { uid: actor.uid, email: actor.email },
      target: { id: courseId, collection: "courses" },
      diff: {
        before: { status: currentStatus, isPublished: course.isPublished },
        after: { status: newStatus, isPublished },
      },
    });
    revalidatePath("/admin/courses");
    revalidatePath("/");
    revalidatePath("/curso");
    revalidatePath(`/curso/${courseId}`);
    return { success: true, newStatus, isPublished };
  } catch (error: any) {
    return { success: false, error: error.message || "Database update failed" };
  }
}

export async function bumpCourseRevision(courseId: string) {
  try {
    const actor = await assertIsTutorOrAdmin();
    const course = await getAdminCourse(courseId);
    if (!course) throw new Error("Course not found");
    const oldRevision = (course as any).contentRevision || 1;
    const newRevision = oldRevision + 1;
    await updateAdminCourse(courseId, { contentRevision: newRevision } as any);
    const { auditService } = await import("@/lib/audit");
    await auditService.logEvent({
      eventType: "COURSE_VERSION_BUMPED",
      actor: { uid: actor.uid, email: actor.email },
      target: { id: courseId, collection: "courses" },
      payload: { oldRevision, newRevision },
    });
    revalidatePath(`/curso/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, newRevision };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleModulePublish(
  courseId: string,
  moduleId: string,
  isPublished: boolean,
) {
  try {
    await assertIsTutorOrAdmin();
    if (
      isPublished &&
      !(await listAdminLessons(courseId, moduleId)).some(
        (l: any) => l.isPublished !== false,
      )
    )
      return {
        success: false,
        error: "O módulo precisa ter pelo menos uma aula publicada.",
      };
    await updateAdminModule(moduleId, { isPublished });
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
      (l: any) => l.id === lessonId,
    ) as any;
    if (!lesson) throw new Error("Aula não encontrada.");
    if (isPublished && !hasPublishedContent(lesson))
      return {
        success: false,
        error: "A aula precisa ter conteúdo (blocos) para ser publicada.",
      };
    await updateAdminLesson(lessonId, { isPublished });
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/portal/course/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

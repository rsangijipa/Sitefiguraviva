"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getAdminCourse } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { assertCanAuthorCourse } from "@/lib/auth/authoring-gate";
import {
  bumpAdminCourseRevision,
  listAdminLessons,
  listAdminModules,
  updateAdminLesson,
  updateAdminModule,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

function revalidateCourse(courseId: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath("/curso");
  revalidatePath(`/curso/${courseId}`);
  revalidatePath("/curso/[id]", "page");
  revalidatePath("/inscricao/[courseId]", "page");
  revalidatePath("/portal/courses");
}

export async function validateCoursePublishable(courseId: string) {
  await requireAdmin();
  const course = await getAdminCourse(courseId);
  if (!course) return { valid: false, errors: ["Curso não encontrado."] };
  const errors: string[] = [];
  if (!course.title?.trim()) errors.push("Curso precisa de um título.");
  if (!course.description?.trim())
    errors.push("Curso precisa de uma descrição.");
  if (!(course.coverImage || course.image)?.trim())
    errors.push("Curso precisa de uma imagem de capa.");
  return { valid: errors.length === 0, errors };
}

const commercialErrors: Record<string, string> = {
  "Title, description and cover required":
    "Preencha título, descrição e capa antes de publicar.",
  "Publish the offer before opening enrollment":
    "Publique a oferta antes de abrir as inscrições.",
  "Initial Pix price required":
    "Configure o valor Pix da matrícula ou primeira parcela antes de abrir as inscrições.",
  "Archived course requires separate restoration":
    "Cursos arquivados exigem restauração antes de publicar.",
  "Course not found": "Curso não encontrado.",
};
export async function setCourseCommercialState(
  courseId: string,
  command: "publish" | "unpublish" | "open" | "close",
) {
  const actor = await requireAdmin();
  if (!["publish", "unpublish", "open", "close"].includes(command))
    return { success: false, error: "Operação inválida." };
  try {
    const { data, error } = await createSupabaseServiceClient().rpc(
      "set_course_commercial_state",
      {
        p_actor: actor.uid,
        p_course: courseId,
        p_command: command,
      },
    );
    if (error)
      return {
        success: false,
        error:
          commercialErrors[error.message] ||
          "Não foi possível atualizar a oferta.",
      };
    const state = data as {
      status: "draft" | "open" | "closed" | "archived";
      isPublished: boolean;
      contentRevision: number;
    };
    if (!state || typeof state.isPublished !== "boolean" || !state.status)
      throw new Error("Invalid state");
    // The state and revision have already committed atomically. Audit delivery must not report a false failure.
    try {
      const { auditService } = await import("@/lib/audit");
      await auditService.logEvent({
        eventType: "COURSE_STATUS_UPDATED",
        actor: { uid: actor.uid, email: actor.email },
        target: { id: courseId, collection: "courses" },
        payload: { command, ...state },
      });
    } catch {
      console.error("Course status audit delivery failed");
    }
    revalidateCourse(courseId);
    return {
      success: true,
      newStatus: state.status,
      isPublished: state.isPublished,
      contentRevision: state.contentRevision,
    };
  } catch {
    return { success: false, error: "Não foi possível atualizar a oferta." };
  }
}

// Compatibility for existing callers: derive the command from persisted state, never a client status.
export async function toggleCourseStatus(
  courseId: string,
  _currentStatus?: string,
) {
  await requireAdmin();
  const course = await getAdminCourse(courseId);
  if (!course) return { success: false, error: "Curso não encontrado." };
  return setCourseCommercialState(
    courseId,
    course.isPublished ? "unpublish" : "publish",
  );
}

export async function bumpCourseRevision(courseId: string) {
  try {
    await assertCanAuthorCourse(courseId);
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
    await assertCanAuthorCourse(courseId);
    if (typeof isPublished !== "boolean")
      return { success: false, error: "Publicação inválida." };
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
    await assertCanAuthorCourse(courseId);
    if (typeof isPublished !== "boolean")
      return { success: false, error: "Publicação inválida." };
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

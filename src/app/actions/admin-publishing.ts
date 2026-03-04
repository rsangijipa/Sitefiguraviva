"use server";

import { revalidatePath } from "next/cache";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { assertIsTutorOrAdmin } from "@/lib/auth/authoring-gate";

export async function validateCoursePublishable(
  courseId: string,
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  if (!courseSnap.exists)
    return { valid: false, errors: ["Curso não encontrado."] };

  const courseData = courseSnap.data();
  if (!courseData?.title) errors.push("Curso precisa de um título.");
  if (!courseData?.description) errors.push("Curso precisa de uma descrição.");
  if (!courseData?.coverImage && !courseData?.image)
    errors.push("Curso precisa de uma imagem de capa.");

  const modulesSnap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .get();
  // Assume missing isPublished flag means it is published (legacy default)
  const publishedModules = modulesSnap.docs.filter(
    (doc) => doc.data().isPublished !== false,
  );

  if (publishedModules.length === 0) {
    errors.push("O curso precisa ter pelo menos um módulo publicado.");
  }

  let hasPublishedLesson = false;

  for (const mod of publishedModules) {
    const lessonsSnap = await mod.ref.collection("lessons").get();
    const publishedLessons = lessonsSnap.docs.filter(
      (doc) => doc.data().isPublished !== false,
    );

    if (publishedLessons.length === 0) {
      errors.push(
        `O módulo "${mod.data().title || "Sem título"}" está publicado, mas não possui aulas publicadas.`,
      );
    }

    for (const lesson of publishedLessons) {
      hasPublishedLesson = true;
      const blocksSnap = await lesson.ref.collection("blocks").get();
      const publishedBlocks = blocksSnap.docs.filter(
        (doc) => doc.data().isPublished !== false,
      );

      const hasLegacyContent = !!lesson.data().content;

      if (publishedBlocks.length === 0 && !hasLegacyContent) {
        errors.push(
          `A aula "${lesson.data().title || "Sem título"}" está publicada, mas não possui conteúdo (blocos).`,
        );
      }
    }
  }

  if (publishedModules.length > 0 && !hasPublishedLesson) {
    errors.push("O curso precisa ter pelo menos uma aula publicada.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function toggleCourseStatus(
  courseId: string,
  currentStatus: string,
) {
  try {
    await assertIsTutorOrAdmin();
  } catch (e) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const newStatus = currentStatus === "open" ? "draft" : "open";
    const isPublished = newStatus === "open";

    if (isPublished) {
      const { valid, errors } = await validateCoursePublishable(courseId);
      if (!valid) {
        return {
          success: false,
          error: errors.join(" | "),
        };
      }
    }

    const courseRef = adminDb.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();
    const oldData = courseDoc.data();

    const updates: any = {
      status: newStatus,
      isPublished: isPublished,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isPublished) {
      updates.publishedAt = FieldValue.serverTimestamp();
    }

    await courseRef.update(updates);

    // Audit Trail
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const session = cookieStore.get("session")?.value;
    const actor = await adminAuth.verifySessionCookie(session || "", true);

    await import("@/lib/audit").then((m) =>
      m.auditService.logEvent({
        eventType: "COURSE_STATUS_UPDATED",
        actor: { uid: actor.uid, email: actor.email },
        target: { id: courseId, collection: "courses" },
        diff: {
          before: { status: currentStatus, isPublished: oldData?.isPublished },
          after: { status: newStatus, isPublished },
        },
      }),
    );

    // Revalidate all relevant paths
    revalidatePath("/admin/courses");
    revalidatePath("/");
    revalidatePath("/curso");
    revalidatePath(`/curso/${courseId}`);
    revalidatePath(`/portal/courses`); // Student dashboard

    return { success: true, newStatus, isPublished };
  } catch (error) {
    console.error("Failed to toggle course status:", error);
    return { success: false, error: "Database update failed" };
  }
}

/**
 * Increments the contentRevision of a course, effectively creating a new academic version.
 * This is useful when major content changes are made and we want new certificates to reflect this.
 */
export async function bumpCourseRevision(courseId: string) {
  try {
    await assertIsTutorOrAdmin();
    const courseRef = adminDb.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) throw new Error("Course not found");

    const data = courseDoc.data();
    const oldRevision = data?.contentRevision || 1;
    const newRevision = oldRevision + 1;

    await courseRef.update({
      contentRevision: newRevision,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Audit Trail
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const session = cookieStore.get("session")?.value;
    const actor = await adminAuth.verifySessionCookie(session || "", true);

    await import("@/lib/audit").then((m) =>
      m.auditService.logEvent({
        eventType: "COURSE_VERSION_BUMPED",
        actor: { uid: actor.uid, email: actor.email },
        target: { id: courseId, collection: "courses" },
        payload: { oldRevision, newRevision },
      }),
    );

    revalidatePath(`/curso/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}`);

    return { success: true, newRevision };
  } catch (error: any) {
    console.error("Failed to bump course revision:", error);
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
    if (isPublished) {
      // Validate: Module must have at least one published lesson
      const lessonsSnap = await adminDb
        .collection("courses")
        .doc(courseId)
        .collection("modules")
        .doc(moduleId)
        .collection("lessons")
        .get();

      const publishedLessons = lessonsSnap.docs.filter(
        (doc) => doc.data().isPublished !== false,
      );
      if (publishedLessons.length === 0) {
        return {
          success: false,
          error: "O módulo precisa ter pelo menos uma aula publicada.",
        };
      }
    }
    await adminDb
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .doc(moduleId)
      .update({
        isPublished,
        updatedAt: FieldValue.serverTimestamp(),
      });

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
    if (isPublished) {
      // Validate: Lesson must have blocks OR legacy content
      const lessonRef = adminDb
        .collection("courses")
        .doc(courseId)
        .collection("modules")
        .doc(moduleId)
        .collection("lessons")
        .doc(lessonId);

      const lessonSnap = await lessonRef.get();
      const blocksSnap = await lessonRef.collection("blocks").get();
      const publishedBlocks = blocksSnap.docs.filter(
        (doc) => doc.data().isPublished !== false,
      );
      const hasLegacyContent = !!lessonSnap.data()?.content;

      if (publishedBlocks.length === 0 && !hasLegacyContent) {
        return {
          success: false,
          error: "A aula precisa ter conteúdo (blocos) para ser publicada.",
        };
      }
    }
    await adminDb
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons")
      .doc(lessonId)
      .update({
        isPublished,
        updatedAt: FieldValue.serverTimestamp(),
      });

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

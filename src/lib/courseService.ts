import "server-only";

import { Block } from "@/types/lms";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { deepSafeSerialize } from "./utils";

import { toCourseFullDTO } from "@/lib/presenters/mappers";

import {
  assertCanAccessCourse,
  assertCurrentCourseAccess,
} from "./auth/access-gate";
import { AccessError, AccessErrorCode } from "./auth/access-types";
import { assertCanAuthorCourse } from "./auth/authoring-gate";
import { getCourseOutlineById } from "@/features/courses/infrastructure/supabaseCourseRepository.server";
import { readableLesson, readableOutline } from "./course-content.server";
import {
  getAdminCourse,
  listAdminLessons,
  listAdminModules,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { findEnrollmentBySupabaseUser } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";
import { listProgressBySupabaseUser } from "@/features/progress/infrastructure/supabaseProgressRepository.server";

export async function getCourseData(
  courseId: string,
  userId: string,
  isAdmin: boolean = false,
) {
  if (!courseId || !userId) return null;

  // 1. Fetch Course & Core Context via Canonical Gate
  let accessContext;
  let isAccessDenied = false;

  try {
    accessContext = await assertCanAccessCourse(userId, courseId, { isAdmin });
  } catch (error) {
    if (error instanceof AccessError) {
      if (
        [
          AccessErrorCode.AUTH_REQUIRED,
          AccessErrorCode.ACCESS_DENIED,
          AccessErrorCode.COURSE_NOT_AVAILABLE,
          AccessErrorCode.COURSE_NOT_PUBLISHED,
          AccessErrorCode.COURSE_ARCHIVED,
          AccessErrorCode.ENROLLMENT_NOT_FOUND,
        ].includes(error.code)
      ) {
        return null; // Don't even show metadata if not published
      }
      isAccessDenied = true;
    } else {
      throw error;
    }
  }

  const course = await getAdminCourse(courseId);
  if (!course) return null;
  const preview = !!(
    accessContext?.isAdminOverride || accessContext?.isTeamPreview
  );
  if (isAccessDenied)
    return toCourseFullDTO(
      course,
      [],
      new Map(),
      new Map(),
      undefined,
      false,
      true,
    );

  const enrollmentResult = preview
    ? null
    : await findEnrollmentBySupabaseUser(userId, courseId);

  // 2. Fetch Progress (ATOMIC)
  const progressMap = new Map<string, any>();
  const progressRows = await listProgressBySupabaseUser(userId, courseId);
  progressRows.forEach((row) => {
    if (row.lessonId) {
      progressMap.set(row.lessonId, {
        ...row,
        lessonId: row.lessonId,
      });
    }
  });

  // 3. Fetch Modules
  const modules = (await listAdminModules(courseId)).filter(
    (m) => preview || m.isPublished === true,
  );

  // 4. Fetch All Lessons (Optimized Parallel)
  // We create a map of ModuleID -> LessonDocs[]
  const lessonsMap = new Map<string, any[]>();

  await Promise.all(
    modules.map(async (module) => {
      const lessons = await listAdminLessons(courseId, module.id);
      lessonsMap.set(
        module.id,
        lessons.filter((l) => preview || l.isPublished === true),
      );
    }),
  );

  // 5. Map to DTO
  return toCourseFullDTO(
    course,
    modules,
    lessonsMap,
    progressMap,
    enrollmentResult,
    preview,
    isAccessDenied,
  );
}

export async function getLessonContent(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  const access = await assertCurrentCourseAccess(courseId);
  const preview = !!(access.isAdminOverride || access.isTeamPreview);
  const courseModule = (await listAdminModules(courseId)).find(
    (m) => m.id === moduleId,
  );
  if (!courseModule || (!preview && courseModule.isPublished !== true)) return null;
  const lesson = (await listAdminLessons(courseId, moduleId)).find(
    (l) => l.id === lessonId,
  );
  if (!lesson || (!preview && lesson.isPublished !== true)) return null;
  const safeLesson = readableLesson(lesson, preview);
  return deepSafeSerialize({
    lesson: safeLesson,
    blocks: safeLesson.blocks,
    isEmpty: safeLesson.blocks.length === 0,
  });
}

export async function saveLessonContent(
  courseId: string,
  moduleId: string,
  lessonId: string,
  blocks: Block[],
) {
  await assertCanAuthorCourse(courseId);
  if (
    typeof moduleId !== "string" ||
    !moduleId ||
    moduleId.length > 200 ||
    typeof lessonId !== "string" ||
    !lessonId ||
    lessonId.length > 200 ||
    !Array.isArray(blocks) ||
    blocks.length > 500 ||
    blocks.some((b) => !b || typeof b !== "object" || Array.isArray(b))
  )
    throw new Error("Conteúdo inválido.");
  const courseModule = (await listAdminModules(courseId)).find(
    (m) => m.id === moduleId,
  );
  if (!courseModule) throw new Error("Módulo não encontrado neste curso.");
  const supabase = createSupabaseServiceClient();
  const safeBlocks = (blocks || []).map((b: any, idx: number) => ({
    ...b,
    // Default ordering and publish state (legacy data may omit these fields)
    order: typeof b?.order === "number" ? b.order : idx + 1,
    isPublished: b?.isPublished !== false,
  })) as Block[];
  const { error } = await supabase.rpc("save_lesson_content", {
    p_course_id: courseId,
    p_module_id: moduleId,
    p_lesson_id: lessonId,
    p_blocks: safeBlocks as any,
  });
  if (error) throw error;
}

/** The student page must never serialize an administrative outline directly. */
export async function getReadableCourseOutline(courseId: string) {
  const access = await assertCurrentCourseAccess(courseId);
  const outline = await getCourseOutlineById(courseId);
  if (!outline) return null;
  return readableOutline(
    outline,
    !!(access.isAdminOverride || access.isTeamPreview),
  );
}

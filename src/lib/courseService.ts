import { Lesson, Block } from "@/types/lms";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { deepSafeSerialize } from "./utils";

import { toCourseFullDTO } from "@/lib/presenters/mappers";

import { assertCanAccessCourse } from "./auth/access-gate";
import { AccessError, AccessErrorCode } from "./auth/access-types";
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
      if (error.code === AccessErrorCode.COURSE_NOT_AVAILABLE) {
        return null; // Don't even show metadata if not published
      }
      isAccessDenied = true;
    } else {
      throw error;
    }
  }

  const course = await getAdminCourse(courseId);
  if (!course) return null;

  const enrollmentResult = accessContext?.isAdminOverride
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
  const modules = await listAdminModules(courseId);

  // 4. Fetch All Lessons (Optimized Parallel)
  // We create a map of ModuleID -> LessonDocs[]
  const lessonsMap = new Map<string, any[]>();

  await Promise.all(
    modules.map(async (module) => {
      const lessons = await listAdminLessons(courseId, module.id);
      lessonsMap.set(module.id, lessons);
    }),
  );

  // 5. Map to DTO
  return toCourseFullDTO(
    course,
    modules,
    lessonsMap,
    progressMap,
    enrollmentResult,
    isAdmin,
    isAccessDenied,
  );
}

export async function getLessonContent(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  const lessons = await listAdminLessons(courseId, moduleId);
  const lesson = lessons.find((item) => item.id === lessonId) as
    | Lesson
    | undefined;
  if (!lesson) return null;

  const blocks = ((lesson as any).blocks || [])
    .map((block: any, index: number) => ({
      id: block.id || `${lessonId}-block-${index + 1}`,
      ...block,
      order: typeof block.order === "number" ? block.order : index + 1,
      isPublished: block.isPublished !== false,
    }))
    .filter((block: any) => block.isPublished !== false) as Block[];

  return deepSafeSerialize({
    lesson,
    blocks,
    isEmpty: blocks.length === 0,
  });
}

export async function saveLessonContent(
  courseId: string,
  moduleId: string,
  lessonId: string,
  blocks: Block[],
) {
  const supabase = createSupabaseServiceClient();
  const safeBlocks = (blocks || []).map((b: any, idx: number) => ({
    ...b,
    // Default ordering and publish state (legacy data may omit these fields)
    order: typeof b?.order === "number" ? b.order : idx + 1,
    isPublished: b?.isPublished !== false,
  })) as Block[];
  const { error: lessonError } = await supabase
    .from("lessons")
    .update({ blocks: safeBlocks as any })
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .eq("module_id", moduleId);
  if (lessonError) throw lessonError;

  const { data: course, error: courseReadError } = await supabase
    .from("courses")
    .select("content_revision")
    .eq("id", courseId)
    .single();
  if (courseReadError) throw courseReadError;

  const { error: courseError } = await supabase
    .from("courses")
    .update({ content_revision: (course.content_revision ?? 0) + 1 })
    .eq("id", courseId);
  if (courseError) throw courseError;
}

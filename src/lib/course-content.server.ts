import "server-only";

import type { CourseOutlineRecord } from "@/features/courses/domain/course.types";
import type { Block } from "@/types/lms";

/** Explicit projection prevents legacy payloads and unpublished blocks leaking in props. */
export function readableLesson(lesson: any, preview = false) {
  const blocks: Block[] = (Array.isArray(lesson.blocks) ? lesson.blocks : [])
    .filter(
      (block: any) =>
        block && typeof block === "object" && !Array.isArray(block),
    )
    .filter((block: any) => preview || block.isPublished !== false)
    .map((block: any, index: number) => ({
      ...block,
      id: block.id || `${lesson.id}-block-${index + 1}`,
      order: typeof block.order === "number" ? block.order : index + 1,
      isPublished: block.isPublished !== false,
    }));
  return {
    id: lesson.id,
    courseId: lesson.courseId,
    moduleId: lesson.moduleId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    isPublished: lesson.isPublished,
    slug: lesson.slug,
    type: lesson.type,
    duration: lesson.duration ?? lesson.durationMinutes,
    videoUrl: lesson.videoUrl,
    thumbnail: lesson.thumbnail ?? lesson.thumbnailUrl,
    isFreePreview: lesson.isFreePreview,
    blocks,
  };
}

export function readableOutline(outline: CourseOutlineRecord, preview = false) {
  return {
    course: outline.course,
    modules: outline.modules
      .filter((module) => preview || module.isPublished === true)
      .map((module) => ({
        id: module.id,
        courseId: module.courseId,
        title: module.title,
        description: module.description,
        order: module.order,
        isPublished: module.isPublished,
        slug: module.slug,
        lessons: module.lessons
          .filter((lesson) => preview || lesson.isPublished === true)
          .map((lesson) => readableLesson(lesson, preview)),
      })),
  };
}

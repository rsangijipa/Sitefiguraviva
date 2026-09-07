import {
  listPublishedCourses,
  type ContentRecord,
} from "@/features/content/infrastructure/supabaseContentRepository";
import type { Lesson, Module } from "@/types/lms";

export interface CourseWithModules extends ContentRecord {
  modules: ModuleWithLessons[];
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export async function getCourseById(
  courseId: string,
): Promise<ContentRecord | null> {
  const courses = await listPublishedCourses();
  return (
    courses.find(
      (course) => course.id === courseId || course.slug === courseId,
    ) ?? null
  );
}

export async function getCourseContent(
  courseId: string,
): Promise<CourseWithModules | null> {
  const course = await getCourseById(courseId);
  return course ? { ...course, modules: [] } : null;
}

export async function getCourseBySlug(
  slug: string,
): Promise<ContentRecord | null> {
  const courses = await listPublishedCourses();
  return courses.find((course) => course.slug === slug) ?? null;
}

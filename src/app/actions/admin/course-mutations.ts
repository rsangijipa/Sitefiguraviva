"use server";

import { requireAdmin } from "@/lib/auth/server";
import {
  CommunityThreadDoc,
  CourseDoc,
  EnrollmentDoc,
  LessonDoc,
  MaterialDoc,
  ModuleDoc,
} from "@/types/lms";
import { revalidatePath } from "next/cache";
import {
  getAdminCourse,
  listAdminCourses,
  listAdminModules,
  listAdminLessons,
  listAdminMaterials,
  listAdminCourseEnrollments,
  listAdminCourseThreads,
  toggleAdminEnrollmentStatus,
  updateAdminThread,
  deleteAdminThread,
  addAdminMaterial,
  updateAdminMaterial,
  deleteAdminMaterial,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  createAdminModule,
  updateAdminModule,
  deleteAdminModule,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  syncAdminLessonsCount,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
// --- READS ---

export async function getAllCoursesAction(): Promise<CourseDoc[]> {
  await requireAdmin();
  return listAdminCourses();
}

export async function getCourseAction(
  courseId: string,
): Promise<CourseDoc | null> {
  await requireAdmin();
  return getAdminCourse(courseId);
}

export async function getModulesAction(courseId: string): Promise<ModuleDoc[]> {
  await requireAdmin();
  return listAdminModules(courseId);
}

export async function getLessonsAction(
  courseId: string,
  moduleId: string,
): Promise<LessonDoc[]> {
  await requireAdmin();
  return listAdminLessons(courseId, moduleId);
}

export async function getCourseEnrollmentsAction(
  courseId: string,
): Promise<Array<EnrollmentDoc & { id: string }>> {
  await requireAdmin();
  return listAdminCourseEnrollments(courseId);
}

export async function getCourseThreadsAction(
  courseId: string,
): Promise<CommunityThreadDoc[]> {
  await requireAdmin();
  return listAdminCourseThreads(courseId);
}

export async function getMaterialsAction(
  courseId: string,
): Promise<MaterialDoc[]> {
  await requireAdmin();
  return listAdminMaterials(courseId);
}

// --- COURSES ---

export async function createCourseAction(
  data: Partial<CourseDoc>,
): Promise<string> {
  await requireAdmin();
  const id = await createAdminCourse({
    ...data,
    status: "draft",
    isPublished: false,
  });
  revalidatePath("/admin/courses");
  return id;
}

export async function updateCourseAction(
  courseId: string,
  data: Partial<CourseDoc>,
): Promise<void> {
  await requireAdmin();
  await updateAdminCourse(courseId, data);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath("/curso");
  revalidatePath(`/curso/${courseId}`);
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  await requireAdmin();
  await deleteAdminCourse(courseId);
  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/curso");
}

// --- MODULES ---

export async function createModuleAction(
  courseId: string,
  title: string,
  order: number,
): Promise<string> {
  await requireAdmin();
  return createAdminModule(courseId, title, order);
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  data: Partial<ModuleDoc>,
): Promise<void> {
  await requireAdmin();
  await updateAdminModule(moduleId, data);
  await syncAdminLessonsCount(courseId);
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string,
): Promise<void> {
  await requireAdmin();
  await deleteAdminModule(moduleId);
  await syncAdminLessonsCount(courseId);
}

// --- LESSONS ---

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  title: string,
  order: number,
): Promise<string> {
  await requireAdmin();
  return createAdminLesson(courseId, moduleId, title, order);
}

export async function updateLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: Partial<LessonDoc>,
): Promise<void> {
  await requireAdmin();
  await updateAdminLesson(lessonId, data);
  await syncAdminLessonsCount(courseId);
}

export async function deleteLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {
  await requireAdmin();
  await deleteAdminLesson(lessonId);
  await syncAdminLessonsCount(courseId);
}

// --- OTHER ENTITIES ---

export async function toggleEnrollmentStatusAction(
  enrollmentId: string,
  currentStatus: string,
): Promise<void> {
  await requireAdmin();
  await toggleAdminEnrollmentStatus(enrollmentId, currentStatus);
}

export async function updateThreadAction(
  courseId: string,
  threadId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  await updateAdminThread(threadId, updates);
}

export async function deleteThreadAction(
  courseId: string,
  threadId: string,
): Promise<void> {
  await requireAdmin();
  await deleteAdminThread(threadId);
}

export async function addMaterialAction(
  courseId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  await addAdminMaterial(courseId, data);
}

export async function updateMaterialAction(
  courseId: string,
  materialId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  await updateAdminMaterial(materialId, updates);
}

export async function deleteMaterialAction(
  courseId: string,
  materialId: string,
  filePath?: string,
): Promise<void> {
  await requireAdmin();
  await deleteAdminMaterial(materialId, filePath);
}

export async function syncLessonsCountAction(
  courseId: string,
): Promise<number> {
  await requireAdmin();
  return syncAdminLessonsCount(courseId);
}

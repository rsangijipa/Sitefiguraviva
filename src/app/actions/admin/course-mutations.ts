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
  addAdminMaterial,
  bumpAdminCourseRevision,
  createAdminCourse,
  createAdminModule,
  createAdminLesson,
  deleteAdminCourse,
  deleteAdminLesson,
  deleteAdminMaterial,
  deleteAdminModule,
  deleteAdminThread,
  getAdminCourse,
  listAdminCourseEnrollments,
  listAdminCourseThreads,
  listAdminCourses,
  listAdminLessons,
  listAdminMaterials,
  listAdminModules,
  syncAdminLessonsCount,
  toggleAdminEnrollmentStatus,
  updateAdminCourse,
  updateAdminLesson,
  updateAdminMaterial,
  updateAdminModule,
  updateAdminThread,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

type MutablePayload = Record<string, any>;

function sanitizeRecord(input: unknown, label: string): MutablePayload {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`Invalid ${label} payload.`);
  }

  return { ...(input as MutablePayload) };
}

function stripImmutableFields(payload: MutablePayload): MutablePayload {
  delete payload.id;
  delete payload.createdAt;
  return payload;
}

function getStringField(payload: MutablePayload, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

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
  const payload = sanitizeRecord(data, "course");
  const coverImage =
    getStringField(payload, "coverImage") || getStringField(payload, "image");

  const courseId = await createAdminCourse({
    ...payload,
    image: coverImage,
    coverImage,
    status: "draft",
    isPublished: false,
  });
  revalidatePath("/admin/courses");
  return courseId;
}

export async function updateCourseAction(
  courseId: string,
  data: Partial<CourseDoc>,
): Promise<void> {
  await requireAdmin();
  const payload = sanitizeRecord(data, "course update");

  const updatePayload = stripImmutableFields({ ...payload });

  delete updatePayload.status;
  delete updatePayload.isPublished;
  delete updatePayload.publishedAt;
  delete updatePayload.contentRevision;

  if (payload.coverImage) updatePayload.image = payload.coverImage;
  if (payload.image) updatePayload.coverImage = payload.image;

  await updateAdminCourse(courseId, updatePayload);
  await bumpAdminCourseRevision(courseId);
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
  const moduleId = await createAdminModule(courseId, title, order);
  await bumpAdminCourseRevision(courseId);
  return moduleId;
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  data: Partial<ModuleDoc>,
): Promise<void> {
  await requireAdmin();
  await updateAdminModule(moduleId, sanitizeRecord(data, "module update"));
  await bumpAdminCourseRevision(courseId);
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string,
): Promise<void> {
  await requireAdmin();
  await deleteAdminModule(moduleId);
  await bumpAdminCourseRevision(courseId);
}

// --- LESSONS ---

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  title: string,
  order: number,
): Promise<string> {
  await requireAdmin();
  const lessonId = await createAdminLesson(courseId, moduleId, title, order);
  await bumpAdminCourseRevision(courseId);
  return lessonId;
}

export async function updateLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: Partial<LessonDoc>,
): Promise<void> {
  await requireAdmin();
  await updateAdminLesson(lessonId, sanitizeRecord(data, "lesson update"));
  await bumpAdminCourseRevision(courseId);
}

export async function deleteLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {
  await requireAdmin();
  await deleteAdminLesson(lessonId);
  await bumpAdminCourseRevision(courseId);
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
  const payload = stripImmutableFields(
    sanitizeRecord(updates, "thread update"),
  );
  await updateAdminThread(threadId, payload);
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
  const payload = sanitizeRecord(data, "material");
  await addAdminMaterial(courseId, {
    ...payload,
    isPublished: payload.isPublished ?? true,
  });
}

export async function updateMaterialAction(
  courseId: string,
  materialId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  const payload = stripImmutableFields(
    sanitizeRecord(updates, "material update"),
  );
  await updateAdminMaterial(materialId, payload);
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

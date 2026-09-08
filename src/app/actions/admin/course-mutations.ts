"use server";

import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { FieldValue } from "firebase-admin/firestore";
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
  getCourse,
  listCourseEnrollments,
  listCourseThreads,
  listCourses,
  listLessons,
  listMaterials,
  listModules,
} from "@/lib/repositories/courseRepository.server";
import { touchCourseRevision } from "@/lib/course-content/revision";
import {
  mirrorCourseToSupabase,
  deleteCourseFromSupabase,
} from "@/lib/course-content/course-mirror";

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
  return listCourses();
}

export async function getCourseAction(
  courseId: string,
): Promise<CourseDoc | null> {
  await requireAdmin();
  return getCourse(courseId);
}

export async function getModulesAction(courseId: string): Promise<ModuleDoc[]> {
  await requireAdmin();
  return listModules(courseId);
}

export async function getLessonsAction(
  courseId: string,
  moduleId: string,
): Promise<LessonDoc[]> {
  await requireAdmin();
  return listLessons(courseId, moduleId);
}

export async function getCourseEnrollmentsAction(
  courseId: string,
): Promise<Array<EnrollmentDoc & { id: string }>> {
  await requireAdmin();
  return listCourseEnrollments(courseId);
}

export async function getCourseThreadsAction(
  courseId: string,
): Promise<CommunityThreadDoc[]> {
  await requireAdmin();
  return listCourseThreads(courseId);
}

export async function getMaterialsAction(
  courseId: string,
): Promise<MaterialDoc[]> {
  await requireAdmin();
  return listMaterials(courseId);
}

// --- COURSES ---

export async function createCourseAction(
  data: Partial<CourseDoc>,
): Promise<string> {
  await requireAdmin();
  const payload = sanitizeRecord(data, "course");
  const coverImage =
    getStringField(payload, "coverImage") || getStringField(payload, "image");

  const docRef = await adminDb.collection("courses").add({
    ...payload,
    image: coverImage,
    coverImage,
    status: "draft",
    isPublished: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await mirrorCourseToSupabase(docRef.id, {
    ...payload,
    image: coverImage,
    coverImage,
    status: "draft",
    isPublished: false,
  });
  revalidatePath("/admin/courses");
  return docRef.id;
}

export async function updateCourseAction(
  courseId: string,
  data: Partial<CourseDoc>,
): Promise<void> {
  const actor = await requireAdmin();
  const docRef = adminDb.collection("courses").doc(courseId);
  const payload = sanitizeRecord(data, "course update");

  // Convert to regular payload without functions
  const updatePayload = stripImmutableFields({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  delete updatePayload.status;
  delete updatePayload.isPublished;
  delete updatePayload.publishedAt;
  delete updatePayload.contentRevision;

  if (payload.coverImage) updatePayload.image = payload.coverImage;
  if (payload.image) updatePayload.coverImage = payload.image;

  await docRef.update(updatePayload);
  await touchCourseRevision(courseId, "course-updated", actor);
  await mirrorCourseToSupabase(courseId, updatePayload);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath("/curso");
  revalidatePath(`/curso/${courseId}`);
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  await requireAdmin();

  const modulesRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules");
  const modulesSnap = await modulesRef.get();

  const batch = adminDb.batch();

  for (const modDoc of modulesSnap.docs) {
    const lessonsRef = modDoc.ref.collection("lessons");
    const lessonsSnap = await lessonsRef.get();
    lessonsSnap.docs.forEach((l) => batch.delete(l.ref));
    batch.delete(modDoc.ref);
  }

  const materialsRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("materials");
  const materialsSnap = await materialsRef.get();
  materialsSnap.docs.forEach((m) => batch.delete(m.ref));

  const threadsRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("communityThreads");
  const threadsSnap = await threadsRef.get();
  threadsSnap.docs.forEach((t) => batch.delete(t.ref));

  batch.delete(adminDb.collection("courses").doc(courseId));

  await batch.commit();
  await deleteCourseFromSupabase(courseId);
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
  const actor = await requireAdmin();
  const docRef = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .add({
      title,
      order,
      isPublished: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  await touchCourseRevision(courseId, "module-created", actor);
  return docRef.id;
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  data: Partial<ModuleDoc>,
): Promise<void> {
  const actor = await requireAdmin();
  const payload = sanitizeRecord(data, "module update");
  const docRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId);

  const updatePayload = stripImmutableFields({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await docRef.update(updatePayload);
  await touchCourseRevision(courseId, "module-updated", actor);

  if (payload.isPublished !== undefined) {
    await syncLessonsCountAction(courseId);
  }
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string,
): Promise<void> {
  const actor = await requireAdmin();

  const batch = adminDb.batch();
  const lessonsRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons");
  const lessonsSnap = await lessonsRef.get();

  lessonsSnap.docs.forEach((l) => batch.delete(l.ref));
  batch.delete(
    adminDb
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .doc(moduleId),
  );

  if (lessonsSnap.size > 0) {
    const courseRef = adminDb.collection("courses").doc(courseId);
    batch.update(courseRef, {
      "stats.lessonsCount": FieldValue.increment(-lessonsSnap.size),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  await touchCourseRevision(courseId, "module-deleted", actor);
}

// --- LESSONS ---

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  title: string,
  order: number,
): Promise<string> {
  const actor = await requireAdmin();
  const lessonsCol = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons");
  const newLessonRef = lessonsCol.doc();

  await newLessonRef.set({
    title,
    order,
    moduleId,
    courseId,
    type: "text",
    isPublished: false,
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await touchCourseRevision(courseId, "lesson-created", actor);

  return newLessonRef.id;
}

export async function updateLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: Partial<LessonDoc>,
): Promise<void> {
  const actor = await requireAdmin();
  const payload = sanitizeRecord(data, "lesson update");
  const docRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId);

  const updatePayload = stripImmutableFields({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await docRef.update(updatePayload);
  await touchCourseRevision(courseId, "lesson-updated", actor);

  if (payload.isPublished !== undefined) {
    await syncLessonsCountAction(courseId);
  }
}

export async function deleteLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {
  const actor = await requireAdmin();
  const lessonRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId);

  const snap = await lessonRef.get();
  const wasPublished = snap.exists && snap.data()?.isPublished === true;

  await lessonRef.delete();
  await touchCourseRevision(courseId, "lesson-deleted", actor);

  if (wasPublished) {
    await syncLessonsCountAction(courseId);
  }
}

// --- OTHER ENTITIES ---

export async function toggleEnrollmentStatusAction(
  enrollmentId: string,
  currentStatus: string,
): Promise<void> {
  await requireAdmin();
  const newStatus = currentStatus === "active" ? "cancelled" : "active";
  await adminDb
    .collection("enrollments")
    .doc(enrollmentId)
    .update({ status: newStatus });
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
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("communityThreads")
    .doc(threadId)
    .update(payload);
}

export async function deleteThreadAction(
  courseId: string,
  threadId: string,
): Promise<void> {
  await requireAdmin();
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("communityThreads")
    .doc(threadId)
    .delete();
}

export async function addMaterialAction(
  courseId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  const payload = sanitizeRecord(data, "material");
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("materials")
    .add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      downloadCount: 0,
      isPublished: true,
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
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("materials")
    .doc(materialId)
    .update(payload);
}

export async function deleteMaterialAction(
  courseId: string,
  materialId: string,
): Promise<void> {
  await requireAdmin();
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("materials")
    .doc(materialId)
    .delete();
}

export async function syncLessonsCountAction(
  courseId: string,
): Promise<number> {
  await requireAdmin();
  const modulesSnap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .get();
  let totalPublished = 0;

  for (const modDoc of modulesSnap.docs) {
    const mData = modDoc.data();
    if (mData.isPublished === true) {
      const lessonsSnap = await adminDb
        .collection("courses")
        .doc(courseId)
        .collection("modules")
        .doc(modDoc.id)
        .collection("lessons")
        .where("isPublished", "==", true)
        .get();
      totalPublished += lessonsSnap.size;
    }
  }

  await adminDb.collection("courses").doc(courseId).update({
    "stats.lessonsCount": totalPublished,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return totalPublished;
}

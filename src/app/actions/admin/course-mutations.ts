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
import { SERVER_FEATURES } from "@/lib/server-feature-flags";
import {
  addAdminMaterial,
  createAdminCourse,
  createAdminLesson,
  createAdminModule,
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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return listAdminCourses();
  }
  return listCourses();
}

export async function getCourseAction(
  courseId: string,
): Promise<CourseDoc | null> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return getAdminCourse(courseId);
  }
  return getCourse(courseId);
}

export async function getModulesAction(courseId: string): Promise<ModuleDoc[]> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return listAdminModules(courseId);
  }
  return listModules(courseId);
}

export async function getLessonsAction(
  courseId: string,
  moduleId: string,
): Promise<LessonDoc[]> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return listAdminLessons(courseId, moduleId);
  }
  return listLessons(courseId, moduleId);
}

export async function getCourseEnrollmentsAction(
  courseId: string,
): Promise<Array<EnrollmentDoc & { id: string }>> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return listAdminCourseEnrollments(courseId);
  }
  return listCourseEnrollments(courseId);
}

export async function getCourseThreadsAction(
  courseId: string,
): Promise<CommunityThreadDoc[]> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return listAdminCourseThreads(courseId);
  }
  return listCourseThreads(courseId);
}

export async function getMaterialsAction(
  courseId: string,
): Promise<MaterialDoc[]> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return listAdminMaterials(courseId);
  }
  return listMaterials(courseId);
}

// --- COURSES ---

export async function createCourseAction(
  data: Partial<CourseDoc>,
): Promise<string> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    const courseId = await createAdminCourse(data);
    revalidatePath("/admin/courses");
    return courseId;
  }

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
  revalidatePath("/admin/courses");
  return docRef.id;
}

export async function updateCourseAction(
  courseId: string,
  data: Partial<CourseDoc>,
): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await updateAdminCourse(courseId, data);
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    return;
  }

  const docRef = adminDb.collection("courses").doc(courseId);
  const payload = sanitizeRecord(data, "course update");

  // Convert to regular payload without functions
  const updatePayload = stripImmutableFields({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (payload.coverImage) updatePayload.image = payload.coverImage;
  if (payload.image) updatePayload.coverImage = payload.image;

  await docRef.update(updatePayload);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await deleteAdminCourse(courseId);
    revalidatePath("/admin/courses");
    return;
  }

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
  revalidatePath("/admin/courses");
}

// --- MODULES ---

export async function createModuleAction(
  courseId: string,
  title: string,
  order: number,
): Promise<string> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return createAdminModule(courseId, title, order);
  }

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
  return docRef.id;
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  data: Partial<ModuleDoc>,
): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await updateAdminModule(moduleId, data);
    if (data.isPublished !== undefined) {
      await syncLessonsCountAction(courseId);
    }
    return;
  }

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

  if (payload.isPublished !== undefined) {
    await syncLessonsCountAction(courseId);
  }
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string,
): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await deleteAdminModule(moduleId);
    await syncLessonsCountAction(courseId);
    return;
  }

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
}

// --- LESSONS ---

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  title: string,
  order: number,
): Promise<string> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return createAdminLesson(courseId, moduleId, title, order);
  }

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

  return newLessonRef.id;
}

export async function updateLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: Partial<LessonDoc>,
): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await updateAdminLesson(lessonId, data);
    if (data.isPublished !== undefined) {
      await syncLessonsCountAction(courseId);
    }
    return;
  }

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

  if (payload.isPublished !== undefined) {
    await syncLessonsCountAction(courseId);
  }
}

export async function deleteLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await deleteAdminLesson(lessonId);
    await syncLessonsCountAction(courseId);
    return;
  }

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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await toggleAdminEnrollmentStatus(enrollmentId, currentStatus);
    return;
  }

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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await updateAdminThread(threadId, updates);
    return;
  }

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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await deleteAdminThread(threadId);
    return;
  }

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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await addAdminMaterial(courseId, data);
    return;
  }

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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await updateAdminMaterial(materialId, updates);
    return;
  }

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
  filePath?: string,
): Promise<void> {
  await requireAdmin();
  if (SERVER_FEATURES.supabaseAdminCourses) {
    await deleteAdminMaterial(materialId, filePath);
    return;
  }

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
  if (SERVER_FEATURES.supabaseAdminCourses) {
    return syncAdminLessonsCount(courseId);
  }

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

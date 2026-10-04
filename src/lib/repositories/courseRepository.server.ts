import { adminDb } from "@/lib/firebase/admin";
import {
  CommunityThreadDoc,
  CourseDoc,
  EnrollmentDoc,
  LessonDoc,
  MaterialDoc,
  ModuleDoc,
} from "@/types/lms";
import { serializeDocument, serializeQuery } from "./firestoreSerialization";

export function getCourseRef(courseId: string) {
  return adminDb.collection("courses").doc(courseId);
}

export async function getCourseSnapshot(courseId: string) {
  return getCourseRef(courseId).get();
}

export async function listCourses(): Promise<CourseDoc[]> {
  const snapshot = await adminDb.collection("courses").get();
  return serializeQuery<CourseDoc>(snapshot);
}

export async function getCourse(courseId: string): Promise<CourseDoc | null> {
  const snapshot = await getCourseSnapshot(courseId);
  return serializeDocument<CourseDoc>(snapshot);
}

export async function listModules(courseId: string): Promise<ModuleDoc[]> {
  const snapshot = await getCourseRef(courseId)
    .collection("modules")
    .orderBy("order", "asc")
    .get();

  return serializeQuery<ModuleDoc>(snapshot);
}

export async function getModulesSnapshot(courseId: string) {
  return getCourseRef(courseId).collection("modules").orderBy("order", "asc").get();
}

export async function listLessons(
  courseId: string,
  moduleId: string,
): Promise<LessonDoc[]> {
  const snapshot = await getCourseRef(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .orderBy("order", "asc")
    .get();

  return serializeQuery<LessonDoc>(snapshot);
}

export async function getLessonsSnapshot(courseId: string, moduleId: string) {
  return getCourseRef(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .orderBy("order", "asc")
    .get();
}

export async function listCourseEnrollments(
  courseId: string,
): Promise<Array<EnrollmentDoc & { id: string }>> {
  const snapshot = await adminDb
    .collection("enrollments")
    .where("courseId", "==", courseId)
    .get();

  return serializeQuery<EnrollmentDoc & { id: string }>(snapshot);
}

export async function listCourseThreads(
  courseId: string,
): Promise<CommunityThreadDoc[]> {
  const snapshot = await getCourseRef(courseId)
    .collection("communityThreads")
    .orderBy("isPinned", "desc")
    .orderBy("lastReplyAt", "desc")
    .get();

  return serializeQuery<CommunityThreadDoc>(snapshot);
}

export async function listMaterials(courseId: string): Promise<MaterialDoc[]> {
  const snapshot = await getCourseRef(courseId).collection("materials").get();
  return serializeQuery<MaterialDoc>(snapshot);
}

import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { Course, Module, Lesson, Block } from "@/types/lms";
import { deepSafeSerialize } from "./utils";

import { toCourseFullDTO } from "@/lib/presenters/mappers";

import { assertCanAccessCourse } from "./auth/access-gate";
import { AccessError, AccessErrorCode } from "./auth/access-types";

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
    accessContext = await assertCanAccessCourse(userId, courseId);
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

  const courseSnap = await db.collection("courses").doc(courseId).get();
  if (!courseSnap.exists) return null;

  // Fetch enrollment data if exists (using the ID from context or default)
  const enrollmentId = accessContext?.enrollmentId || `${userId}_${courseId}`;
  const enrollmentDoc = await db
    .collection("enrollments")
    .doc(enrollmentId)
    .get();

  // Paywall gate: If access denied, return limited data via DTO
  if (isAccessDenied && !isAdmin) {
    return toCourseFullDTO(
      courseSnap,
      [], // No modules
      new Map(), // No lessons
      new Map(), // No progress
      enrollmentDoc.exists ? enrollmentDoc : null,
      isAdmin,
      isAccessDenied,
    );
  }

  // 2. Fetch Progress (ATOMIC)
  const progressSnap = await db
    .collection("progress")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .get();

  const progressMap = new Map<string, any>();
  progressSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.lessonId) {
      progressMap.set(data.lessonId, data);
    }
  });

  // 3. Fetch Modules
  const modulesSnap = await db
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .orderBy("order", "asc")
    .get();

  // 4. Fetch All Lessons (Optimized Parallel)
  // We create a map of ModuleID -> LessonDocs[]
  const lessonsMap = new Map<string, any[]>();

  await Promise.all(
    modulesSnap.docs.map(async (mDoc) => {
      const lessonsSnap = await db
        .collection("courses")
        .doc(courseId)
        .collection("modules")
        .doc(mDoc.id)
        .collection("lessons")
        .orderBy("order", "asc")
        .get();

      lessonsMap.set(mDoc.id, lessonsSnap.docs);
    }),
  );

  // 5. Map to DTO
  return toCourseFullDTO(
    courseSnap,
    modulesSnap.docs,
    lessonsMap,
    progressMap,
    enrollmentDoc.exists ? enrollmentDoc : null,
    isAdmin,
    isAccessDenied,
  );
}

export async function getLessonContent(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  // Fetch specific lesson and its blocks
  const lessonRef = db
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId);

  const lessonDoc = await lessonRef.get();
  if (!lessonDoc.exists) return null;

  let blocksSnap;
  try {
    blocksSnap = await lessonRef
      .collection("blocks")
      .orderBy("order", "asc")
      .get();
  } catch (error) {
    // Legacy blocks might not have an 'order' field; fallback without ordering
    blocksSnap = await lessonRef.collection("blocks").get();
  }

  const lesson = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;

  const blocks = blocksSnap.docs.map((doc) => {
    const data: any = doc.data();
    return {
      id: doc.id,
      ...data,
      // Default: visible unless explicitly disabled
      isPublished: data?.isPublished !== false,
    };
  }) as Block[];

  return deepSafeSerialize({ lesson, blocks });
}

export async function saveLessonContent(
  courseId: string,
  moduleId: string,
  lessonId: string,
  blocks: Block[],
) {
  const lessonRef = db
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId);
  const blocksRef = lessonRef.collection("blocks");

  // Batch write for atomicity
  const batch = db.batch();

  // 1. Delete existing blocks (simple replacement strategy for MVP)
  // In a real optimized app, we would diff changes.
  const existingBlocksSnap = await blocksRef.get();
  existingBlocksSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // 2. Normalize and add new blocks
  const safeBlocks = (blocks || []).map((b: any, idx: number) => ({
    ...b,
    // Default ordering and publish state (legacy data may omit these fields)
    order: typeof b?.order === "number" ? b.order : idx + 1,
    isPublished: b?.isPublished !== false,
  })) as Block[];

  safeBlocks.forEach((block: any) => {
    const docRef = blocksRef.doc(block.id);
    const { id, ...raw } = block;

    batch.set(docRef, {
      ...raw,
      order: typeof raw?.order === "number" ? raw.order : 0,
      isPublished: raw?.isPublished !== false,
      updatedAt: new Date(),
      createdAt: raw?.createdAt || new Date(),
    });
  });

  // 3. Update lesson timestamp/count (use set+merge for safety)
  batch.set(
    lessonRef,
    {
      updatedAt: FieldValue.serverTimestamp(),
      publishedBlocksCount: safeBlocks.filter(
        (b: any) => b?.isPublished !== false,
      ).length,
    },
    { merge: true },
  );

  // 4. Increment course content revision (Structural Integrity)
  batch.update(db.collection("courses").doc(courseId), {
    contentRevision: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return batch.commit();
}

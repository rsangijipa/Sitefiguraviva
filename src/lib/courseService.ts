import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { Course, Module, Lesson, Block } from "@/types/lms";
import { deepSafeSerialize } from "./utils";

import { toCourseFullDTO } from "@/lib/presenters/mappers";

export async function getCourseData(courseId: string, userId: string) {
  if (!courseId || !userId) return null;

  // 1. Fetch Course & Enrollment (Parallel)
  const coursePromise = db.collection("courses").doc(courseId).get();
  const enrollmentPromise = db
    .collection("enrollments")
    .doc(`${userId}_${courseId}`)
    .get();

  const [courseDoc, enrollmentDoc] = await Promise.all([
    coursePromise,
    enrollmentPromise,
  ]);

  if (!courseDoc.exists) return null;

  let enrollmentData = null;
  let status = "none";

  if (enrollmentDoc.exists) {
    enrollmentData = enrollmentDoc; // Pass the doc (or data) to mapper
    status = enrollmentDoc.data()?.status || "none";
  }

  // Paywall gate: If not active or completed, return limited data via DTO
  if (status !== "active" && status !== "completed") {
    return toCourseFullDTO(
      courseDoc,
      [], // No modules
      new Map(), // No lessons
      new Map(), // No progress
      enrollmentData,
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
    courseDoc,
    modulesSnap.docs,
    lessonsMap,
    progressMap,
    enrollmentData,
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

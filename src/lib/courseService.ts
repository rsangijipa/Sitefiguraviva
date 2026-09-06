import { Lesson, Block } from "@/types/lms";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
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

  const blocks = blocksSnap.docs
    .map((doc) => {
      const data: any = doc.data();
      return {
        id: doc.id,
        ...data,
        // Default: visible unless explicitly disabled
        isPublished: data?.isPublished !== false,
      };
    })
    .filter((b: any) => b.isPublished !== false) as Block[];

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

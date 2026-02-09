import { db, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { publishEvent } from "@/lib/events/bus";
import { issueCertificate } from "@/app/actions/certificate";

/**
 * Service to manage course progress with SSoT (Single Source of Truth) principles.
 *
 * Architecture:
 * - Writes: Idempotent writes to 'progress' collection.
 * - Reads: Denormalized 'progressSummary' in 'enrollments' collection.
 * - Calculation: Canonical server-side calculation based on PUBLISHED lessons only.
 */

export const progressService = {
  /**
   * Marks a lesson as completed and triggers a progress recalculation.
   * Idempotent: Can be called multiple times without side effects.
   */
  async markLessonCompleted(
    uid: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
  ): Promise<void> {
    const progressId = `${uid}_${courseId}_${lessonId}`;
    const progressRef = adminDb.collection("progress").doc(progressId);

    // 1. Idempotent Write to Progress Collection
    await progressRef.set(
      {
        userId: uid,
        courseId,
        moduleId,
        lessonId,
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        device: "web", // telemetry
      },
      { merge: true },
    );

    // 2. Publish Event for Audit/Async Workers
    await publishEvent({
      type: "LESSON_COMPLETED",
      actorUserId: uid,
      targetId: lessonId,
      context: { courseId, moduleId, lessonId },
      payload: { method: "manual_recalc" },
    });

    // 3. Recalculate Course Progress (Canonical)
    await this.recalculateEnrollmentProgress(uid, courseId);
  },

  /**
   * Updates granular lesson progress (partial watch time).
   * Does NOT trigger full course recalculation unless status is completed.
   */
  async updateLessonProgress(
    uid: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: { status: string; percent?: number; maxWatchedSecond?: number },
  ): Promise<void> {
    const progressId = `${uid}_${courseId}_${lessonId}`;
    const progressRef = adminDb.collection("progress").doc(progressId);

    const updateData: any = {
      userId: uid,
      courseId,
      moduleId,
      lessonId,
      updatedAt: FieldValue.serverTimestamp(),
      ...data,
    };

    if (data.status === "completed") {
      updateData.completedAt = FieldValue.serverTimestamp();
    }

    await progressRef.set(updateData, { merge: true });

    if (data.status === "completed") {
      await this.recalculateEnrollmentProgress(uid, courseId);
    }
  },

  /**
   * Recalculates the progress for a specific enrollment based on CURRENT published lessons.
   * This fixes constraints where draft lessons or deleted lessons skew the percentage.
   */
  async recalculateEnrollmentProgress(
    uid: string,
    courseId: string,
  ): Promise<void> {
    // A. Fetch all published modules & lessons (The Denominator)
    const modulesSnap = await adminDb
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .orderBy("order", "asc")
      .get();

    let totalPublishedLessons = 0;
    let totalPublishedModules = 0;
    const publishedLessonIds = new Set<string>();
    const moduleLessonCounts: Record<string, number> = {};
    const moduleCompletedCounts: Record<string, number> = {};

    // Filter modules in memory
    const publishedModules = modulesSnap.docs.filter(
      (doc) => doc.data().isPublished !== false,
    );

    const lessonPromises = publishedModules.map(async (modDoc) => {
      totalPublishedModules++;
      moduleLessonCounts[modDoc.id] = 0;
      moduleCompletedCounts[modDoc.id] = 0;

      const lessonsSnap = await modDoc.ref.collection("lessons").get();

      lessonsSnap.forEach((l) => {
        if (l.data().isPublished !== false) {
          totalPublishedLessons++;
          publishedLessonIds.add(l.id);
          moduleLessonCounts[modDoc.id]++;
        }
      });
    });

    await Promise.all(lessonPromises);

    // B. Fetch User's Progress (The Numerator)
    const progressSnap = await adminDb
      .collection("progress")
      .where("userId", "==", uid)
      .where("courseId", "==", courseId)
      .where("status", "==", "completed")
      .get();

    // C. Intersect: Only count completed lessons that are STILL published
    let validCompletedCount = 0;

    progressSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (publishedLessonIds.has(data.lessonId)) {
        validCompletedCount++;

        if (
          data.moduleId &&
          moduleCompletedCounts[data.moduleId] !== undefined
        ) {
          moduleCompletedCounts[data.moduleId]++;
        }
      }
    });

    // Calculate Completed Modules
    let completedModulesCount = 0;
    Object.keys(moduleLessonCounts).forEach((moduleId) => {
      const totalInModule = moduleLessonCounts[moduleId];
      const completedInModule = moduleCompletedCounts[moduleId];
      if (totalInModule > 0 && completedInModule === totalInModule) {
        completedModulesCount++;
      }
    });

    // D. Calculate Percentage
    const percent =
      totalPublishedLessons > 0
        ? Math.min(
            100,
            Math.round((validCompletedCount / totalPublishedLessons) * 100),
          )
        : 0;

    // E. Update Enrollment (Denormalization)
    const enrollmentRef = adminDb
      .collection("enrollments")
      .doc(`${uid}_${courseId}`);

    const updateData: any = {
      "progressSummary.completedLessonsCount": validCompletedCount,
      "progressSummary.totalLessons": totalPublishedLessons,
      "progressSummary.completedModulesCount": completedModulesCount,
      "progressSummary.totalModules": totalPublishedModules,
      "progressSummary.percent": percent,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Check for Course Completion
    if (percent === 100 && totalPublishedLessons > 0) {
      const currentEnrollment = await enrollmentRef.get();
      if (currentEnrollment.exists && !currentEnrollment.data()?.completedAt) {
        updateData.status = "completed";
        updateData.completedAt = FieldValue.serverTimestamp();
      } else if (
        currentEnrollment.exists &&
        currentEnrollment.data()?.status !== "completed"
      ) {
        updateData.status = "completed";
      }
    }

    await enrollmentRef.update(updateData);

    // F. Trigger Certificate if Complete
    if (percent === 100 && totalPublishedLessons > 0) {
      try {
        console.log(
          `[ProgressService] Triggering certificate for ${uid} in course ${courseId}`,
        );
        await issueCertificate(courseId, uid);
      } catch (e) {
        console.error("[ProgressService] Certificate issuance failed:", e);
      }
    }

    console.log(
      `[ProgressService] Recalculated ${uid} in ${courseId}: ${validCompletedCount}/${totalPublishedLessons} (${percent}%)`,
    );
  },
};

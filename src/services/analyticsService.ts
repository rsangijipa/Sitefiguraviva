import { db } from "@/lib/firebase/client";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { trackEvent } from "@/lib/telemetry/events";

export const analyticsService = {
  /**
   * Tracks when a user starts or continues a lesson.
   */
  async trackLessonStart(userId: string, courseId: string, lessonId: string) {
    const progressRef = doc(db, "users", userId, "courseProgress", courseId);
    await setDoc(
      progressRef,
      {
        lastLessonId: lessonId,
        updatedAt: serverTimestamp(),
        [`lessons.${lessonId}.startedAt`]: serverTimestamp(),
      },
      { merge: true },
    );

    trackEvent("lesson_started", { courseId, lessonId });
  },

  /**
   * Tracks lesson completion and updates retention metrics.
   */
  async trackLessonCompletion(
    userId: string,
    courseId: string,
    lessonId: string,
  ) {
    const progressRef = doc(db, "users", userId, "courseProgress", courseId);
    await updateDoc(progressRef, {
      [`lessons.${lessonId}.completedAt`]: serverTimestamp(),
      completedLessonsCount: increment(1),
      lastUpdated: serverTimestamp(),
    });

    trackEvent("lesson_completed", { courseId, lessonId });
  },

  /**
   * Generates a snapshot of the current course retention.
   * Useful for the Admin Drop-off Dashboard.
   */
  async getCourseRetentionReport(courseId: string) {
    // In production, this would be an aggregation/edge function.
    // MVP: We could fetch a sample of progress docs.
    return {
      courseId,
      totalStudents: 0, // Mock
      dropOffPoints: [],
    };
  },
};

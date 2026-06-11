import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import type {
  AssessmentDoc,
  AssessmentSubmissionDoc,
  UserAssessmentProgress,
} from "@/types/assessment";

export const assessmentService = {
  /**
   * Get all assessments for a course
   */
  async getCourseAssessments(courseId: string): Promise<AssessmentDoc[]> {
    const q = query(
      collection(db, "assessments"),
      where("courseId", "==", courseId),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AssessmentDoc,
    );
  },

  /**
   * Get single assessment
   */
  async getAssessment(assessmentId: string): Promise<AssessmentDoc | null> {
    const docRef = doc(db, "assessments", assessmentId);
    const snap = await getDoc(docRef);
    return snap.exists()
      ? ({ id: snap.id, ...snap.data() } as AssessmentDoc)
      : null;
  },

  /**
   * Get user's progress on an assessment
   */
  async getUserProgress(
    userId: string,
    assessmentId: string,
  ): Promise<UserAssessmentProgress | null> {
    const docRef = doc(db, "users", userId, "assessmentProgress", assessmentId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as UserAssessmentProgress) : null;
  },

  /**
   * Get user's submissions for an assessment
   */
  async getUserSubmissions(
    userId: string,
    assessmentId: string,
  ): Promise<AssessmentSubmissionDoc[]> {
    const q = query(
      collection(db, "assessmentSubmissions"),
      where("userId", "==", userId),
      where("assessmentId", "==", assessmentId),
      orderBy("submittedAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AssessmentSubmissionDoc,
    );
  },

  /**
   * Get a specific submission
   */
  async getSubmission(
    submissionId: string,
  ): Promise<AssessmentSubmissionDoc | null> {
    const docRef = doc(db, "assessmentSubmissions", submissionId);
    const snap = await getDoc(docRef);
    return snap.exists()
      ? ({ id: snap.id, ...snap.data() } as AssessmentSubmissionDoc)
      : null;
  },
};

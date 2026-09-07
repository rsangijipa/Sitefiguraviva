import {
  getAssessment,
  getSubmission,
  getUserProgress,
  getUserSubmissions,
  listCourseAssessments,
} from "@/features/assessments/infrastructure/supabaseAssessmentRepository.server";
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
    return listCourseAssessments(courseId);
  },

  /**
   * Get single assessment
   */
  async getAssessment(assessmentId: string): Promise<AssessmentDoc | null> {
    return getAssessment(assessmentId);
  },

  /**
   * Get user's progress on an assessment
   */
  async getUserProgress(
    userId: string,
    assessmentId: string,
  ): Promise<UserAssessmentProgress | null> {
    return getUserProgress(userId, assessmentId);
  },

  /**
   * Get user's submissions for an assessment
   */
  async getUserSubmissions(
    userId: string,
    assessmentId: string,
  ): Promise<AssessmentSubmissionDoc[]> {
    return getUserSubmissions(userId, assessmentId);
  },

  /**
   * Get a specific submission
   */
  async getSubmission(
    submissionId: string,
  ): Promise<AssessmentSubmissionDoc | null> {
    return getSubmission(submissionId);
  },
};

"use server";

import { verifySession } from "@/lib/auth/server";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  buildGradeReport,
  type GradeReport,
} from "@/features/assessments/domain/grade-report";

/**
 * The signed-in student's grades in one course. Reads only published
 * assessments' metadata and the student's own submissions; answer keys and
 * other students' work never leave the server.
 */
export async function getMyCourseGradesAction(courseId: string): Promise<
  | { success: true; data: GradeReport; message?: undefined }
  | { success: false; data?: undefined; message: string }
> {
  const session = await verifySession();
  if (!session) return { success: false, message: "Entre novamente para ver suas notas." };
  if (typeof courseId !== "string" || !courseId.trim() || courseId.length > 200)
    return { success: false, message: "Curso inválido." };
  try {
    await assertCanAccessCourse(session.uid, courseId);
  } catch {
    return { success: false, message: "Suas notas ficam disponíveis com a matrícula ativa." };
  }

  const supabase = createSupabaseServiceClient();
  const [assessmentsRes, submissionsRes] = await Promise.all([
    supabase
      .from("assessments")
      .select("id,title,lesson_id,is_required,passing_score,created_at")
      .eq("course_id", courseId)
      .eq("status", "published"),
    supabase
      .from("assessment_submissions")
      .select(
        "assessment_id,attempt_number,status,percentage,passed,feedback,submitted_at,graded_at,started_at",
      )
      .eq("course_id", courseId)
      .eq("user_id", session.uid),
  ]);
  if (assessmentsRes.error || submissionsRes.error)
    return { success: false, message: "Não foi possível carregar suas notas agora." };

  return {
    success: true,
    data: buildGradeReport(
      (assessmentsRes.data ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        lessonId: a.lesson_id,
        isRequired: a.is_required,
        passingScore: a.passing_score,
        createdAt: a.created_at,
      })),
      (submissionsRes.data ?? []).map((s) => ({
        assessmentId: s.assessment_id,
        attemptNumber: s.attempt_number,
        status: s.status,
        percentage: Number(s.percentage) || 0,
        passed: s.passed,
        feedback: s.feedback,
        submittedAt: s.submitted_at,
        gradedAt: s.graded_at,
        startedAt: s.started_at,
      })),
    ),
  };
}

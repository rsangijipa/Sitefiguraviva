import "server-only";
import crypto from "crypto";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  getAdminCourse,
  listAdminModules,
  listAdminLessons,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { listProgressBySupabaseUser } from "@/features/progress/infrastructure/supabaseProgressRepository.server";
import { findEnrollmentBySupabaseUser } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";

function code() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `FV-${new Date().getFullYear().toString().slice(-2)}-${Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`;
}

export async function issueCertificateSupabase(
  courseId: string,
  userId: string,
  actorUid: string,
  isAdmin: boolean,
) {
  if (userId !== actorUid && !isAdmin)
    return { success: false, error: "UNAUTHORIZED", status: 403 };
  const supabase = createSupabaseServiceClient();
  const existing = await supabase
    .from("certificates")
    .select("id,code,issued_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data)
    return {
      success: true,
      certificateId: existing.data.id,
      verificationCode: existing.data.code,
      issuedAt: existing.data.issued_at,
    };

  const [course, enrollment, modules, requiredAssessments] = await Promise.all([
    getAdminCourse(courseId),
    findEnrollmentBySupabaseUser(userId, courseId),
    listAdminModules(courseId),
    (supabase as any)
      .from("assessments")
      .select("id,title")
      .eq("course_id", courseId)
      .eq("status", "published")
      .eq("is_required", true),
  ]);
  if (!course)
    return { success: false, error: "COURSE_NOT_FOUND", status: 404 };
  if (
    !enrollment ||
    !["active", "completed"].includes(String(enrollment.status))
  )
    return { success: false, error: "ENROLLMENT_NOT_ACTIVE", status: 403 };
  const publishedModules = modules.filter(
    (item: any) => item.isPublished !== false,
  );
  const lessons = (
    await Promise.all(
      publishedModules.map((item: any) => listAdminLessons(courseId, item.id)),
    )
  )
    .flat()
    .filter((item: any) => item.isPublished !== false);
  if (!lessons.length)
    return {
      success: false,
      error: "COURSE_EMPTY_OR_UNPUBLISHED",
      status: 400,
    };
  const progress = await listProgressBySupabaseUser(userId, courseId);
  const completed = new Set(
    progress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  if (lessons.some((lesson: any) => !completed.has(lesson.id)))
    return { success: false, error: "PROGRESS_INCOMPLETE", status: 400 };
  if (requiredAssessments.error) throw requiredAssessments.error;
  const requiredIds = (requiredAssessments.data ?? []).map(
    (assessment: any) => assessment.id,
  );
  if (requiredIds.length) {
    const { data: passedAssessments, error: assessmentError } = await (
      supabase as any
    )
      .from("assessment_submissions")
      .select("assessment_id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "graded")
      .eq("passed", true)
      .in("assessment_id", requiredIds);
    if (assessmentError) throw assessmentError;
    const passedIds = new Set(
      (passedAssessments ?? []).map(
        (assessment: any) => assessment.assessment_id,
      ),
    );
    if (requiredIds.some((id: string) => !passedIds.has(id))) {
      return {
        success: false,
        error: "REQUIRED_ASSESSMENTS_INCOMPLETE",
        status: 400,
      };
    }
  }

  const verificationCode = code();
  const issuedAt = new Date().toISOString();
  const metadata = {
    studentName: enrollment.userName || "Estudante",
    courseName: course.title,
    courseVersionAtCompletion: course.contentRevision || 1,
    lessons: lessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
    })),
    integrityHash: crypto
      .createHash("sha256")
      .update(
        `${userId}:${courseId}:${lessons.map((lesson: any) => lesson.id).join(",")}:${issuedAt}`,
      )
      .digest("hex"),
    issuedBy: actorUid === userId ? "system" : "admin",
    templateVersion: "v1",
  };
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      code: verificationCode,
      issued_at: issuedAt,
      metadata,
    } as any)
    .select("id")
    .single();
  if (error) throw error;
  return { success: true, certificateId: data.id, verificationCode, issuedAt };
}

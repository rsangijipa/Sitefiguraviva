"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import type {
  CourseAnalytics,
  PlatformAnalytics,
  StudentAnalytics,
} from "@/types/analytics";

type Result<T> = { students?: T; analytics?: T; error?: string };
const numberValue = (value: unknown) => Number(value ?? 0);

async function requireAnalyticsAdmin() {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };
  if (!session.isAdmin) return { error: "Forbidden: Admins only" };
  return { session };
}

/** Reads the canonical Supabase tables; Firebase is no longer a reporting source. */
export async function getStudentAnalytics(
  courseId: string,
): Promise<Result<StudentAnalytics[]>> {
  const authorization = await requireAnalyticsAdmin();
  if ("error" in authorization) return authorization;
  try {
    const supabase = createSupabaseServiceClient();
    const [enrollments, lessons, assessments, certificates] = await Promise.all(
      [
        supabase
          .from("enrollments")
          .select("user_id,enrolled_at")
          .eq("course_id", courseId)
          .not("user_id", "is", null),
        supabase
          .from("lesson_progress")
          .select("user_id,status,percent,updated_at")
          .eq("course_id", courseId)
          .not("user_id", "is", null),
        supabase
          .from("assessment_progress")
          .select("user_id,attempts,best_percentage,passed")
          .eq("course_id", courseId)
          .not("user_id", "is", null),
        supabase
          .from("certificates")
          .select("id,user_id")
          .eq("course_id", courseId)
          .not("user_id", "is", null),
      ],
    );
    const error =
      enrollments.error ||
      lessons.error ||
      assessments.error ||
      certificates.error;
    if (error) throw error;
    const userIds = (enrollments.data ?? []).flatMap((row) =>
      row.user_id ? [row.user_id] : [],
    );
    const { data: profiles, error: profilesError } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id,display_name,email")
          .in("id", userIds)
      : { data: [], error: null };
    if (profilesError) throw profilesError;

    const byUser = <T extends { user_id: string | null }>(rows: T[]) => {
      const result = new Map<string, T[]>();
      for (const row of rows)
        if (row.user_id)
          result.set(row.user_id, [...(result.get(row.user_id) ?? []), row]);
      return result;
    };
    const profilesById = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );
    const lessonByUser = byUser(lessons.data ?? []);
    const assessmentByUser = byUser(assessments.data ?? []);
    const certificateByUser = new Map(
      (certificates.data ?? []).flatMap((certificate) =>
        certificate.user_id
          ? [[certificate.user_id, certificate.id] as const]
          : [],
      ),
    );
    const students = (enrollments.data ?? []).flatMap((enrollment) => {
      if (!enrollment.user_id) return [];
      const profile = profilesById.get(enrollment.user_id);
      const studentLessons = lessonByUser.get(enrollment.user_id) ?? [];
      const studentAssessments = assessmentByUser.get(enrollment.user_id) ?? [];
      const attempted = studentAssessments.filter(
        (assessment) => assessment.attempts > 0,
      );
      const progressPercentage = studentLessons.length
        ? studentLessons.reduce(
            (sum, lesson) => sum + numberValue(lesson.percent),
            0,
          ) / studentLessons.length
        : 0;
      const certificateId = certificateByUser.get(enrollment.user_id);
      return [
        {
          userId: enrollment.user_id,
          userName: profile?.display_name || profile?.email || "Anônimo",
          userEmail: profile?.email || "",
          courseId,
          courseName: "",
          enrolledAt: enrollment.enrolled_at,
          lastActive: studentLessons
            .map((lesson) => lesson.updated_at)
            .sort()
            .at(-1),
          totalLessons: studentLessons.length,
          completedLessons: studentLessons.filter(
            (lesson) =>
              lesson.status === "completed" ||
              numberValue(lesson.percent) >= 100,
          ).length,
          progressPercentage,
          totalAssessments: studentAssessments.length,
          completedAssessments: attempted.length,
          averageScore: attempted.length
            ? attempted.reduce(
                (sum, assessment) =>
                  sum + numberValue(assessment.best_percentage),
                0,
              ) / attempted.length
            : 0,
          passedAssessments: studentAssessments.filter(
            (assessment) => assessment.passed,
          ).length,
          failedAssessments: studentAssessments.filter(
            (assessment) => assessment.attempts > 0 && !assessment.passed,
          ).length,
          totalTimeSpent: 0,
          isComplete: progressPercentage >= 100,
          certificateIssued: Boolean(certificateId),
          certificateId,
        },
      ];
    });
    return { students };
  } catch (error) {
    console.error("Get Student Analytics Error:", error);
    return { error: "Erro ao buscar analytics de alunos" };
  }
}

export async function getCourseAnalytics(
  courseId: string,
): Promise<Result<CourseAnalytics>> {
  const authorization = await requireAnalyticsAdmin();
  if ("error" in authorization) return authorization;
  try {
    const supabase = createSupabaseServiceClient();
    const [course, assessments, studentResult] = await Promise.all([
      supabase.from("courses").select("title").eq("id", courseId).maybeSingle(),
      supabase.from("assessments").select("id").eq("course_id", courseId),
      getStudentAnalytics(courseId),
    ]);
    if (course.error || assessments.error)
      throw course.error || assessments.error;
    if (!course.data) return { error: "Curso não encontrado" };
    if (studentResult.error) return { error: studentResult.error };
    const students = studentResult.students ?? [];
    const activeAfter = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const activeStudents = students.filter(
      (student) =>
        student.lastActive &&
        new Date(student.lastActive as string).getTime() >= activeAfter,
    ).length;
    const assessmentAttempts = students.reduce(
      (sum, student) =>
        sum + student.passedAssessments + student.failedAssessments,
      0,
    );
    return {
      analytics: {
        courseId,
        courseName: course.data.title,
        totalEnrollments: students.length,
        activeStudents,
        inactiveStudents: students.length - activeStudents,
        averageProgress: students.length
          ? students.reduce(
              (sum, student) => sum + student.progressPercentage,
              0,
            ) / students.length
          : 0,
        completionRate: students.length
          ? (students.filter((student) => student.isComplete).length * 100) /
            students.length
          : 0,
        totalAssessments: (assessments.data ?? []).length,
        averageAssessmentScore: students.filter(
          (student) => student.completedAssessments,
        ).length
          ? students.reduce((sum, student) => sum + student.averageScore, 0) /
            students.filter((student) => student.completedAssessments).length
          : 0,
        assessmentPassRate: assessmentAttempts
          ? (students.reduce(
              (sum, student) => sum + student.passedAssessments,
              0,
            ) *
              100) /
            assessmentAttempts
          : 0,
        certificatesIssued: students.filter(
          (student) => student.certificateIssued,
        ).length,
        averageTimePerStudent: 0,
      },
    };
  } catch (error) {
    console.error("Get Course Analytics Error:", error);
    return { error: "Erro ao buscar analytics do curso" };
  }
}

export async function getPlatformAnalytics(): Promise<
  Result<PlatformAnalytics>
> {
  const authorization = await requireAnalyticsAdmin();
  if ("error" in authorization) return authorization;
  try {
    const supabase = createSupabaseServiceClient();
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [
      profiles,
      courses,
      enrollments,
      certificates,
      progress,
      submissions,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase
        .from("enrollments")
        .select("course_id,enrolled_at", { count: "exact" }),
      supabase.from("certificates").select("issued_at", { count: "exact" }),
      supabase.from("lesson_progress").select("user_id,percent,updated_at"),
      supabase
        .from("assessment_submissions")
        .select("percentage")
        .eq("status", "graded"),
    ]);
    const error =
      profiles.error ||
      courses.error ||
      enrollments.error ||
      certificates.error ||
      progress.error ||
      submissions.error;
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const enrollment of enrollments.data ?? [])
      counts.set(
        enrollment.course_id,
        (counts.get(enrollment.course_id) ?? 0) + 1,
      );
    const ids = [...counts.keys()];
    const { data: namedCourses, error: namesError } = ids.length
      ? await supabase.from("courses").select("id,title").in("id", ids)
      : { data: [], error: null };
    if (namesError) throw namesError;
    const names = new Map(
      (namedCourses ?? []).map((course) => [course.id, course.title]),
    );
    const progressRows = progress.data ?? [],
      submissionRows = submissions.data ?? [];
    return {
      analytics: {
        totalUsers: profiles.count ?? 0,
        totalCourses: courses.count ?? 0,
        totalEnrollments: enrollments.count ?? 0,
        totalCertificates: certificates.count ?? 0,
        activeUsers: new Set(
          progressRows
            .filter((row) => row.updated_at >= since)
            .map((row) => row.user_id),
        ).size,
        newEnrollments: (enrollments.data ?? []).filter(
          (row) => row.enrolled_at >= since,
        ).length,
        certificatesIssued: (certificates.data ?? []).filter(
          (row) => row.issued_at >= since,
        ).length,
        averageCourseCompletion: progressRows.length
          ? progressRows.reduce(
              (sum, row) => sum + numberValue(row.percent),
              0,
            ) / progressRows.length
          : 0,
        averageAssessmentScore: submissionRows.length
          ? submissionRows.reduce(
              (sum, row) => sum + numberValue(row.percentage),
              0,
            ) / submissionRows.length
          : 0,
        topCourses: [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([courseId, enrollments]) => ({
            courseId,
            courseName: names.get(courseId) ?? "Curso",
            enrollments,
          })),
        topStudents: [],
      },
    };
  } catch (error) {
    console.error("Get Platform Analytics Error:", error);
    return { error: "Erro ao buscar analytics da plataforma" };
  }
}

export type EventType =
  | "video_play"
  | "video_pause"
  | "video_complete"
  | "quiz_start"
  | "quiz_complete"
  | "document_open"
  | "page_view"
  | "funnel_signup"
  | "funnel_enrollment_pending"
  | "funnel_enrollment_active"
  | "funnel_course_completed"
  | "funnel_certificate_issued";

export async function trackEvent(
  type: EventType,
  resourceId: string,
  metadata: Record<string, unknown> = {},
) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthenticated" };
  return insertEvent(session.uid, session.uid, type, resourceId, metadata);
}

export async function trackFunnelEvent(
  type: Extract<EventType, `funnel_${string}`>,
  metadata: Record<string, unknown> = {},
  explicitUserId?: string,
) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthenticated" };
  if (explicitUserId && explicitUserId !== session.uid && !session.isAdmin)
    return { success: false, error: "Forbidden" };
  return insertEvent(
    explicitUserId ?? session.uid,
    session.uid,
    type,
    null,
    metadata,
  );
}

async function insertEvent(
  userId: string,
  actorUserId: string,
  type: EventType,
  resourceId: string | null,
  metadata: Record<string, unknown>,
) {
  try {
    // analytics_events is introduced by a later migration and is intentionally
    // kept outside the generated schema until types are regenerated remotely.
    const { error } = await (createSupabaseServiceClient() as any)
      .from("analytics_events")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        actor_user_id: actorUserId,
        type,
        resource_id: resourceId,
        metadata,
        source: "server_action",
        timestamp: new Date().toISOString(),
      });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Track analytics event error:", error);
    return { success: false, error: "Erro ao registrar evento" };
  }
}

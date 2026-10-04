"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type {
  StudentAnalytics,
  CourseAnalytics,
  PlatformAnalytics,
} from "@/types/analytics";

async function getAuthContext() {
  const session = await verifySession();
  if (session) {
    return {
      uid: session.uid,
      email: session.email,
      role: session.role || "student",
      admin: session.isAdmin,
    };
  }

  // Fallback for tests or legacy cookies
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (sessionCookie && auth?.verifySessionCookie) {
      return await auth.verifySessionCookie(sessionCookie, true);
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Get student analytics for a specific course
 */
export async function getStudentAnalytics(courseId: string) {
  const claims = await getAuthContext();
  if (!claims) return { error: "Unauthorized" };

  if (claims.role !== "admin" && claims.admin !== true) {
    return { error: "Forbidden: Admins only" };
  }

  try {
    // Get all enrollments for this course
    const enrollmentsQuery = await adminDb
      .collection("enrollments")
      .where("courseId", "==", courseId)
      .get();

    const studentsAnalytics: StudentAnalytics[] = [];

    for (const enrollDoc of enrollmentsQuery.docs) {
      const enrollment = enrollDoc.data();

      // Get user details
      const userDoc = await adminDb
        .collection("users")
        .doc(enrollment.userId)
        .get();
      const userData = userDoc.data();

      // Get course progress
      const progressDoc = await adminDb
        .collection("users")
        .doc(enrollment.userId)
        .collection("courseProgress")
        .doc(courseId)
        .get();

      const progress = progressDoc.exists ? progressDoc.data() : null;

      // Get assessment progress
      const assessmentProgressQuery = await adminDb
        .collection("users")
        .doc(enrollment.userId)
        .collection("assessmentProgress")
        .where("courseId", "==", courseId)
        .get();

      let totalAssessments = 0;
      let completedAssessments = 0;
      let totalScore = 0;
      let passedAssessments = 0;
      let failedAssessments = 0;

      for (const assessmentProg of assessmentProgressQuery.docs) {
        const data = assessmentProg.data();
        totalAssessments++;
        if (data.attempts > 0) {
          completedAssessments++;
          totalScore += data.bestPercentage || 0;
          if (data.passed) {
            passedAssessments++;
          } else {
            failedAssessments++;
          }
        }
      }

      const averageScore =
        completedAssessments > 0 ? totalScore / completedAssessments : 0;

      // Get certificate
      const certificateQuery = await adminDb
        .collection("certificates")
        .where("userId", "==", enrollment.userId)
        .where("courseId", "==", courseId)
        .where("status", "==", "issued")
        .limit(1)
        .get();

      const certificateIssued = !certificateQuery.empty;
      const certificateId = certificateIssued
        ? certificateQuery.docs[0].id
        : undefined;

      const studentAnalytics: StudentAnalytics = {
        userId: enrollment.userId,
        userName: userData?.displayName || userData?.email || "Anônimo",
        userEmail: userData?.email || "",
        courseId,
        courseName: "", // Will be populated later
        enrolledAt: enrollment.enrolledAt,
        lastActive: progress?.lastUpdated,
        totalLessons: progress?.totalLessons || 0,
        completedLessons: progress?.completedLessons || 0,
        progressPercentage: progress?.completionPercentage || 0,
        totalAssessments,
        completedAssessments,
        averageScore,
        passedAssessments,
        failedAssessments,
        totalTimeSpent: progress?.totalTimeSpent || 0,
        isComplete: progress?.completionPercentage >= 100,
        certificateIssued,
        certificateId,
      };

      studentsAnalytics.push(studentAnalytics);
    }

    return { students: studentsAnalytics };
  } catch (error) {
    console.error("Get Student Analytics Error:", error);
    return { error: "Erro ao buscar analytics de alunos" };
  }
}

/**
 * Get course analytics overview
 */
export async function getCourseAnalytics(courseId: string) {
  const claims = await getAuthContext();
  if (!claims) return { error: "Unauthorized" };

  if (claims.role !== "admin" && claims.admin !== true) {
    return { error: "Forbidden: Admins only" };
  }

  try {
    // Get course details
    const courseDoc = await adminDb.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) {
      return { error: "Curso não encontrado" };
    }

    const courseData = courseDoc.data();

    // Get enrollments
    const enrollmentsQuery = await adminDb
      .collection("enrollments")
      .where("courseId", "==", courseId)
      .get();

    const totalEnrollments = enrollmentsQuery.size;

    // Calculate active vs inactive (30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let activeStudents = 0;
    let totalProgress = 0;
    let completedStudents = 0;

    for (const enrollDoc of enrollmentsQuery.docs) {
      const enrollment = enrollDoc.data();

      // Get progress
      const progressDoc = await adminDb
        .collection("users")
        .doc(enrollment.userId)
        .collection("courseProgress")
        .doc(courseId)
        .get();

      if (progressDoc.exists) {
        const progress = progressDoc.data();
        totalProgress += progress.completionPercentage || 0;

        if (progress.completionPercentage >= 100) {
          completedStudents++;
        }

        if (progress.lastUpdated?.toMillis() > thirtyDaysAgo) {
          activeStudents++;
        }
      }
    }

    const averageProgress =
      totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;
    const completionRate =
      totalEnrollments > 0 ? (completedStudents / totalEnrollments) * 100 : 0;
    const inactiveStudents = totalEnrollments - activeStudents;

    // Get assessments
    const assessmentsQuery = await adminDb
      .collection("assessments")
      .where("courseId", "==", courseId)
      .get();

    const totalAssessments = assessmentsQuery.size;

    // Calculate average assessment score
    let totalAssessmentScore = 0;
    let totalAssessmentSubmissions = 0;
    let passedSubmissions = 0;

    for (const assessmentDoc of assessmentsQuery.docs) {
      const submissionsQuery = await adminDb
        .collection("assessmentSubmissions")
        .where("assessmentId", "==", assessmentDoc.id)
        .where("status", "==", "graded")
        .get();

      for (const subDoc of submissionsQuery.docs) {
        const submission = subDoc.data();
        totalAssessmentSubmissions++;
        totalAssessmentScore += submission.percentage || 0;
        if (submission.passed) {
          passedSubmissions++;
        }
      }
    }

    const averageAssessmentScore =
      totalAssessmentSubmissions > 0
        ? totalAssessmentScore / totalAssessmentSubmissions
        : 0;
    const assessmentPassRate =
      totalAssessmentSubmissions > 0
        ? (passedSubmissions / totalAssessmentSubmissions) * 100
        : 0;

    // Get certificates
    const certificatesQuery = await adminDb
      .collection("certificates")
      .where("courseId", "==", courseId)
      .where("status", "==", "issued")
      .get();

    const certificatesIssued = certificatesQuery.size;

    const analytics: CourseAnalytics = {
      courseId,
      courseName: courseData?.title || "Curso",
      totalEnrollments,
      activeStudents,
      inactiveStudents,
      averageProgress,
      completionRate,
      totalAssessments,
      averageAssessmentScore,
      assessmentPassRate,
      certificatesIssued,
      averageTimePerStudent: 0,
    };

    return { analytics };
  } catch (error) {
    console.error("Get Course Analytics Error:", error);
    return { error: "Erro ao buscar analytics do curso" };
  }
}

/**
 * Get platform-wide analytics
 */
export async function getPlatformAnalytics() {
  const claims = await getAuthContext();
  if (!claims) return { error: "Unauthorized" };

  if (claims.admin !== true && claims.role !== "admin") {
    return { error: "Forbidden: Admins only" };
  }

  try {
    // Try Supabase first
    try {
      const supabase = createSupabaseServiceClient();
      const [usersRes, coursesRes, enrollmentsRes, certsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
      ]);

      if (
        !usersRes.error &&
        !coursesRes.error &&
        !enrollmentsRes.error &&
        !certsRes.error
      ) {
        const analytics: PlatformAnalytics = {
          totalUsers: usersRes.count ?? 0,
          totalCourses: coursesRes.count ?? 0,
          totalEnrollments: enrollmentsRes.count ?? 0,
          totalCertificates: certsRes.count ?? 0,
          activeUsers: 0,
          newEnrollments: 0,
          certificatesIssued: certsRes.count ?? 0,
          averageCourseCompletion: 0,
          averageAssessmentScore: 0,
          topCourses: [],
          topStudents: [],
        };
        return { analytics };
      }
    } catch {
      // fallback
    }

    // Get counts from Firestore
    const usersCount = (await adminDb.collection("users").count().get()).data()
      .count;
    const coursesCount = (
      await adminDb.collection("courses").count().get()
    ).data().count;
    const enrollmentsCount = (
      await adminDb.collection("enrollments").count().get()
    ).data().count;
    const certificatesCount = (
      await adminDb
        .collection("certificates")
        .where("status", "==", "issued")
        .count()
        .get()
    ).data().count;

    const analytics: PlatformAnalytics = {
      totalUsers: usersCount,
      totalCourses: coursesCount,
      totalEnrollments: enrollmentsCount,
      totalCertificates: certificatesCount,
      activeUsers: 0,
      newEnrollments: 0,
      certificatesIssued: 0,
      averageCourseCompletion: 0,
      averageAssessmentScore: 0,
      topCourses: [],
      topStudents: [],
    };

    return { analytics };
  } catch (error) {
    console.error("Get Platform Analytics Error:", error);
    return { error: "Erro ao buscar analytics da plataforma" };
  }
}

/**
 * Track granular student interaction events
 */
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
  metadata: Record<string, any> = {},
) {
  try {
    const claims = await getAuthContext();
    if (!claims) return { success: false, error: "Unauthenticated" };
    const uid = claims.uid;

    const eventId = `${uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Write to Firestore if available
    try {
      await adminDb.collection("analytics_events").doc(eventId).set({
        userId: uid,
        type,
        resourceId,
        metadata,
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    // Write to Supabase audit_logs
    try {
      const supabase = createSupabaseServiceClient();
      await supabase.from("audit_logs").insert({
        event_type: type,
        actor_user_id: uid,
        target_collection: "analytics",
        target_id: resourceId,
        payload: metadata,
      });
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error: any) {
    console.error("[TrackEvent Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Track funnel milestones using server-side writes to analytics_events.
 */
export async function trackFunnelEvent(
  type:
    | "funnel_signup"
    | "funnel_enrollment_pending"
    | "funnel_enrollment_active"
    | "funnel_course_completed"
    | "funnel_certificate_issued",
  metadata: Record<string, any> = {},
  explicitUserId?: string,
) {
  try {
    const claims = await getAuthContext();
    if (!claims) return { success: false, error: "Unauthenticated" };

    const actorUid = claims.uid;
    const actorIsAdmin = claims.admin === true || claims.role === "admin";

    const userId = explicitUserId || actorUid;
    if (explicitUserId && explicitUserId !== actorUid && !actorIsAdmin) {
      return { success: false, error: "Forbidden" };
    }

    const eventId = `${userId}_${type}_${Date.now()}`;
    try {
      await adminDb.collection("analytics_events").doc(eventId).set({
        userId,
        actorUid,
        type,
        metadata,
        source: "server_action",
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    try {
      const supabase = createSupabaseServiceClient();
      await supabase.from("audit_logs").insert({
        event_type: type,
        actor_user_id: actorUid,
        target_collection: "funnel",
        target_id: userId,
        payload: metadata,
      });
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error: any) {
    console.error("[trackFunnelEvent Error]:", error);
    return { success: false, error: error.message };
  }
}

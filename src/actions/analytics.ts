"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import type {
  StudentAnalytics,
  CourseAnalytics,
  AssessmentAnalytics,
  PlatformAnalytics,
} from "@/types/analytics";

/**
 * Get student analytics for a specific course
 */
export async function getStudentAnalytics(courseId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

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
      averageTimePerStudent: 0, // TODO: Calculate from session tracking
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);

    if (claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    // Get counts
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

    // 30 days metrics
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // TODO: Implement more detailed metrics

    const analytics: PlatformAnalytics = {
      totalUsers: usersCount,
      totalCourses: coursesCount,
      totalEnrollments: enrollmentsCount,
      totalCertificates: certificatesCount,
      activeUsers: 0, // TODO
      newEnrollments: 0, // TODO
      certificatesIssued: 0, // TODO
      averageCourseCompletion: 0, // TODO
      averageAssessmentScore: 0, // TODO
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
  | "page_view";

export async function trackEvent(
  type: EventType,
  resourceId: string,
  metadata: Record<string, any> = {},
) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) return { success: false, error: "Unauthenticated" };

    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    const eventId = `${uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await adminDb.collection("analytics_events").doc(eventId).set({
      userId: uid,
      type,
      resourceId,
      metadata,
      timestamp: new Date(), // using Date for standard Firestore timestamp consistency in this file
    });

    return { success: true };
  } catch (error: any) {
    console.error("[TrackEvent Error]:", error);
    return { success: false, error: error.message };
  }
}

"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

async function assertAdmin() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthenticated");
  const token = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!token.admin && token.role !== "admin") throw new Error("Forbidden");
  return token;
}

export async function getDetailedDashboardStats() {
  try {
    await assertAdmin();

    const [
      usersCount,
      activeEnrollmentsCount,
      coursesCount,
      blogPostsCount,
      libraryCount,
      pendingAuditCount,
      recentUsers,
      pendingEnrollments,
    ] = await Promise.all([
      adminDb
        .collection("users")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("enrollments")
        .where("status", "==", "active")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("courses")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("blog")
        .where("type", "!=", "library")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("blog")
        .where("type", "==", "library")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("audit_logs")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("users")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get()
        .then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      adminDb
        .collection("enrollments")
        .where("status", "==", "pending_approval")
        .limit(5)
        .get()
        .then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    ]);

    return {
      success: true,
      stats: {
        totalUsers: usersCount,
        activeEnrollments: activeEnrollmentsCount,
        totalCourses: coursesCount,
        blogPosts: blogPostsCount,
        libraryDocs: libraryCount,
        totalAuditLogs: pendingAuditCount,
        recentUsers: recentUsers,
        pendingEnrollments: pendingEnrollments,
      },
    };
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: error.message };
  }
}

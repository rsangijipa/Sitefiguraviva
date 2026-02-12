"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { buildAdminDashboardKPIs } from "@/lib/metrics/kpi";

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

    const kpi = await buildAdminDashboardKPIs();
    if (!kpi.success || !kpi.data) {
      return { success: false, error: kpi.error || "Failed to load KPIs" };
    }

    return {
      success: true,
      stats: {
        totalUsers: kpi.data.totalUsers,
        activeEnrollments: kpi.data.accessGranted,
        totalCourses: kpi.data.totalCourses,
        blogPosts: null,
        libraryDocs: kpi.data.libraryDocs,
        totalAuditLogs: kpi.data.totalAuditLogs,
        recentUsers: kpi.data.recentUsers,
        pendingEnrollments: kpi.data.pendingEnrollments,
        source: kpi.source,
        updatedAt: kpi.updatedAt,
      },
    };
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: error.message };
  }
}

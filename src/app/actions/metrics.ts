"use server";

import {
  buildAdminDashboardKPIs,
  buildStudentDashboardKPIs,
} from "@/lib/metrics/kpi";
import {
  verifySession as requireSessionBase,
  requireAdmin,
} from "@/lib/auth/server";

async function requireSession() {
  const claims = await requireSessionBase();
  if (!claims) throw new Error("Unauthenticated");
  return claims;
}

export async function getStudentDashboardKPIs(uid?: string) {
  try {
    const claims = await requireSession();
    const effectiveUid = uid || claims.uid;

    if (effectiveUid !== claims.uid && !claims.isAdmin) {
      return {
        success: false,
        error: "Forbidden",
        data: undefined,
        source: {},
        updatedAt: new Date().toISOString(),
      };
    }

    return await buildStudentDashboardKPIs(effectiveUid);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to load student dashboard KPIs",
      data: undefined,
      source: {},
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function getAdminDashboardKPIs() {
  try {
    await requireAdmin();
    return await buildAdminDashboardKPIs();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to load admin dashboard KPIs",
      data: undefined,
      source: {},
      updatedAt: new Date().toISOString(),
    };
  }
}

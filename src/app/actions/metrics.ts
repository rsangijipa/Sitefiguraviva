"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import {
  buildAdminDashboardKPIs,
  buildStudentDashboardKPIs,
} from "@/lib/metrics/kpi";

async function requireSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthenticated");
  return adminAuth.verifySessionCookie(sessionCookie, true);
}

async function requireAdmin() {
  const claims = await requireSession();
  if (!claims.admin && claims.role !== "admin") throw new Error("Forbidden");
  return claims;
}

export async function getStudentDashboardKPIs(uid?: string) {
  try {
    const claims = await requireSession();
    const effectiveUid = uid || claims.uid;

    if (
      effectiveUid !== claims.uid &&
      !claims.admin &&
      claims.role !== "admin"
    ) {
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

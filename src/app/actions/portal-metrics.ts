"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

type WeeklyPoint = {
  day: string;
  value: number;
};

function buildWeekMap() {
  const map = new Map<string, number>();
  const labels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(key);
    map.set(key, 0);
  }

  return { map, labels };
}

function toPtDay(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}

function normalizeTimestamp(raw: any): Date | null {
  if (!raw) return null;
  if (typeof raw.toDate === "function") return raw.toDate();
  if (typeof raw === "string" || raw instanceof Date) return new Date(raw);
  if (typeof raw._seconds === "number") return new Date(raw._seconds * 1000);
  return null;
}

export async function getStudentWeeklyActivity() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) {
    return {
      success: false,
      error: "Unauthorized",
      points: [] as WeeklyPoint[],
    };
  }

  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = claims.uid;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const { map, labels } = buildWeekMap();

    const xpSnap = await adminDb
      .collection("xp_transactions")
      .where("userId", "==", uid)
      .where("timestamp", ">=", weekStart)
      .get();

    if (!xpSnap.empty) {
      xpSnap.docs.forEach((doc) => {
        const data = doc.data();
        const ts = normalizeTimestamp(data.timestamp);
        if (!ts) return;
        const key = ts.toISOString().slice(0, 10);
        if (!map.has(key)) return;
        const amount = Number(data.amount || 0);
        map.set(
          key,
          (map.get(key) || 0) + (Number.isFinite(amount) ? amount : 0),
        );
      });

      const points = labels.map((key) => ({
        day: toPtDay(key),
        value: map.get(key) || 0,
      }));
      return { success: true, points, source: "xp_transactions" };
    }

    // Fallback: analytics events count per day
    const analyticsSnap = await adminDb
      .collection("analytics_events")
      .where("userId", "==", uid)
      .where("timestamp", ">=", weekStart)
      .get();

    analyticsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const ts = normalizeTimestamp(data.timestamp);
      if (!ts) return;
      const key = ts.toISOString().slice(0, 10);
      if (!map.has(key)) return;
      map.set(key, (map.get(key) || 0) + 1);
    });

    const points = labels.map((key) => ({
      day: toPtDay(key),
      value: map.get(key) || 0,
    }));
    return { success: true, points, source: "analytics_events" };
  } catch (error: any) {
    console.error("getStudentWeeklyActivity error:", error);
    return {
      success: false,
      error: error.message || "Failed to load weekly activity",
      points: [] as WeeklyPoint[],
    };
  }
}

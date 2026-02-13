import { adminDb } from "@/lib/firebase/admin";
import { deepSafeSerialize } from "@/lib/utils";
import { FieldPath } from "firebase-admin/firestore";

type WeeklyPoint = {
  day: string;
  value: number;
};

export type StudentDashboardKpisData = {
  enrollments: any[];
  certificates: any[];
  certificatesCount: number;
  events: any[];
  profileCompletion: number;
  weeklyActivity: WeeklyPoint[];
  lastCourse: any | null;
  gamification: {
    totalXp: number;
    level: number;
    currentStreak: number;
    badgesCount: number;
    nextLevelXp: number;
    progressToNextLevel: number;
  } | null;
  availability: {
    enrollments: boolean;
    certificates: boolean;
    events: boolean;
    weeklyActivity: boolean;
    profileCompletion: boolean;
    gamification: boolean;
  };
};

export type AdminDashboardKpisData = {
  totalUsers: number;
  accessGranted: number;
  totalCourses: number;
  libraryDocs: number;
  totalAuditLogs: number;
  recentUsers: any[];
  pendingEnrollments: any[];
};

export type KpiActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
  source: Record<string, string>;
  updatedAt: string;
};

function toPtWeekday(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}

function normalizeTimestamp(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw.toDate === "function") return raw.toDate();
  if (typeof raw === "string") return new Date(raw);
  if (typeof raw._seconds === "number") return new Date(raw._seconds * 1000);
  if (typeof raw.seconds === "number") return new Date(raw.seconds * 1000);
  return null;
}

function buildWeekSeries() {
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

async function getWeeklyActivity(uid: string): Promise<{
  points: WeeklyPoint[];
  source: string;
}> {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);

  const { map, labels } = buildWeekSeries();

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

    return {
      points: labels.map((key) => ({
        day: toPtWeekday(key),
        value: map.get(key) || 0,
      })),
      source: "firestore/xp_transactions",
    };
  }

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

  return {
    points: labels.map((key) => ({
      day: toPtWeekday(key),
      value: map.get(key) || 0,
    })),
    source: "firestore/analytics_events",
  };
}

export async function buildStudentDashboardKPIs(
  uid: string,
): Promise<KpiActionResult<StudentDashboardKpisData>> {
  const updatedAt = new Date().toISOString();
  const source: Record<string, string> = {
    enrollments: "firestore/enrollments",
    courses: "firestore/courses",
    certificates: "firestore/certificates",
    events: "firestore/events",
    profile: "firestore/users",
    weeklyActivity: "firestore/xp_transactions|analytics_events",
  };

  const empty: StudentDashboardKpisData = {
    enrollments: [],
    certificates: [],
    certificatesCount: 0,
    events: [],
    profileCompletion: 0,
    weeklyActivity: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"].map(
      (d) => ({ day: d, value: 0 }),
    ),
    lastCourse: null,
    gamification: null,
    availability: {
      enrollments: false,
      certificates: false,
      events: false,
      weeklyActivity: false,
      profileCompletion: false,
      gamification: false,
    },
  };

  try {
    const [
      enrollmentRes,
      certificatesRes,
      eventsRes,
      profileRes,
      weeklyRes,
      gamificationRes,
    ] = await Promise.allSettled([
      adminDb.collection("enrollments").where("uid", "==", uid).get(),
      adminDb.collection("certificates").where("userId", "==", uid).get(),
      adminDb
        .collection("events")
        .where("status", "in", ["scheduled", "live"])
        .where("isPublic", "==", true)
        .get(),
      adminDb.collection("users").doc(uid).get(),
      getWeeklyActivity(uid),
      adminDb.collection("gamification_profiles").doc(uid).get(),
    ]);

    let enrollments: any[] = [];

    if (enrollmentRes.status === "fulfilled") {
      const enrollmentDocs = enrollmentRes.value.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const allowedEnrollments = enrollmentDocs.filter((e: any) =>
        ["active", "completed"].includes(e.status),
      );
      const courseIds = [
        ...new Set(
          allowedEnrollments.map((e: any) => e.courseId).filter(Boolean),
        ),
      ];
      const courseMap = new Map<string, any>();

      if (courseIds.length > 0) {
        const chunkSize = 10;
        for (let i = 0; i < courseIds.length; i += chunkSize) {
          const chunk = courseIds.slice(i, i + chunkSize);
          const coursesSnap = await adminDb
            .collection("courses")
            .where(FieldPath.documentId(), "in", chunk)
            .get();
          coursesSnap.docs.forEach((c) => courseMap.set(c.id, c.data()));
        }
      }

      enrollments = allowedEnrollments
        .map((e: any) => ({
          ...e,
          courseTitle: courseMap.get(e.courseId)?.title || "Curso",
          totalLessons: Number(courseMap.get(e.courseId)?.totalLessons || 0),
        }))
        .sort((a, b) => {
          const tA = normalizeTimestamp(a.lastAccessedAt)?.getTime() || 0;
          const tB = normalizeTimestamp(b.lastAccessedAt)?.getTime() || 0;
          return tB - tA;
        });

      empty.availability.enrollments = true;
      empty.enrollments = enrollments;
      empty.lastCourse =
        enrollments.length > 0
          ? {
              ...enrollments[0],
              percent: Number(enrollments[0]?.progressSummary?.percent || 0),
            }
          : null;
    }

    if (certificatesRes.status === "fulfilled") {
      empty.certificates = certificatesRes.value.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      empty.certificatesCount = empty.certificates.length;
      empty.availability.certificates = true;
    }

    if (eventsRes.status === "fulfilled") {
      const now = new Date();
      empty.events = eventsRes.value.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((e: any) => {
          const startsAt = normalizeTimestamp(e.startsAt);
          return startsAt ? startsAt >= now : false;
        })
        .sort((a: any, b: any) => {
          const tA = normalizeTimestamp(a.startsAt)?.getTime() || 0;
          const tB = normalizeTimestamp(b.startsAt)?.getTime() || 0;
          return tA - tB;
        })
        .slice(0, 3);
      empty.availability.events = true;
    }

    if (profileRes.status === "fulfilled" && profileRes.value.exists) {
      empty.profileCompletion = Number(
        profileRes.value.data()?.profileCompletion || 0,
      );
      empty.availability.profileCompletion = true;
    }

    if (weeklyRes.status === "fulfilled") {
      empty.weeklyActivity = weeklyRes.value.points;
      source.weeklyActivity = weeklyRes.value.source;
      empty.availability.weeklyActivity = true;
    }

    if (
      gamificationRes &&
      gamificationRes.status === "fulfilled" &&
      gamificationRes.value &&
      gamificationRes.value.exists
    ) {
      const gData = gamificationRes.value.data();
      if (gData) {
        const level = Number(gData.level || 1);
        const totalXp = Number(gData.totalXp || 0);
        // Basic XP formula: Level * 1000
        const nextLevelXp = level * 1000;
        const currentLevelBaseXp = (level - 1) * 1000;
        const xpInCurrentLevel = totalXp - currentLevelBaseXp;
        const xpNeededForNext = nextLevelXp - currentLevelBaseXp;

        empty.gamification = {
          totalXp,
          level,
          currentStreak: Number(gData.currentStreak || 0),
          badgesCount: Array.isArray(gData.badges) ? gData.badges.length : 0,
          nextLevelXp,
          progressToNextLevel: Math.min(
            100,
            Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100),
          ),
        };
        empty.availability.gamification = true;
      }
    }

    const availableCount = Object.values(empty.availability).filter(
      Boolean,
    ).length;
    if (availableCount === 0) {
      return {
        success: false,
        error: "No KPI sources available",
        source,
        updatedAt,
      };
    }

    return {
      success: true,
      data: deepSafeSerialize(empty),
      source,
      updatedAt,
    };
  } catch (error: any) {
    console.error("buildStudentDashboardKPIs error:", error);
    return {
      success: false,
      error: error.message || "Failed to load student KPIs",
      source,
      updatedAt,
    };
  }
}

export async function buildAdminDashboardKPIs(): Promise<
  KpiActionResult<AdminDashboardKpisData>
> {
  const updatedAt = new Date().toISOString();
  const source: Record<string, string> = {
    totalUsers: "firestore/users",
    accessGranted: "firestore/enrollments(status in active|completed)",
    totalCourses: "firestore/courses",
    libraryDocs: "firestore/posts(type=library)",
    totalAuditLogs: "firestore/audit_logs",
    recentUsers: "firestore/users(orderBy createdAt desc)",
    pendingEnrollments: "firestore/enrollments(status=pending_approval)",
  };

  try {
    const [
      usersCount,
      accessGranted,
      coursesCount,
      libraryCount,
      auditCount,
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
        .where("status", "in", ["active", "completed"])
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("courses")
        .count()
        .get()
        .then((s) => s.data().count),
      adminDb
        .collection("posts")
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
        .orderBy("createdAt", "desc")
        .limit(5)
        .get()
        .then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    ]);

    return {
      success: true,
      data: deepSafeSerialize({
        totalUsers: usersCount,
        accessGranted,
        totalCourses: coursesCount,
        libraryDocs: libraryCount,
        totalAuditLogs: auditCount,
        recentUsers,
        pendingEnrollments,
      }),
      source,
      updatedAt,
    };
  } catch (error: any) {
    console.error("buildAdminDashboardKPIs error:", error);
    return {
      success: false,
      error: error.message || "Failed to load admin KPIs",
      source,
      updatedAt,
    };
  }
}

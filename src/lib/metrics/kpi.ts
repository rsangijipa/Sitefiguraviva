import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

type WeeklyPoint = { day: string; value: number };

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

const numberValue = (value: unknown) => Number(value ?? 0);
const source = (entries: string[]) =>
  Object.fromEntries(entries.map((entry) => [entry, `supabase/${entry}`]));

function weekDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

function weeklyPoints(rows: { amount?: number; timestamp: string }[]) {
  const dates = weekDays();
  const values = new Map(
    dates.map((date) => [date.toISOString().slice(0, 10), 0]),
  );
  for (const row of rows) {
    const key = new Date(row.timestamp).toISOString().slice(0, 10);
    if (values.has(key))
      values.set(key, (values.get(key) ?? 0) + numberValue(row.amount ?? 1));
  }
  return dates.map((date) => ({
    day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
    value: values.get(date.toISOString().slice(0, 10)) ?? 0,
  }));
}

export async function buildStudentDashboardKPIs(
  uid: string,
): Promise<KpiActionResult<StudentDashboardKpisData>> {
  const updatedAt = new Date().toISOString();
  const dataSource = source([
    "enrollments",
    "courses",
    "certificates",
    "events",
    "profiles",
    "xp_transactions",
    "analytics_events",
    "gamification_profiles",
  ]);
  const empty: StudentDashboardKpisData = {
    enrollments: [],
    certificates: [],
    certificatesCount: 0,
    events: [],
    profileCompletion: 0,
    weeklyActivity: weeklyPoints([]),
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
    const supabase = createSupabaseServiceClient();
    const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString();
    const [
      enrollmentResult,
      certificateResult,
      eventResult,
      profileResult,
      xpResult,
      analyticsResult,
      gamificationResult,
      progressResult,
    ] = await Promise.all([
      supabase
        .from("enrollments")
        .select(
          "id,course_id,status,enrolled_at,last_accessed_at,progress_summary",
        )
        .eq("user_id", uid)
        .in("status", ["active", "completed"])
        .order("last_accessed_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("certificates")
        .select("id,course_id,code,issued_at,metadata")
        .eq("user_id", uid)
        .order("issued_at", { ascending: false }),
      supabase
        .from("events")
        .select(
          "id,title,description,starts_at,ends_at,status,type,join_url,location",
        )
        .eq("is_public", true)
        .in("status", ["scheduled", "live"])
        .gte("starts_at", updatedAt)
        .order("starts_at")
        .limit(3),
      supabase
        .from("profiles")
        .select("profile_completion")
        .eq("id", uid)
        .maybeSingle(),
      supabase
        .from("xp_transactions")
        .select("amount,timestamp")
        .eq("user_id", uid)
        .gte("timestamp", sevenDaysAgo),
      (supabase as any)
        .from("analytics_events")
        .select("timestamp")
        .eq("user_id", uid)
        .gte("timestamp", sevenDaysAgo),
      supabase
        .from("gamification_profiles")
        .select("total_xp,level,current_streak,badges")
        .eq("user_id", uid)
        .maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("course_id,lesson_id,percent,status,updated_at")
        .eq("user_id", uid),
    ]);
    const error =
      enrollmentResult.error ||
      certificateResult.error ||
      eventResult.error ||
      profileResult.error ||
      xpResult.error ||
      analyticsResult.error ||
      gamificationResult.error ||
      progressResult.error;
    if (error) throw error;
    const courseIds = [
      ...new Set((enrollmentResult.data ?? []).map((row) => row.course_id)),
    ];
    const { data: courses, error: courseError } = courseIds.length
      ? await supabase
          .from("courses")
          .select("id,title,stats")
          .in("id", courseIds)
      : { data: [], error: null };
    if (courseError) throw courseError;
    const courseById = new Map(
      (courses ?? []).map((course) => [course.id, course]),
    );
    const progressByCourse = new Map<
      string,
      (typeof progressResult.data)[number][]
    >();
    for (const progress of progressResult.data ?? [])
      progressByCourse.set(progress.course_id, [
        ...(progressByCourse.get(progress.course_id) ?? []),
        progress,
      ]);
    empty.enrollments = (enrollmentResult.data ?? []).map((enrollment) => {
      const courseProgress = progressByCourse.get(enrollment.course_id) ?? [];
      const percent = courseProgress.length
        ? Math.round(
            courseProgress.reduce(
              (sum, item) => sum + numberValue(item.percent),
              0,
            ) / courseProgress.length,
          )
        : numberValue((enrollment.progress_summary as any)?.percent);
      const lastLessonId = [...courseProgress].sort((a, b) =>
        b.updated_at.localeCompare(a.updated_at),
      )[0]?.lesson_id;
      return {
        ...enrollment,
        courseId: enrollment.course_id,
        courseTitle: courseById.get(enrollment.course_id)?.title ?? "Curso",
        lastLessonId,
        progressSummary: {
          ...(enrollment.progress_summary as object),
          percent,
        },
      };
    });
    empty.lastCourse = empty.enrollments[0]
      ? {
          ...empty.enrollments[0],
          percent: empty.enrollments[0].progressSummary.percent,
        }
      : null;
    empty.certificates = certificateResult.data ?? [];
    empty.certificatesCount = empty.certificates.length;
    empty.events = (eventResult.data ?? []).map((event) => ({
      ...event,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      joinUrl: event.join_url,
    }));
    empty.profileCompletion = numberValue(
      profileResult.data?.profile_completion,
    );
    const activityRows = (xpResult.data ?? []).length
      ? (xpResult.data ?? [])
      : (analyticsResult.data ?? []).map((event: { timestamp: string }) => ({
          timestamp: event.timestamp,
          amount: 1,
        }));
    empty.weeklyActivity = weeklyPoints(activityRows);
    const game = gamificationResult.data;
    if (game) {
      const nextLevelXp = numberValue(game.level) * 1000;
      const baseXp = (numberValue(game.level) - 1) * 1000;
      empty.gamification = {
        totalXp: numberValue(game.total_xp),
        level: numberValue(game.level),
        currentStreak: numberValue(game.current_streak),
        badgesCount: game.badges?.length ?? 0,
        nextLevelXp,
        progressToNextLevel: Math.max(
          0,
          Math.min(100, ((numberValue(game.total_xp) - baseXp) * 100) / 1000),
        ),
      };
    }
    empty.availability = {
      enrollments: true,
      certificates: true,
      events: true,
      weeklyActivity: true,
      profileCompletion: true,
      gamification: true,
    };
    return { success: true, data: empty, source: dataSource, updatedAt };
  } catch (error: any) {
    console.error("buildStudentDashboardKPIs error:", error);
    return {
      success: false,
      error: error.message || "Failed to load student KPIs",
      source: dataSource,
      updatedAt,
    };
  }
}

export async function buildAdminDashboardKPIs(): Promise<
  KpiActionResult<AdminDashboardKpisData>
> {
  const updatedAt = new Date().toISOString();
  const dataSource = source([
    "profiles",
    "enrollments",
    "courses",
    "public_documents",
    "audit_logs",
  ]);
  try {
    const supabase = createSupabaseServiceClient();
    const [users, access, courses, documents, audits, recentUsers, pending] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("enrollments")
          .select("id", { count: "exact", head: true })
          .in("status", ["active", "completed"]),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase
          .from("public_documents")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("audit_logs")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id,display_name,email,role,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("enrollments")
          .select(
            "id,user_id,course_id,status,enrolled_at,profiles(display_name,email),courses(title)",
          )
          .eq("status", "pending_approval")
          .order("enrolled_at", { ascending: false })
          .limit(5),
      ]);
    const error =
      users.error ||
      access.error ||
      courses.error ||
      documents.error ||
      audits.error ||
      recentUsers.error ||
      pending.error;
    if (error) throw error;
    return {
      success: true,
      data: {
        totalUsers: users.count ?? 0,
        accessGranted: access.count ?? 0,
        totalCourses: courses.count ?? 0,
        libraryDocs: documents.count ?? 0,
        totalAuditLogs: audits.count ?? 0,
        recentUsers: recentUsers.data ?? [],
        pendingEnrollments: pending.data ?? [],
      },
      source: dataSource,
      updatedAt,
    };
  } catch (error: any) {
    console.error("buildAdminDashboardKPIs error:", error);
    return {
      success: false,
      error: error.message || "Failed to load admin KPIs",
      source: dataSource,
      updatedAt,
    };
  }
}

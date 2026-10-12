import "server-only";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type {
  AssessmentDoc,
  AssessmentSubmissionDoc,
} from "@/types/assessment";
import type { UserData } from "@/types/user";

async function staffScope() {
  const actor = await verifySession();
  if (!actor?.isActive || !actor.isStaff) throw new Error("Forbidden");
  const client = createSupabaseServiceClient();
  if (actor.isAdmin) return { client, courses: null as string[] | null };
  const { data, error } = await client.from("courses").select("id, team");
  if (error) throw error;
  const courses = (data ?? [])
    .filter((course) => {
      const team = course.team as Record<string, { role?: string }> | null;
      return ["author", "tutor", "admin"].includes(
        team?.[actor.uid]?.role ?? "",
      );
    })
    .map((course) => course.id);
  return { client, courses };
}

function mapSubmission(
  row: TableRow<"assessment_submissions">,
): AssessmentSubmissionDoc {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    userId: row.user_id ?? "",
    courseId: row.course_id,
    answers: Array.isArray(row.answers)
      ? (row.answers as unknown as AssessmentSubmissionDoc["answers"])
      : [],
    status: row.status,
    score: row.score,
    percentage: row.percentage,
    passed: row.passed,
    attemptNumber: row.attempt_number,
    feedback: row.feedback ?? undefined,
    gradedBy: row.graded_by ?? undefined,
    startedAt: row.started_at,
    submittedAt: row.submitted_at ?? undefined,
    gradedAt: row.graded_at ?? undefined,
    lastSavedAt: row.updated_at,
  };
}

function mapAssessment(row: TableRow<"assessments">): AssessmentDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id ?? undefined,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    questions: Array.isArray(row.questions)
      ? (row.questions as unknown as AssessmentDoc["questions"])
      : [],
    passingScore: row.passing_score,
    totalPoints: row.total_points,
    isRequired: false,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfile(row: TableRow<"profiles">): UserData {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    role: row.role,
    status: row.is_active ? "active" : "disabled",
    isAdmin: row.role === "admin",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login_at,
  } as unknown as UserData;
}

export async function readSubmissionMetrics() {
  const { client, courses } = await staffScope();
  if (courses?.length === 0) return { total: 0, pending: 0 };
  let totalQuery = client
    .from("assessment_submissions")
    .select("id", { count: "exact", head: true });
  let pendingQuery = client
    .from("assessment_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "submitted");
  if (courses) {
    totalQuery = totalQuery.in("course_id", courses);
    pendingQuery = pendingQuery.in("course_id", courses);
  }
  const [total, pending] = await Promise.all([totalQuery, pendingQuery]);
  if (total.error) throw total.error;
  if (pending.error) throw pending.error;
  return { total: total.count ?? 0, pending: pending.count ?? 0 };
}

export async function readSubmissionsPage({
  status,
  pageSize = 20,
  cursorId,
  courseId,
}: {
  status?: string;
  pageSize?: number;
  cursorId?: string;
  courseId?: string;
}): Promise<{
  submissions: AssessmentSubmissionDoc[];
  users: Record<string, UserData>;
  hasMore: boolean;
  lastVisible?: string;
}> {
  const { client, courses } = await staffScope();
  if (status && !["pending", "submitted", "graded"].includes(status))
    throw new Error("Invalid status");
  const size = Number.isFinite(pageSize)
    ? Math.min(Math.max(Math.floor(pageSize), 1), 100)
    : 20;
  if (courses?.length === 0)
    return { submissions: [], users: {}, hasMore: false };
  if (courseId && courses && !courses.includes(courseId))
    throw new Error("Forbidden");
  let query = client
    .from("assessment_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(size + 1);
  if (status)
    query = query.eq("status", status as "pending" | "submitted" | "graded");
  if (courseId) query = query.eq("course_id", courseId);
  if (courses) query = query.in("course_id", courses);
  if (cursorId) {
    if (!/^[0-9a-f-]{36}$/i.test(cursorId)) throw new Error("Invalid cursor");
    let cursorQuery = client
      .from("assessment_submissions")
      .select("id,created_at,course_id,status")
      .eq("id", cursorId);
    if (courses) cursorQuery = cursorQuery.in("course_id", courses);
    const { data: cursor, error } = await cursorQuery.maybeSingle();
    if (error) throw error;
    if (
      !cursor ||
      (status && cursor.status !== status) ||
      (courseId && cursor.course_id !== courseId)
    )
      throw new Error("Invalid cursor");
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  const visible = (data ?? []).slice(0, size);
  const submissions = visible.map(mapSubmission);
  const ids = [
    ...new Set(
      visible.map((row) => row.user_id).filter((id): id is string => !!id),
    ),
  ];
  const users: Record<string, UserData> = {};
  if (ids.length) {
    const profiles = await client
      .from("profiles")
      .select(
        "id,email,display_name,photo_url,role,is_active,created_at,updated_at,last_login_at",
      )
      .in("id", ids);
    if (profiles.error) throw profiles.error;
    for (const profile of profiles.data ?? [])
      users[profile.id] = mapProfile(profile as TableRow<"profiles">);
  }
  return {
    submissions,
    users,
    lastVisible: visible.at(-1)?.id,
    hasMore: (data?.length ?? 0) > size,
  };
}

export async function readSubmissionDetail(id: string) {
  const { client, courses } = await staffScope();
  let query = client.from("assessment_submissions").select("*").eq("id", id);
  if (courses) query = query.in("course_id", courses);
  const { data: row, error } = await query.maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const [profile, assessment] = await Promise.all([
    row.user_id
      ? client
          .from("profiles")
          .select(
            "id,email,display_name,photo_url,role,is_active,created_at,updated_at,last_login_at",
          )
          .eq("id", row.user_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    client
      .from("assessments")
      .select("*")
      .eq("id", row.assessment_id)
      .eq("course_id", row.course_id)
      .maybeSingle(),
  ]);
  if (profile.error) throw profile.error;
  if (assessment.error) throw assessment.error;
  return {
    submission: mapSubmission(row),
    user: profile.data
      ? mapProfile(profile.data as TableRow<"profiles">)
      : null,
    assessment: assessment.data ? mapAssessment(assessment.data) : null,
  };
}

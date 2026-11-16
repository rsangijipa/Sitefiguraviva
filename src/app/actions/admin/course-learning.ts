"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  contentReleaseSchema,
  readContentRelease,
  type ContentRelease,
} from "@/features/courses/domain/content-release";
import {
  buildCompletionReport,
  type CompletionReport,
} from "@/features/courses/domain/completion-report";

// Both variants declare both keys: the project's TS config does not narrow
// unions on `success`, so callers read `message` / `data` directly.
type Result<T> =
  | { success: true; data: T; message?: undefined }
  | { success: false; data?: undefined; message: string };

function validCourseId(courseId: unknown): courseId is string {
  return (
    typeof courseId === "string" && courseId.trim().length > 0 && courseId.length <= 200
  );
}

/** Current release rules plus the course's modules, for the editor tab. */
export async function getCourseReleaseAction(courseId: string): Promise<
  Result<{
    release: ContentRelease;
    modules: { id: string; title: string; isPublished: boolean }[];
  }>
> {
  await requireAdmin();
  if (!validCourseId(courseId)) return { success: false, message: "Curso inválido." };
  const supabase = createSupabaseServiceClient();
  const [{ data: course, error }, { data: modules, error: modulesError }] =
    await Promise.all([
      supabase.from("courses").select("details").eq("id", courseId).maybeSingle(),
      supabase
        .from("course_modules")
        .select("id,title,is_published")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true }),
    ]);
  if (error || modulesError || !course)
    return { success: false, message: "Não foi possível carregar o curso." };
  return {
    success: true,
    data: {
      release: readContentRelease(course.details),
      modules: (modules ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        isPublished: m.is_published,
      })),
    },
  };
}

/**
 * Saves only details.release, reading the current details on the server so
 * other fields (agenda, mediators, syllabus…) are never overwritten by a
 * stale copy in the browser.
 */
export async function updateCourseReleaseAction(
  courseId: string,
  input: unknown,
): Promise<Result<ContentRelease>> {
  await requireAdmin();
  if (!validCourseId(courseId)) return { success: false, message: "Curso inválido." };
  const parsed = contentReleaseSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Regras de liberação inválidas.",
    };

  const supabase = createSupabaseServiceClient();
  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_id", courseId);
  if (modulesError) return { success: false, message: "Não foi possível salvar." };
  const moduleIds = new Set((modules ?? []).map((m) => m.id));
  const release: ContentRelease = {
    mode: parsed.data.mode,
    moduleDates: Object.fromEntries(
      Object.entries(parsed.data.moduleDates).filter(([id]) => moduleIds.has(id)),
    ),
  };

  const { data: course, error } = await supabase
    .from("courses")
    .select("details")
    .eq("id", courseId)
    .maybeSingle();
  if (error || !course) return { success: false, message: "Curso não encontrado." };
  const details =
    course.details && typeof course.details === "object" && !Array.isArray(course.details)
      ? (course.details as Record<string, unknown>)
      : {};

  const { error: updateError } = await supabase
    .from("courses")
    .update({ details: { ...details, release } })
    .eq("id", courseId);
  if (updateError) return { success: false, message: "Não foi possível salvar." };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/portal/course/${courseId}`, "layout");
  return { success: true, data: release };
}

/** Students × lessons completion matrix (Moodle's activity completion report). */
export async function getCourseCompletionReportAction(
  courseId: string,
): Promise<Result<CompletionReport>> {
  await requireAdmin();
  if (!validCourseId(courseId)) return { success: false, message: "Curso inválido." };
  const supabase = createSupabaseServiceClient();
  const [modulesRes, lessonsRes, enrollmentsRes, progressRes] = await Promise.all([
    supabase
      .from("course_modules")
      .select("id,title,sort_order,is_published")
      .eq("course_id", courseId),
    supabase
      .from("lessons")
      .select("id,module_id,title,sort_order,is_published")
      .eq("course_id", courseId),
    supabase
      .from("enrollments")
      .select("user_id,user_name,status,enrolled_at")
      .eq("course_id", courseId),
    supabase
      .from("lesson_progress")
      .select("user_id,lesson_id,status,completed_at")
      .eq("course_id", courseId),
  ]);
  const failed = [modulesRes, lessonsRes, enrollmentsRes, progressRes].find(
    (res) => res.error,
  );
  if (failed) return { success: false, message: "Não foi possível montar o relatório." };

  const userIds = [
    ...new Set(
      (enrollmentsRes.data ?? [])
        .map((row) => row.user_id)
        .filter((id): id is string => !!id),
    ),
  ];
  const { data: profiles, error: profilesError } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id,display_name,email")
        .in("id", userIds)
    : { data: [], error: null };
  if (profilesError)
    return { success: false, message: "Não foi possível montar o relatório." };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return {
    success: true,
    data: buildCompletionReport({
      modules: (modulesRes.data ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        order: m.sort_order,
        isPublished: m.is_published,
      })),
      lessons: (lessonsRes.data ?? []).map((l) => ({
        id: l.id,
        moduleId: l.module_id,
        title: l.title,
        order: l.sort_order,
        isPublished: l.is_published,
      })),
      students: (enrollmentsRes.data ?? [])
        .filter((row) => !!row.user_id)
        .map((row) => {
          const profile = profileById.get(row.user_id as string);
          return {
            userId: row.user_id as string,
            name: profile?.display_name || row.user_name || "Aluno sem nome",
            email: profile?.email || "",
            status: row.status,
          };
        }),
      progress: (progressRes.data ?? [])
        .filter((row) => !!row.user_id)
        .map((row) => ({
          userId: row.user_id as string,
          lessonId: row.lesson_id,
          completed: row.status === "completed",
          completedAt: row.completed_at,
        })),
    }),
  };
}

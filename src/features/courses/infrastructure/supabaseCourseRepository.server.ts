import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type {
  CourseModuleRecord,
  CourseOutlineRecord,
  CourseRecord,
  LessonRecord,
} from "../domain/course.types";

type CourseRow = TableRow<"courses">;
type ModuleRow = TableRow<"course_modules">;
type LessonRow = TableRow<"lessons">;

function mapCourse(row: CourseRow): CourseRecord {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    instructorName: row.instructor_name,
    instructorTitle: row.instructor_title,
    workloadMinutes: row.workload_minutes,
    durationLabel: row.duration_label,
    level: row.level,
    category: row.category,
    isPublished: row.is_published,
    status: row.status,
    contentRevision: row.content_revision,
    billingType: row.billing_type,
    stripePriceId: row.stripe_price_id,
    stripeProductId: row.stripe_product_id,
    tags: row.tags,
    details: row.details,
    team: row.team,
    stats: row.stats,
    communityEnabled: row.community_enabled,
    certificateRules: row.certificate_rules,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapModule(row: ModuleRow): CourseModuleRecord {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    order: row.sort_order,
    isPublished: row.is_published,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLesson(row: LessonRow): LessonRecord {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description,
    order: row.sort_order,
    isPublished: row.is_published,
    slug: row.slug,
    type: row.type,
    durationMinutes: row.duration_minutes,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    blocks: row.blocks,
    isFreePreview: row.is_free_preview,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPublishedCourses(): Promise<CourseRecord[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCourse);
}

export async function getCourseById(
  courseId: string,
): Promise<CourseRecord | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCourse(data) : null;
}

export async function getCourseOutlineById(
  courseId: string,
): Promise<CourseOutlineRecord | null> {
  const supabase = createSupabaseServiceClient();

  const [
    { data: course, error: courseError },
    { data: modules, error: modulesError },
    { data: lessons, error: lessonsError },
  ] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
    supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true }),
  ]);

  if (courseError) throw courseError;
  if (modulesError) throw modulesError;
  if (lessonsError) throw lessonsError;
  if (!course) return null;

  const moduleRows = (modules ?? []) as ModuleRow[];
  const lessonRows = (lessons ?? []) as LessonRow[];
  const lessonGroups = new Map<string, LessonRecord[]>();
  for (const lesson of lessonRows) {
    const mapped = mapLesson(lesson);
    const group = lessonGroups.get(mapped.moduleId) ?? [];
    group.push(mapped);
    lessonGroups.set(mapped.moduleId, group);
  }

  return {
    course: mapCourse(course),
    modules: moduleRows.map((moduleRow) => ({
      ...mapModule(moduleRow),
      lessons: lessonGroups.get(moduleRow.id) ?? [],
    })),
  };
}

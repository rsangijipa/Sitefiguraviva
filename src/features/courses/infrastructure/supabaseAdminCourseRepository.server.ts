import "server-only";

import { randomUUID } from "crypto";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { deleteStorageObject } from "@/infrastructure/supabase/storage.server";
import type {
  CourseStatus,
  EnrollmentStatus,
  Json,
  LessonType,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/infrastructure/supabase/database.types";
import type {
  CommunityThreadDoc,
  CourseDoc,
  EnrollmentDoc,
  LessonDoc,
  MaterialDoc,
  ModuleDoc,
} from "@/types/lms";

type MutablePayload = Record<string, any>;
type CourseRow = TableRow<"courses">;
type ModuleRow = TableRow<"course_modules">;
type LessonRow = TableRow<"lessons">;
type MaterialRow = TableRow<"lesson_materials">;
type EnrollmentRow = TableRow<"enrollments">;
type ThreadRow = TableRow<"community_threads">;
type MaterialType = "pdf" | "link" | "archive";

function timestampFromIso(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  };
}

function compactObject<T extends MutablePayload>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

function asJson(value: unknown, fallback: Json): Json {
  if (value === undefined) return fallback;
  return value as Json;
}

function getString(payload: MutablePayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}

function getBoolean(payload: MutablePayload, key: string): boolean | undefined {
  const value = payload[key];
  return typeof value === "boolean" ? value : undefined;
}

function getNumber(payload: MutablePayload, key: string): number | undefined {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getCourseStatus(payload: MutablePayload): CourseStatus | undefined {
  const value = getString(payload, "status");
  return value ? (value as CourseStatus) : undefined;
}

function getLessonType(payload: MutablePayload): LessonType | undefined {
  const value = getString(payload, "type");
  return value ? (value as LessonType) : undefined;
}

function getMaterialType(payload: MutablePayload): MaterialType | undefined {
  const value = getString(payload, "type");
  if (value === "pdf" || value === "link" || value === "archive") {
    return value;
  }
  return undefined;
}

function mapCourseRow(row: CourseRow): CourseDoc {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || undefined,
    slug: row.slug || undefined,
    description: row.description || undefined,
    coverImage: row.cover_image_url || undefined,
    image: row.image_url || row.cover_image_url || undefined,
    thumbnail: row.thumbnail_url || undefined,
    instructor: row.instructor_name || undefined,
    instructorName: row.instructor_name || undefined,
    instructorTitle: row.instructor_title || undefined,
    workload: row.workload_minutes || undefined,
    duration: row.duration_label || undefined,
    level: row.level || undefined,
    category: row.category || undefined,
    isPublished: row.is_published,
    status: row.status,
    contentRevision: row.content_revision,
    billing: {
      type: row.billing_type,
      priceId: row.stripe_price_id || undefined,
      productId: row.stripe_product_id || undefined,
    },
    tags: row.tags,
    details: row.details as CourseDoc["details"],
    team: row.team as CourseDoc["team"],
    stats: row.stats as CourseDoc["stats"],
    communityEnabled: row.community_enabled,
    certificateRules: row.certificate_rules as CourseDoc["certificateRules"],
    createdAt: timestampFromIso(row.created_at) as CourseDoc["createdAt"],
    updatedAt: timestampFromIso(row.updated_at) as CourseDoc["updatedAt"],
  };
}

function mapModuleRow(row: ModuleRow): ModuleDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description || undefined,
    order: row.sort_order,
    isPublished: row.is_published,
    slug: row.slug || undefined,
    createdAt: timestampFromIso(row.created_at) as ModuleDoc["createdAt"],
    updatedAt: timestampFromIso(row.updated_at) as ModuleDoc["updatedAt"],
  };
}

function mapLessonRow(row: LessonRow): LessonDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description || undefined,
    order: row.sort_order,
    isPublished: row.is_published,
    slug: row.slug || undefined,
    type: row.type,
    duration: row.duration_minutes || undefined,
    videoUrl: row.video_url || undefined,
    thumbnail: row.thumbnail_url || undefined,
    blocks: Array.isArray(row.blocks)
      ? (row.blocks as unknown as LessonDoc["blocks"])
      : undefined,
    isFreePreview: row.is_free_preview,
    createdAt: timestampFromIso(row.created_at) as LessonDoc["createdAt"],
    updatedAt: timestampFromIso(row.updated_at) as LessonDoc["updatedAt"],
  };
}

function mapMaterialRow(row: MaterialRow): MaterialDoc {
  const legacyPayload = row.legacy_payload as Record<string, unknown>;
  const filePath =
    typeof legacyPayload?.filePath === "string"
      ? legacyPayload.filePath
      : typeof legacyPayload?.file_path === "string"
        ? legacyPayload.file_path
        : undefined;

  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    type: row.type,
    url: row.url,
    description: row.description || undefined,
    isPublished: row.is_published,
    downloadCount: row.download_count,
    filePath,
    createdAt: timestampFromIso(row.created_at) as MaterialDoc["createdAt"],
  };
}

function mapEnrollmentRow(row: EnrollmentRow): EnrollmentDoc & { id: string } {
  return {
    id: row.id,
    uid: row.legacy_firebase_uid || row.user_id || "",
    userId: row.user_id || row.legacy_firebase_uid || undefined,
    courseId: row.course_id,
    userName: row.user_name || undefined,
    status: row.status,
    paymentStatus: row.payment_status || undefined,
    subscriptionId: row.subscription_id || undefined,
    enrolledAt: timestampFromIso(
      row.enrolled_at,
    ) as EnrollmentDoc["enrolledAt"],
    paidAt: timestampFromIso(row.paid_at) as EnrollmentDoc["paidAt"],
    paymentMethod: row.payment_method || undefined,
    sourceRef: row.source_ref || undefined,
    accessUntil: timestampFromIso(
      row.access_until,
    ) as EnrollmentDoc["accessUntil"],
    approvedBy: row.approved_by || undefined,
    approvedAt: timestampFromIso(
      row.approved_at,
    ) as EnrollmentDoc["approvedAt"],
    rejectionReason: row.rejection_reason || undefined,
    courseVersionAtEnrollment: row.course_version_at_enrollment || undefined,
    courseSnapshotAtEnrollment:
      row.course_snapshot_at_enrollment as EnrollmentDoc["courseSnapshotAtEnrollment"],
    completedAt: timestampFromIso(
      row.completed_at,
    ) as EnrollmentDoc["completedAt"],
    lastAccessedAt: timestampFromIso(
      row.last_accessed_at,
    ) as EnrollmentDoc["lastAccessedAt"],
    progressSummary: row.progress_summary as EnrollmentDoc["progressSummary"],
    createdAt: timestampFromIso(row.created_at) as EnrollmentDoc["createdAt"],
    updatedAt: timestampFromIso(row.updated_at) as EnrollmentDoc["updatedAt"],
  };
}

function mapThreadRow(row: ThreadRow): CommunityThreadDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    content: row.content,
    authorId: row.legacy_author_firebase_uid || row.author_id || "",
    authorName: row.author_name,
    authorAvatar: row.author_avatar_url || undefined,
    replyCount: row.reply_count,
    likeCount: row.like_count,
    viewCount: row.view_count,
    isPinned: row.is_pinned,
    isLocked: row.is_locked,
    isDeleted: row.is_deleted,
    lastReplyAt: timestampFromIso(
      row.last_reply_at,
    ) as CommunityThreadDoc["lastReplyAt"],
    createdAt: timestampFromIso(
      row.created_at,
    ) as CommunityThreadDoc["createdAt"],
    updatedAt: timestampFromIso(
      row.updated_at,
    ) as CommunityThreadDoc["updatedAt"],
  };
}

function coursePayloadToInsert(
  data: Partial<CourseDoc>,
): TableInsert<"courses"> {
  const payload = data as MutablePayload;
  const coverImage =
    getString(payload, "coverImage") || getString(payload, "image");
  const billing = payload.billing || {};

  return compactObject({
    id: randomUUID(),
    title: getString(payload, "title") || "Novo curso",
    subtitle: getString(payload, "subtitle") || "",
    slug: getString(payload, "slug"),
    description: getString(payload, "description") || "",
    cover_image_url: coverImage || "",
    image_url: coverImage || "",
    thumbnail_url: getString(payload, "thumbnail"),
    instructor_name:
      getString(payload, "instructorName") ||
      getString(payload, "instructor") ||
      "",
    instructor_title: getString(payload, "instructorTitle"),
    workload_minutes: getNumber(payload, "workload"),
    duration_label: getString(payload, "duration"),
    level: getString(payload, "level"),
    category: getString(payload, "category"),
    is_published: getBoolean(payload, "isPublished") ?? false,
    status: getCourseStatus(payload) || "draft",
    content_revision: getNumber(payload, "contentRevision") || 1,
    billing_type: billing.type || "free",
    stripe_price_id: billing.priceId,
    stripe_product_id: billing.productId,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    details: asJson(payload.details, {}),
    team: asJson(payload.team, {}),
    stats: asJson(payload.stats, { lessonsCount: 0, studentsCount: 0 }),
    community_enabled: getBoolean(payload, "communityEnabled") ?? false,
    certificate_rules: asJson(payload.certificateRules, {
      enabled: false,
      minProgressPercent: 100,
    }),
    legacy_payload: asJson(payload, {}),
  } as TableInsert<"courses">);
}

function coursePayloadToUpdate(
  data: Partial<CourseDoc>,
): TableUpdate<"courses"> {
  const payload = data as MutablePayload;
  const coverImage =
    getString(payload, "coverImage") || getString(payload, "image");
  const billing = payload.billing || {};

  return compactObject({
    title: getString(payload, "title"),
    subtitle: getString(payload, "subtitle"),
    slug: getString(payload, "slug"),
    description: getString(payload, "description"),
    cover_image_url: coverImage,
    image_url: coverImage,
    thumbnail_url: getString(payload, "thumbnail"),
    instructor_name:
      getString(payload, "instructorName") || getString(payload, "instructor"),
    instructor_title: getString(payload, "instructorTitle"),
    workload_minutes: getNumber(payload, "workload"),
    duration_label: getString(payload, "duration"),
    level: getString(payload, "level"),
    category: getString(payload, "category"),
    is_published: getBoolean(payload, "isPublished"),
    status: getCourseStatus(payload),
    content_revision: getNumber(payload, "contentRevision"),
    billing_type: billing.type,
    stripe_price_id: billing.priceId,
    stripe_product_id: billing.productId,
    tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    details: payload.details as Json | undefined,
    team: payload.team as Json | undefined,
    stats: payload.stats as Json | undefined,
    community_enabled: getBoolean(payload, "communityEnabled"),
    certificate_rules: payload.certificateRules as Json | undefined,
  });
}

export async function listAdminCourses(): Promise<CourseDoc[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCourseRow);
}

export async function getAdminCourse(
  courseId: string,
): Promise<CourseDoc | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCourseRow(data) : null;
}

export async function createAdminCourse(
  data: Partial<CourseDoc>,
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const payload = coursePayloadToInsert(data);

  const { data: inserted, error } = await supabase
    .from("courses")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return inserted.id;
}

export async function updateAdminCourse(
  courseId: string,
  data: Partial<CourseDoc>,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("courses")
    .update(coursePayloadToUpdate(data))
    .eq("id", courseId);

  if (error) throw error;
}

export async function deleteAdminCourse(courseId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw error;
}

export async function listAdminModules(courseId: string): Promise<ModuleDoc[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapModuleRow);
}

export async function createAdminModule(
  courseId: string,
  title: string,
  order: number,
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const id = randomUUID();
  const { error } = await supabase.from("course_modules").insert({
    id,
    course_id: courseId,
    title,
    sort_order: order,
    is_published: false,
  });

  if (error) throw error;
  return id;
}

export async function updateAdminModule(
  moduleId: string,
  data: Partial<ModuleDoc>,
): Promise<void> {
  const payload = data as MutablePayload;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("course_modules")
    .update(
      compactObject({
        title: getString(payload, "title"),
        description: getString(payload, "description"),
        sort_order: getNumber(payload, "order"),
        is_published: getBoolean(payload, "isPublished"),
        slug: getString(payload, "slug"),
      }),
    )
    .eq("id", moduleId);

  if (error) throw error;
}

export async function deleteAdminModule(moduleId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId);

  if (error) throw error;
}

export async function listAdminLessons(
  courseId: string,
  moduleId: string,
): Promise<LessonDoc[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapLessonRow);
}

export async function createAdminLesson(
  courseId: string,
  moduleId: string,
  title: string,
  order: number,
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const id = randomUUID();
  const { error } = await supabase.from("lessons").insert({
    id,
    course_id: courseId,
    module_id: moduleId,
    title,
    sort_order: order,
    type: "text",
    is_published: false,
  });

  if (error) throw error;
  return id;
}

export async function updateAdminLesson(
  lessonId: string,
  data: Partial<LessonDoc>,
): Promise<void> {
  const payload = data as MutablePayload;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("lessons")
    .update(
      compactObject({
        title: getString(payload, "title"),
        description: getString(payload, "description"),
        sort_order: getNumber(payload, "order"),
        is_published: getBoolean(payload, "isPublished"),
        slug: getString(payload, "slug"),
        type: getLessonType(payload),
        duration_minutes: getNumber(payload, "duration"),
        video_url: getString(payload, "videoUrl"),
        thumbnail_url: getString(payload, "thumbnail"),
        blocks: payload.blocks as Json | undefined,
        is_free_preview: getBoolean(payload, "isFreePreview"),
      }),
    )
    .eq("id", lessonId);

  if (error) throw error;
}

export async function deleteAdminLesson(lessonId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw error;
}

export async function listAdminMaterials(
  courseId: string,
): Promise<MaterialDoc[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lesson_materials")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapMaterialRow);
}

export async function addAdminMaterial(
  courseId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const payload = data as MutablePayload;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("lesson_materials").insert({
    id: randomUUID(),
    course_id: courseId,
    title: getString(payload, "title") || "Material",
    type: getMaterialType(payload) || "link",
    url: getString(payload, "url") || "",
    description: getString(payload, "description"),
    is_published: getBoolean(payload, "isPublished") ?? true,
    download_count: 0,
    legacy_payload: asJson(payload, {}),
  });

  if (error) throw error;
}

export async function updateAdminMaterial(
  materialId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const payload = data as MutablePayload;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("lesson_materials")
    .update(
      compactObject({
        title: getString(payload, "title"),
        type: getMaterialType(payload),
        url: getString(payload, "url"),
        description: getString(payload, "description"),
        is_published: getBoolean(payload, "isPublished"),
      }),
    )
    .eq("id", materialId);

  if (error) throw error;
}

export async function deleteAdminMaterial(
  materialId: string,
  filePath?: string,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  let resolvedFilePath = filePath;

  if (!resolvedFilePath) {
    const { data } = await supabase
      .from("lesson_materials")
      .select("legacy_payload")
      .eq("id", materialId)
      .maybeSingle();

    const legacyPayload = data?.legacy_payload as Record<string, unknown>;
    resolvedFilePath =
      typeof legacyPayload?.filePath === "string"
        ? legacyPayload.filePath
        : typeof legacyPayload?.file_path === "string"
          ? legacyPayload.file_path
          : undefined;
  }

  if (resolvedFilePath) {
    await deleteStorageObject({ bucket: "uploads", path: resolvedFilePath });
  }

  const { error } = await supabase
    .from("lesson_materials")
    .delete()
    .eq("id", materialId);
  if (error) throw error;
}

export async function listAdminCourseEnrollments(
  courseId: string,
): Promise<Array<EnrollmentDoc & { id: string }>> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapEnrollmentRow);
}

export async function toggleAdminEnrollmentStatus(
  enrollmentId: string,
  currentStatus: string,
): Promise<void> {
  const nextStatus: EnrollmentStatus =
    currentStatus === "active" ? "canceled" : "active";
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ status: nextStatus })
    .eq("id", enrollmentId);

  if (error) throw error;
}

export async function listAdminCourseThreads(
  courseId: string,
): Promise<CommunityThreadDoc[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("community_threads")
    .select("*")
    .eq("course_id", courseId)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapThreadRow);
}

export async function updateAdminThread(
  threadId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  const payload = updates as MutablePayload;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("community_threads")
    .update(
      compactObject({
        title: getString(payload, "title"),
        content: getString(payload, "content"),
        is_pinned: getBoolean(payload, "isPinned"),
        is_locked: getBoolean(payload, "isLocked"),
        is_deleted: getBoolean(payload, "isDeleted"),
      }),
    )
    .eq("id", threadId);

  if (error) throw error;
}

export async function deleteAdminThread(threadId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("community_threads")
    .update({ is_deleted: true })
    .eq("id", threadId);

  if (error) throw error;
}

export async function syncAdminLessonsCount(courseId: string): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const { count, error } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("is_published", true);

  if (error) throw error;

  const totalPublished = count ?? 0;
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("stats")
    .eq("id", courseId)
    .single();

  if (courseError) throw courseError;

  const stats = {
    ...((course.stats || {}) as Record<string, unknown>),
    lessonsCount: totalPublished,
  };

  const { error: updateError } = await supabase
    .from("courses")
    .update({ stats })
    .eq("id", courseId);

  if (updateError) throw updateError;
  return totalPublished;
}

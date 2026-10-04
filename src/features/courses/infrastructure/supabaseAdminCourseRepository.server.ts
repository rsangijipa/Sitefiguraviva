import "server-only";
import { validateCommercialFields } from "@/features/courses/domain/course-offer";

import { randomUUID } from "crypto";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  COURSE_MATERIAL_BUCKET,
  materialDownloadUrl,
  safeExternalMaterialUrl,
  validatePrivateMaterialPath,
  MAX_COURSE_MATERIAL_BYTES,
} from "@/lib/course-materials";
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

function mapCourseRow(row: CourseRow): CourseDoc {
  const legacy = (row.legacy_payload || {}) as Record<string, unknown>;
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
    pixPriceCents: row.pix_price_cents,
    totalPriceCents: row.total_price_cents,
    installments: row.installment_count,
    billing: {
      type: row.billing_type,
      priceId: row.stripe_price_id || undefined,
      productId: row.stripe_product_id || undefined,
    },
    tags: row.tags,
    details: row.details as CourseDoc["details"],
    syllabus: Array.isArray((row.details as any)?.syllabus)
      ? (row.details as any).syllabus
      : Array.isArray(legacy.syllabus)
        ? legacy.syllabus
        : [],
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
    url: materialDownloadUrl(row.id),
    description: row.description || undefined,
    isPublished: row.is_published,
    downloadCount: row.download_count,
    filePath: row.storage_path || filePath,
    fileBucket: row.storage_bucket || undefined,
    visibility: row.visibility,
    moduleId: row.module_id || undefined,
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
  validateCommercialFields(data);
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
    pix_price_cents: payload.pixPriceCents ?? null,
    total_price_cents: payload.totalPriceCents ?? null,
    installment_count: payload.installments ?? null,
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
  validateCommercialFields(data);
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
    pix_price_cents: payload.pixPriceCents,
    total_price_cents: payload.totalPriceCents,
    installment_count: payload.installments,
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
  const { data: updated, error } = await supabase
    .from("courses")
    .update(coursePayloadToUpdate(data))
    .eq("id", courseId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!updated) throw new Error("Curso não encontrado.");
}

/**
 * The revision is the canonical content-version used by enrollments and
 * certificates.  It is incremented in Postgres so concurrent admin edits
 * cannot overwrite each other with a stale client-side number.
 */
export async function bumpAdminCourseRevision(
  courseId: string,
): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("bump_course_content_revision", {
    p_course_id: courseId,
  });

  if (error) throw error;
  if (typeof data !== "number")
    throw new Error("Course revision was not returned.");
  return data;
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

async function validateMaterial(courseId: string, payload: MutablePayload) {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  if (!title || title.length > 200)
    throw new Error("Informe um título de até 200 caracteres.");
  const visibility = payload.visibility ?? "enrolled";
  if (!["enrolled", "after_completion", "team_only"].includes(visibility))
    throw new Error("Visibilidade inválida.");
  if (
    payload.isPublished !== undefined &&
    typeof payload.isPublished !== "boolean"
  )
    throw new Error("Publicação inválida.");
  let url = "",
    bucket: string | null = null,
    path: string | null = null;
  if (payload.type === "pdf") {
    if (
      payload.fileBucket !== COURSE_MATERIAL_BUCKET ||
      !validatePrivateMaterialPath(courseId, payload.filePath)
    )
      throw new Error("Envie o PDF para o armazenamento privado deste curso.");
    bucket = COURSE_MATERIAL_BUCKET;
    path = payload.filePath;
    const folder = path!.slice(0, path!.lastIndexOf("/")),
      name = path!.slice(path!.lastIndexOf("/") + 1);
    const { data, error } = await createSupabaseServiceClient()
      .storage.from(bucket)
      .list(folder, { search: name, limit: 2 });
    const object = data?.find((item) => item.name === name);
    if (
      error ||
      !object ||
      object.metadata?.mimetype !== "application/pdf" ||
      !Number.isFinite(object.metadata?.size) ||
      object.metadata.size <= 0 ||
      object.metadata.size > MAX_COURSE_MATERIAL_BYTES
    )
      throw new Error("PDF privado não encontrado ou inválido.");
  } else if (payload.type === "link") {
    url = safeExternalMaterialUrl(payload.url);
  } else throw new Error("Tipo de material não suportado.");
  const moduleId =
    typeof payload.moduleId === "string" && payload.moduleId
      ? payload.moduleId
      : null;
  return {
    title,
    type: payload.type as "pdf" | "link",
    url,
    storage_bucket: bucket,
    storage_path: path,
    visibility: visibility as MaterialRow["visibility"],
    module_id: moduleId,
    description:
      typeof payload.description === "string"
        ? payload.description.slice(0, 2000)
        : null,
    is_published: payload.isPublished ?? true,
  };
}
export async function addAdminMaterial(
  courseId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const fields = await validateMaterial(courseId, data);
  const { error } = await createSupabaseServiceClient()
    .from("lesson_materials")
    .insert({
      id: randomUUID(),
      course_id: courseId,
      ...fields,
      download_count: 0,
      legacy_payload: {},
    });
  if (error) throw error;
}
export async function updateAdminMaterial(
  courseId: string,
  materialId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = createSupabaseServiceClient();
  const { data: row, error: readError } = await db
    .from("lesson_materials")
    .select("*")
    .eq("id", materialId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (readError) throw readError;
  if (!row) throw new Error("Material não encontrado neste curso.");
  const fields = await validateMaterial(courseId, {
    title: row.title,
    type: row.type,
    url: row.url,
    description: row.description,
    visibility: row.visibility,
    moduleId: row.module_id,
    isPublished: row.is_published,
    fileBucket: row.storage_bucket,
    filePath: row.storage_path,
    ...data,
  });
  const { data: updated, error } = await db
    .from("lesson_materials")
    .update(fields)
    .eq("id", materialId)
    .eq("course_id", courseId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!updated) throw new Error("Material não encontrado neste curso.");
}
export async function deleteAdminMaterial(
  courseId: string,
  materialId: string,
): Promise<void> {
  // Storage objects may be shared or referenced by history; cleanup requires a separate inventory.
  const { data, error } = await createSupabaseServiceClient()
    .from("lesson_materials")
    .delete()
    .eq("id", materialId)
    .eq("course_id", courseId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Material não encontrado neste curso.");
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

export async function getAdminPublishingSnapshot(courseId: string): Promise<{
  course: CourseDoc | null;
  modules: ModuleDoc[];
  lessons: LessonDoc[];
}> {
  const [course, modules] = await Promise.all([
    getAdminCourse(courseId),
    listAdminModules(courseId),
  ]);
  const lessonGroups = await Promise.all(
    modules.map((module) => listAdminLessons(courseId, module.id)),
  );
  return { course, modules, lessons: lessonGroups.flat() };
}

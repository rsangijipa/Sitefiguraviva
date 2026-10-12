import {
  PUBLIC_COURSE_COLUMNS,
  PUBLIC_POST_COLUMNS,
  PUBLIC_GALLERY_COLUMNS,
  PUBLIC_TEAM_COLUMNS,
} from "./public-content-columns";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { getCourseMediators } from "@/utils/mediators";
import type { Json, TableRow } from "@/infrastructure/supabase/database.types";

export type ContentKind =
  | "courses"
  | "posts"
  | "gallery"
  | "publicGallery"
  | "publicLibrary"
  | "team"
  | "team_members";

export type ContentRecord = {
  id: string;
  title: string;
  isPublished: boolean;
  [key: string]: unknown;
};

type ListContentOptions = {
  publishedOnly?: boolean;
};

function jsonObject(value: Json): Record<string, unknown> {
  return value && !Array.isArray(value) && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

/** Only editorial strings can cross the public hydration boundary. */
function editorialText(
  source: Record<string, unknown>,
  keys: readonly string[],
) {
  return Object.fromEntries(
    keys.flatMap((key) =>
      typeof source[key] === "string" ? [[key, source[key]]] : [],
    ),
  );
}
function editorialList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
function publicCourseDetails(source: Record<string, unknown>) {
  const details: Record<string, unknown> = editorialText(source, [
    "intro",
    "location",
    "date",
    "frequency",
  ]);
  for (const key of ["format", "schedule"]) {
    if (typeof source[key] === "string") details[key] = source[key];
    else if (Array.isArray(source[key]))
      details[key] = editorialList(source[key]);
  }
  if (Array.isArray(source.syllabus))
    details.syllabus = editorialList(source.syllabus);
  return details;
}

export function mapPublicCourse(row: TableRow<"courses">): ContentRecord {
  const legacy = jsonObject(row.legacy_payload);
  const details = jsonObject(row.details);
  const legacyImage =
    typeof legacy.image === "string"
      ? legacy.image
      : typeof legacy.coverImage === "string"
        ? legacy.coverImage
        : null;
  const image =
    row.cover_image_url ??
    row.image_url ??
    row.thumbnail_url ??
    legacyImage ??
    null;
  const legacyImages = Array.isArray(legacy.images)
    ? legacy.images.filter(
        (candidate): candidate is string =>
          typeof candidate === "string" && candidate.length > 0,
      )
    : [];
  const images = [...new Set(image ? [image, ...legacyImages] : legacyImages)];

  return {
    ...editorialText(legacy, [
      "modality",
      "duration",
      "workload",
      "location",
      "link",
    ]),
    id: row.id,
    title: row.title ?? "",
    subtitle: row.subtitle,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    image,
    coverImage: row.cover_image_url ?? legacyImage ?? image,
    images,
    instructorName: row.instructor_name,
    instructorTitle: row.instructor_title,
    workloadMinutes: row.workload_minutes,
    durationLabel: row.duration_label,
    level: row.level,
    category: row.category,
    isPublished: row.is_published,
    status: row.status,
    enrollmentOpen: row.status === "open",
    contentRevision: row.content_revision,
    billingType: row.billing_type,
    pixPriceCents: row.pix_price_cents ?? null,
    totalPriceCents: row.total_price_cents ?? null,
    installments: row.installment_count ?? null,
    stripePriceId: row.stripe_price_id,
    stripeProductId: row.stripe_product_id,
    tags: row.tags,
    details: publicCourseDetails(details),
    mediators: getCourseMediators(
      row.details,
      legacy,
      row.team,
      (
        row as TableRow<"courses"> & {
          course_mediators?: { mediator: unknown }[];
        }
      ).course_mediators,
    ),
    date:
      typeof details.date === "string"
        ? details.date
        : typeof legacy.date === "string"
          ? legacy.date
          : row.duration_label,
    frequency:
      typeof details.frequency === "string"
        ? details.frequency
        : typeof legacy.frequency === "string"
          ? legacy.frequency
          : null,
    syllabus: Array.isArray(details.syllabus)
      ? editorialList(details.syllabus)
      : Array.isArray(legacy.syllabus)
        ? editorialList(legacy.syllabus)
        : [],
    stats: row.stats,
    communityEnabled: row.community_enabled,
    certificateRules: row.certificate_rules,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

export function mapPublicPost(row: TableRow<"posts">): ContentRecord {
  return {
    ...editorialText(jsonObject(row.legacy_payload), [
      "author",
      "authorImage",
      "date",
      "readingTime",
      "category",
    ]),
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    content: row.content,
    type: row.type,
    image: row.image_url,
    imageUrl: row.image_url,
    externalUrl: row.external_url,
    pdfUrl: row.pdf_url,
    tags: row.tags,
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

function mapGalleryItem(row: TableRow<"gallery_items">): ContentRecord {
  return {
    id: row.id,
    src: row.image_url,
    url: row.image_url,
    title: row.title,
    caption: row.caption,
    tags: row.tags,
    width: row.width,
    height: row.height,
    isPublished: row.is_published,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

function mapTeamMember(row: TableRow<"team_members">): ContentRecord {
  return {
    id: row.id,
    title: row.name,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image: row.image_url,
    imageUrl: row.image_url,
    order: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

export async function listContent(
  kind: ContentKind,
  { publishedOnly = true }: ListContentOptions = {},
): Promise<ContentRecord[]> {
  const supabase = createSupabaseBrowserClient();

  if (kind === "courses") {
    let query = supabase.from("courses").select(PUBLIC_COURSE_COLUMNS);
    if (publishedOnly) {
      query = query.eq("is_published", true).in("status", ["open", "closed"]);
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapPublicCourse);
  }

  if (kind === "posts" || kind === "publicLibrary") {
    let query = supabase.from("posts").select(PUBLIC_POST_COLUMNS);
    if (publishedOnly) query = query.eq("is_published", true);
    if (kind === "publicLibrary") query = query.eq("type", "library");
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapPublicPost);
  }

  if (kind === "gallery" || kind === "publicGallery") {
    let query = supabase.from("gallery_items").select(PUBLIC_GALLERY_COLUMNS);
    if (publishedOnly) query = query.eq("is_published", true);
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapGalleryItem);
  }

  let query = supabase.from("team_members").select(PUBLIC_TEAM_COLUMNS);
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query.order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapTeamMember);
}

export function listPublishedContent(
  kind: ContentKind,
): Promise<ContentRecord[]> {
  return listContent(kind, { publishedOnly: true });
}

export function listPublishedCourses(): Promise<ContentRecord[]> {
  return listPublishedContent("courses");
}

export async function getPublicPageContent(
  key: string,
): Promise<Record<string, unknown> | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("public_pages")
    .select("content")
    .eq("key", key)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? jsonObject(data.content) : null;
}

export async function getPublishedCourseByField(
  field: "id" | "slug",
  value: string,
): Promise<ContentRecord | null> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("courses")
    .select(PUBLIC_COURSE_COLUMNS)
    .eq("is_published", true)
    .in("status", ["open", "closed"])
    .eq(field, value)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPublicCourse(data) : null;
}

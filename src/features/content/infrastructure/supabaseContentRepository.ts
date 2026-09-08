import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
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

function mapCourse(row: TableRow<"courses">): ContentRecord {
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
    ...legacy,
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
    stripePriceId: row.stripe_price_id,
    stripeProductId: row.stripe_product_id,
    tags: row.tags,
    details: row.details,
    team: row.team,
    mediators: legacy.mediators ?? (Array.isArray(row.team) ? row.team : []),
    date: legacy.date ?? details.date ?? row.duration_label,
    frequency: legacy.frequency ?? details.frequency ?? null,
    syllabus: Array.isArray(details.syllabus)
      ? details.syllabus
      : Array.isArray(legacy.syllabus)
        ? legacy.syllabus
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

function mapPost(row: TableRow<"posts">): ContentRecord {
  return {
    ...jsonObject(row.legacy_payload),
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
    ...jsonObject(row.legacy_payload),
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
    ...jsonObject(row.legacy_payload),
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
    let query = supabase.from("courses").select("*");
    if (publishedOnly) {
      query = query.eq("is_published", true).eq("status", "open");
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapCourse);
  }

  if (kind === "posts" || kind === "publicLibrary") {
    let query = supabase.from("posts").select("*");
    if (publishedOnly) query = query.eq("is_published", true);
    if (kind === "publicLibrary") query = query.eq("type", "library");
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapPost);
  }

  if (kind === "gallery" || kind === "publicGallery") {
    let query = supabase.from("gallery_items").select("*");
    if (publishedOnly) query = query.eq("is_published", true);
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapGalleryItem);
  }

  let query = supabase.from("team_members").select("*");
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

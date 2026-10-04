import { MetadataRoute } from "next";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getPublicSiteOrigin, publicContentPath } from "@/lib/public-site-url";

export const revalidate = 300;

type Entry = { id: string; slug?: string | null; updated_at?: string | null };

// Fail independently: an unavailable catalog must not hide the institutional pages.
async function publishedEntries(table: "courses" | "posts"): Promise<Entry[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const query =
      table === "courses"
        ? supabase
            .from("courses")
            .select("id, slug, updated_at")
            .eq("is_published", true)
            .in("status", ["open", "closed"])
        : supabase
            .from("posts")
            .select("id, slug, updated_at")
            .eq("is_published", true);
    const { data, error } = await query.abortSignal(AbortSignal.timeout(1500));
    return error ? [] : (data ?? []);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicSiteOrigin();
  const [courses, posts] = await Promise.all([
    publishedEntries("courses"),
    publishedEntries("posts"),
  ]);
  const contentRoutes = (entries: Entry[], kind: "curso" | "blog") =>
    entries.map((entry) => {
      const date = entry.updated_at ? new Date(entry.updated_at) : undefined;
      return {
        url: baseUrl + publicContentPath(kind, entry),
        ...(date && Number.isFinite(date.getTime())
          ? { lastModified: date }
          : {}),
        changeFrequency:
          kind === "curso" ? ("weekly" as const) : ("monthly" as const),
        priority: kind === "curso" ? 0.8 : 0.6,
      };
    });
  const routes = [
    "",
    "/instituto",
    "/instituto/fundadora",
    "/formacoes",
    "/recursos",
    "/public-library",
    "/public-gallery",
    "/blog",
    "/privacidade",
    "/termos",
  ].map((route) => ({
    url: baseUrl + route,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));
  return [
    ...routes,
    ...contentRoutes(courses, "curso"),
    ...contentRoutes(posts, "blog"),
  ];
}

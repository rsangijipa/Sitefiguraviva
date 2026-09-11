import { MetadataRoute } from "next";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://figuraviva.com.br";

  const supabase = createSupabaseServiceClient();
  const safeQuery = async (query: PromiseLike<{ data: any[] | null }>) =>
    Promise.race([
      query,
      new Promise<{ data: any[] | null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 1500),
      ),
    ]);
  const [{ data: courses }, { data: posts }] = await Promise.all([
    safeQuery(
      supabase
        .from("courses")
        .select("id, updated_at")
        .eq("is_published", true),
    ),
    safeQuery(
      supabase.from("posts").select("id, updated_at").eq("is_published", true),
    ),
  ]);

  const courseRoutes = (courses ?? []).map((course) => ({
    url: `${baseUrl}/curso/${course.id}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const postRoutes = (posts ?? []).map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...routes, ...courseRoutes, ...postRoutes];
}

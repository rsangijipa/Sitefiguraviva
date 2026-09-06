import { MetadataRoute } from "next";
import {
  listPublishedContent,
  listPublishedCourses,
} from "@/features/content/infrastructure/supabaseContentRepository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://figuraviva.com.br";

  let courses: MetadataRoute.Sitemap = [];
  let posts: MetadataRoute.Sitemap = [];

  try {
    const [coursesData, postsData] = await Promise.all([
      listPublishedCourses(),
      listPublishedContent("posts"),
    ]);

    courses = coursesData.map((course) => ({
      url: `${baseUrl}/curso/${course.slug || course.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    posts = postsData.map((post) => ({
      url: `${baseUrl}/blog/${post.slug || post.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Static routes must remain indexable during builds or brief catalog outages.
  }

  const routes = [
    "",
    "/instituto",
    "/instituto/fundadora",
    "/instituto/manifesto",
    "/formacoes",
    "/recursos",
    "/recursos/arvore-da-awareness",
    "/blog",
    "/public-library",
    "/public-gallery",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  const legalRoutes = ["/privacidade", "/termos"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [...routes, ...legalRoutes, ...courses, ...posts];
}

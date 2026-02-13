import { MetadataRoute } from "next";
import { db } from "@/lib/firebase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://figuraviva.com.br";

  // Fetch published courses and posts to include in sitemap
  const [coursesSnap, postsSnap] = await Promise.all([
    db.collection("courses").where("isPublished", "==", true).get(),
    db.collection("posts").where("isPublished", "==", true).get(),
  ]);

  const courses = coursesSnap.docs.map((doc) => ({
    url: `${baseUrl}/curso/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const posts = postsSnap.docs.map((doc) => ({
    url: `${baseUrl}/blog/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const routes = ["", "/public-library", "/public-gallery"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...routes, ...courses, ...posts];
}

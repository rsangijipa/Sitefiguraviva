import { adminDb } from "@/lib/firebase/admin";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://figuraviva.com.br";

  // 1. Static Routes
  const staticRoutes = ["", "/instituto", "/fundadora", "/auth"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );

  // 2. Dynamic Routes (Courses)
  let courseRoutes: MetadataRoute.Sitemap = [];

  try {
    const coursesSnap = await adminDb
      .collection("courses")
      .where("isPublished", "==", true)
      .where("status", "==", "open")
      .get();

    courseRoutes = coursesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/curso/${data.slug || doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      };
    });
  } catch (error) {
    console.error("Sitemap Error:", error);
  }

  // 3. Blog Posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const postsSnap = await adminDb
      .collection("posts")
      .where("isPublished", "==", true)
      .get();

    blogRoutes = postsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/blog/${data.slug || doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error("Blog Sitemap Error:", error);
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}

import { Suspense } from "react";
import HomeClient from "../components/HomeClient";
import { db } from "@/lib/firebase/admin";

// Revalidate every hour
export const revalidate = 3600;

async function getHomeData() {
  try {
    // Parallel fetching of all collections
    const [
      coursesSnap,
      postsSnap,
      gallerySnap,
      founderSnap,
      instituteSnap,
      seoSnap,
    ] = await Promise.all([
      db.collection("courses").get(),
      db.collection("posts").where("isPublished", "==", true).get(),
      db.collection("gallery").get(),
      db.collection("siteSettings").doc("founder").get(),
      db.collection("siteSettings").doc("institute").get(),
      db.collection("siteSettings").doc("seo").get(),
    ]);

    const toISO = (val: any) => {
      if (!val) return null;
      if (typeof val.toDate === "function") return val.toDate().toISOString();
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return new Date(val).toISOString();
      return null;
    };

    const sanitize = (obj: any) => JSON.parse(JSON.stringify(obj));

    // Course Merge & Deduplication Strategy - Visibility Guard: Published AND Open only
    const courses = coursesSnap.docs
      .map((doc) => {
        const data = doc.data();
        return sanitize({
          id: doc.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          image: data.image && data.image.trim() !== "" ? data.image : null,
          coverImage: data.coverImage || "",
          status: data.status || "",
          details: data.details || {},
          isPublished: data.isPublished === true, // Strict boolean
          created_at: toISO(data.created_at || data.createdAt),
          updated_at: toISO(data.updated_at || data.updatedAt),
        });
      })
      .filter((c: any) => c.isPublished === true && c.status === "open")
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

    const posts = postsSnap.docs
      .map((doc) => {
        const data = doc.data();
        return sanitize({
          id: doc.id,
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          type: data.type || "blog",
          image: data.image || "",
          created_at: toISO(data.created_at),
          updated_at: toISO(data.updated_at),
        });
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 4);

    const gallery = gallerySnap.docs
      .map((doc) => {
        const data = doc.data();
        return sanitize({
          id: doc.id,
          url: data.url || "",
          title: data.title || "",
          created_at: toISO(data.created_at),
          updated_at: toISO(data.updated_at),
        });
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 12);

    const founder = founderSnap.exists ? sanitize(founderSnap.data()) : null;
    const institute = instituteSnap.exists
      ? sanitize(instituteSnap.data())
      : null;
    const seo = seoSnap.exists ? sanitize(seoSnap.data()) : null;

    return { courses, posts, gallery, founder, institute, seo };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      courses: [],
      posts: [],
      gallery: [],
      founder: null,
      institute: null,
      seo: null,
    };
  }
}

export default async function Home() {
  const data = await getHomeData();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-primary/60 font-serif animate-pulse">
              Carregando...
            </p>
          </div>
        </div>
      }
    >
      <HomeClient initialData={data} />
    </Suspense>
  );
}

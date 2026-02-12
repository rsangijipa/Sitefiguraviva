import { Suspense } from "react";
import HomeClient from "../components/HomeClient";
import { db } from "@/lib/firebase/admin";
import { deepSafeSerialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Revalidate every hour
export const revalidate = 3600;

async function getHomeData() {
  try {
    // Parallel fetching of all collections
    const [
      coursesSnap,
      postsSnap,
      publicGallerySnap,
      legacyGallerySnap,
      founderSnap,
      instituteSnap,
      seoSnap,
    ] = await Promise.all([
      db
        .collection("courses")
        .where("isPublished", "==", true)
        .where("status", "==", "open")
        .limit(10)
        .get(),
      db
        .collection("posts")
        .where("isPublished", "==", true)
        .orderBy("created_at", "desc")
        .limit(4)
        .get(),
      db
        .collection("publicGallery")
        .orderBy("created_at", "desc")
        .limit(12)
        .get(),
      db.collection("gallery").orderBy("created_at", "desc").limit(12).get(),
      db.collection("siteSettings").doc("founder").get(),
      db.collection("siteSettings").doc("institute").get(),
      db.collection("siteSettings").doc("seo").get(),
    ]);

    const toISO = (val: any) => {
      if (!val) return null;
      if (typeof val.toDate === "function") return val.toDate().toISOString();
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return new Date(val).toISOString();
      if (val._seconds !== undefined)
        return new Date(val._seconds * 1000).toISOString();
      return null;
    };

    // Course Merge & Deduplication Strategy - Visibility Guard: Published AND Open only
    const courses = coursesSnap.docs.map((doc) => {
      const data = doc.data();
      return deepSafeSerialize({
        id: doc.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        description: data.description || "",
        image: data.image && data.image.trim() !== "" ? data.image : null,
        coverImage: data.coverImage || "",
        status: data.status || "",
        details: data.details || {},
        isPublished: data.isPublished === true,
        created_at: toISO(data.created_at || data.createdAt),
        updated_at: toISO(data.updated_at || data.updatedAt),
      });
    });

    const posts = postsSnap.docs.map((doc) => {
      const data = doc.data();
      return deepSafeSerialize({
        id: doc.id,
        title: data.title || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        type: data.type || "blog",
        image: data.image || "",
        created_at: toISO(data.created_at),
        updated_at: toISO(data.updated_at),
      });
    });

    const gallerySource = !publicGallerySnap.empty
      ? publicGallerySnap
      : legacyGallerySnap;

    const gallery = gallerySource.docs.map((doc) => {
      const data = doc.data();
      return deepSafeSerialize({
        id: doc.id,
        src: data.src || data.url || "",
        url: data.url || data.src || "",
        title: data.title || "",
        caption: data.caption || data.description || "",
        tags: data.tags || [],
        created_at: toISO(data.created_at),
        updated_at: toISO(data.updated_at),
      });
    });

    const founder = founderSnap.exists
      ? deepSafeSerialize(founderSnap.data())
      : null;
    const institute = instituteSnap.exists
      ? deepSafeSerialize(instituteSnap.data())
      : null;
    const seo = seoSnap.exists ? deepSafeSerialize(seoSnap.data()) : null;

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

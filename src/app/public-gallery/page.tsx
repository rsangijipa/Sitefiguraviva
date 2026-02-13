import { Suspense } from "react";
import { db } from "@/lib/firebase/admin";
import { deepSafeSerialize } from "@/lib/utils";
import GalleryClient from "./GalleryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria de Momentos | Instituto Figura Viva",
  description:
    "Explore os registros fotográficos de nossos encontros, formações e eventos no Instituto Figura Viva.",
  keywords: [
    "Eventos Gestalt",
    "Fotos Instituto Figura Viva",
    "Formação Rondônia",
    "Encontros de Psicologia",
  ],
};

export const revalidate = 3600; // Revalidate every hour

async function getGalleryData() {
  try {
    // Try publicGallery first, fallback to gallery
    let snap = await db
      .collection("publicGallery")
      .orderBy("created_at", "desc")
      .get();

    if (snap.empty) {
      snap = await db.collection("gallery").orderBy("created_at", "desc").get();
    }

    const gallery = snap.docs.map((doc) => {
      const data = doc.data();
      const toISO = (val: any) => {
        if (!val) return null;
        if (typeof val.toDate === "function") return val.toDate().toISOString();
        return val;
      };

      return deepSafeSerialize({
        id: doc.id,
        src: data.src || data.url || "",
        title: data.title || "",
        caption: data.caption || data.description || "",
        tags: data.tags || [],
        created_at: toISO(data.created_at || data.createdAt),
      });
    });

    return gallery;
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return [];
  }
}

export default async function PublicGalleryPage() {
  const gallery = await getGalleryData();

  return (
    <div className="min-h-screen bg-paper pt-24 pb-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <GalleryClient initialGallery={gallery} />
      </Suspense>
    </div>
  );
}

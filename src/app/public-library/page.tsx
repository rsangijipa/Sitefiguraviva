import { Suspense } from "react";
import { db } from "@/lib/firebase/admin";
import { deepSafeSerialize } from "@/lib/utils";
import LibraryClient from "./LibraryClient";

export const revalidate = 3600; // Revalidate every hour

async function getLibraryData() {
  try {
    // 1. Try publicLibrary first
    let snap = await db
      .collection("publicLibrary")
      .orderBy("created_at", "desc")
      .get();

    // 2. If empty, fallback to posts of type 'library'
    if (snap.empty) {
      snap = await db
        .collection("posts")
        .where("type", "==", "library")
        .where("isPublished", "==", true)
        .orderBy("created_at", "desc")
        .get();
    }

    const libraryItems = snap.docs.map((doc) => {
      const data = doc.data();
      const toISO = (val: any) => {
        if (!val) return null;
        if (typeof val.toDate === "function") return val.toDate().toISOString();
        return val;
      };

      return deepSafeSerialize({
        id: doc.id,
        title: data.title || "",
        subtitle: data.subtitle || data.excerpt || "",
        content: data.content || "",
        pdfUrl: data.pdfUrl || data.pdf_url || "",
        image: data.image || data.coverImage || "",
        tags: data.tags || [],
        created_at: toISO(data.created_at || data.createdAt),
      });
    });

    return libraryItems;
  } catch (error) {
    console.error("Error fetching library data:", error);
    return [];
  }
}

export default async function PublicLibraryPage() {
  const items = await getLibraryData();

  return (
    <div className="min-h-screen bg-paper pt-24 pb-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LibraryClient initialItems={items} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import LibraryClient from "./LibraryClient";
import type { Metadata } from "next";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export const metadata: Metadata = {
  title: "Biblioteca Pública",
  description:
    "Acesse nosso acervo de artigos, livros e materiais sobre Gestalt-Terapia e Psicologia.",
  keywords: [
    "Biblioteca Gestalt",
    "Artigos Psicologia",
    "Livros Gestalt-Terapia",
    "Estudos Clínicos",
  ],
};

export const revalidate = 3600; // Revalidate every hour

async function getLibraryData() {
  try {
    const [posts, documentsResult] = await Promise.all([
      listPublishedContent("publicLibrary"),
      createSupabaseServiceClient()
        .from("public_documents")
        .select("id, title, category, file_url, file_size, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
    ]);

    if (documentsResult.error) throw documentsResult.error;

    const documents = (documentsResult.data ?? []).map((document) => ({
      id: `document-${document.id}`,
      title: document.title,
      subtitle: `${document.category} · PDF${document.file_size ? ` · ${document.file_size}` : ""}`,
      type: "library",
      tags: [document.category],
      pdfUrl: document.file_url,
      pdf_url: document.file_url,
      createdAt: document.created_at,
      isPublished: true,
    }));

    return [...documents, ...posts];
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

import { Suspense } from "react";
import LibraryClient from "./LibraryClient";
import type { Metadata } from "next";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";

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
    return await listPublishedContent("publicLibrary");
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

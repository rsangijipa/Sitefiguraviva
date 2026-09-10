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
    const items = await listPublishedContent("publicLibrary");
    const localDocumentUrl =
      "/documents/As%20polaridades%20do%20feminino%20na%20contemporaneidade%20e%20a%20depress%C3%A3o%20p%C3%B3s-parto%20uma%20vis%C3%A3o%20gest%C3%A1ltica.pdf";

    return items.map((item) => {
      const searchableTitle = String(item.title || "").toLowerCase();
      const isPolaridadesDocument =
        searchableTitle.includes("polaridades") &&
        searchableTitle.includes("depress") &&
        searchableTitle.includes("pós-parto");
      const pointsToMissingBucket =
        /supabase\.co\/storage\/v1\/object\/(public|sign)\/(uploads|documents)\//i.test(
          String(item.pdfUrl || item.pdf_url || ""),
        );

      return isPolaridadesDocument || pointsToMissingBucket
        ? { ...item, pdfUrl: localDocumentUrl, pdf_url: localDocumentUrl }
        : item;
    });
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

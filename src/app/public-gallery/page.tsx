import { Suspense } from "react";
import GalleryClient from "./GalleryClient";
import type { Metadata } from "next";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";

export const metadata: Metadata = {
  title: "Galeria de Momentos",
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
    return await listPublishedContent("publicGallery");
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return [];
  }
}

export default async function PublicGalleryPage() {
  const gallery = await getGalleryData();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"
            role="status"
            aria-label="Carregando galeria"
          />
        </div>
      }
    >
      <GalleryClient initialGallery={gallery} />
    </Suspense>
  );
}

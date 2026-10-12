import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookshelfSection from "@/components/sections/BookshelfSection";
import { createSupabaseAnonServerClient } from "@/infrastructure/supabase/server";

export const metadata: Metadata = {
  title: "Estante",
  description:
    "Curadoria de livros que atravessam a formação e a clínica no Instituto Figura Viva.",
  keywords: [
    "Livros Gestalt",
    "Estante Instituto Figura Viva",
    "Leituras recomendadas",
  ],
};

export const revalidate = 3600; // Revalidate every hour

async function getBooks() {
  try {
    const { data, error } = await createSupabaseAnonServerClient()
      .from("book_recommendations")
      .select(
        "id, title, author, description, cover_image_url, purchase_url, publication_year, category",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return {
      loadError: false,
      books: (data ?? []).map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverImageUrl: book.cover_image_url,
        purchaseUrl: book.purchase_url,
        publicationYear: book.publication_year,
        category: book.category,
      })),
    };
  } catch (error) {
    console.error("Error fetching book recommendations:", error);
    return { loadError: true, books: [] };
  }
}

export default async function EstantePage() {
  const { books, loadError } = await getBooks();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <BookshelfSection livros={books} loadError={loadError} />
      <Footer />
    </div>
  );
}

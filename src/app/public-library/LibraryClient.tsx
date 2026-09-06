"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  FileText,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PDFReader from "@/components/PDFReader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { processGamificationEvent } from "@/actions/gamification";
import BookshelfSection from "@/components/sections/BookshelfSection";

export default function LibraryClient({
  initialItems,
}: {
  initialItems: any[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { user } = useAuth();

  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    if (user) {
      // Trigger library view XP
      try {
        await processGamificationEvent({
          actionType: "library_view",
          metadata: { title: item.title, itemId: item.id },
        });
      } catch (e) {
        console.error("Gamification error", e);
      }
    }
  };

  const filteredItems = initialItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "Todos" || (item.tags && item.tags.includes(filter));
    return matchesSearch && matchesFilter;
  });

  // Itens do acervo que sao livro, nao artigo. Vao para a estante em vez da
  // grade de leitura - a Biblioteca abre PDF, a estante aponta referencia.
  const livros = initialItems
    .filter((item) => {
      const tipo = String(item.type || "").toLowerCase();
      const tags = (item.tags || []).map((t: string) => String(t).toLowerCase());
      return tipo === "livro" || tags.includes("livro") || tags.includes("livros");
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      url: item.externalUrl || undefined,
    }));

  const categories = [
    "Todos",
    ...Array.from(new Set(initialItems.flatMap((i) => i.tags || []))),
  ].sort();

  return (
    <div className="fv-bg fv-bg-library flex min-h-screen flex-col bg-paper">
      <Navbar />

      <div className="fv-container flex-1 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* HEADER */}
          <header className="text-center pt-10">
            <div className="mb-6 inline-flex items-center justify-center rounded-md bg-gold/15 p-3 text-gold-dark">
              <BookOpen size={32} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl text-primary font-bold mb-4">
              Biblioteca{" "}
              <span className="italic text-gold font-light">Viva</span>
            </h1>
            <p className="fv-lead mx-auto text-center">
              Uma curadoria de textos, artigos e recursos para aprofundar seu
              conhecimento em Gestalt-Terapia e awareness.
            </p>
          </header>

          {/* CONTROLS */}
          <section className="flex flex-col items-center justify-between gap-6 border-y border-border py-6 md:flex-row">
            <div className="relative group w-full max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
                size={18}
              />
              <input
                type="text"
                aria-label="Buscar na biblioteca"
                placeholder="Buscar na biblioteca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-md border border-border bg-paper pl-12 pr-4 text-primary outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                className={`min-h-11 rounded-sm border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    filter === cat
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-paper text-text/70 hover:border-igarape hover:bg-areia hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* ITEMS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="fv-card group p-8"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-gold/15 text-gold-dark transition-transform group-hover:scale-105">
                  <FileText size={24} />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-3 leading-tight group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="mb-8 line-clamp-3 flex-1 text-sm leading-relaxed text-text/75">
                  {item.subtitle}
                </p>

                <button
                  onClick={() => handleOpenItem(item)}
                  className="inline-flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group/btn"
                >
                  Ler Agora{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </motion.div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full rounded-md border border-dashed border-border bg-areia/50 py-20">
                <EmptyState
                  icon={Search}
                  title="Nenhum Recurso Encontrado"
                  description="Não encontramos artigos ou textos com os filtros selecionados. Experimente buscar por outros termos."
                  className="bg-transparent border-none shadow-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <BookshelfSection livros={livros} />

      <Footer />

      <PDFReader
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        article={selectedItem}
      />
    </div>
  );
}

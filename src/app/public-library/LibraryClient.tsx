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

export default function LibraryClient({
  initialItems,
}: {
  initialItems: any[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const filteredItems = initialItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "Todos" || (item.tags && item.tags.includes(filter));
    return matchesSearch && matchesFilter;
  });

  const categories = [
    "Todos",
    ...Array.from(new Set(initialItems.flatMap((i) => i.tags || []))),
  ].sort();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 max-w-7xl pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* HEADER */}
          <header className="text-center pt-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gold/10 text-gold mb-6">
              <BookOpen size={32} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl text-primary font-bold mb-4">
              Biblioteca{" "}
              <span className="italic text-gold font-light">Viva</span>
            </h1>
            <p className="text-text/60 text-lg font-light max-w-2xl mx-auto">
              Uma curadoria de textos, artigos e recursos para aprofundar seu
              conhecimento em Gestalt-Terapia e awareness.
            </p>
          </header>

          {/* CONTROLS */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative group w-full max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-gold transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar na biblioteca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none bg-stone-50 border border-stone-200 focus:border-gold/50 text-primary placeholder-text/30 transition-all font-light"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border
                                    ${
                                      filter === cat
                                        ? "bg-primary border-primary text-white shadow-lg"
                                        : "bg-white border-stone-200 text-text/60 hover:border-gold hover:text-gold"
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
                className="group bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-50 text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-3 leading-tight group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="text-text/60 text-sm font-light mb-8 flex-1 line-clamp-3">
                  {item.subtitle}
                </p>

                <button
                  onClick={() => setSelectedItem(item)}
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-gold transition-colors group/btn"
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
              <div className="col-span-full py-20 bg-stone-50/50 rounded-[2rem] border border-dashed border-stone-200">
                <EmptyState
                  icon={<Search size={32} />}
                  title="Nenhum Recurso Encontrado"
                  description="Não encontramos artigos ou textos com os filtros selecionados. Experimente buscar por outros termos."
                  className="bg-transparent border-none shadow-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />

      <PDFReader
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        article={selectedItem}
      />
    </div>
  );
}

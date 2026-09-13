"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PDFReader from "@/components/PDFReader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { processGamificationEvent } from "@/actions/gamification";

const GROUPS = ["Todos", "Artigos", "PDFs", "Ensaios", "Materiais"] as const;
type Group = (typeof GROUPS)[number];

function groupOf(item: any): Group {
  const type = String(item.type || "").toLowerCase();
  if (item.pdfUrl || item.pdf_url || type === "library" || type === "pdf") {
    return "PDFs";
  }
  if (type.includes("ensaio") || type.includes("essay")) return "Ensaios";
  if (type.includes("artigo") || type.includes("article") || type === "post") {
    return "Artigos";
  }
  return "Materiais";
}

function yearOf(item: any): string | null {
  const raw = item.createdAt || item.created_at || item.publishedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : String(date.getFullYear());
}

export default function LibraryClient({
  initialItems,
}: {
  initialItems: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<Group>("Todos");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { user } = useAuth();

  const itemsById = useMemo(
    () => new Map(initialItems.map((item) => [String(item.id), item])),
    [initialItems],
  );

  useEffect(() => {
    const id = searchParams.get("item");
    if (id && itemsById.has(id)) {
      setSelectedItem(itemsById.get(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    router.replace(`/public-library?item=${item.id}`, { scroll: false });
    if (user) {
      try {
        await processGamificationEvent({
          actionType: "library_view",
          resourceId: String(item.id),
        });
      } catch (e) {
        console.error("Gamification error", e);
      }
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    router.replace("/public-library", { scroll: false });
  };

  const [featured, ...remaining] = initialItems;

  const filteredItems = remaining.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = group === "Todos" || groupOf(item) === group;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="fv-bg fv-bg-library flex min-h-screen flex-col bg-paper">
      <Navbar />

      <PublicPageHero
        eyebrow="Acervo"
        title="Biblioteca Viva"
        description="Uma curadoria de textos, artigos e recursos para aprofundar seu conhecimento em Gestalt-terapia e awareness."
        backgroundImage="/assets/fv/heroes/biblioteca.png"
      />

      <div className="fv-container flex-1 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* CONTEÚDO EM DESTAQUE */}
          {featured && (
            <section>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gold">
                Em destaque
              </p>
              <button
                onClick={() => handleOpenItem(featured)}
                className="fv-card group grid w-full gap-6 p-8 text-left md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/45">
                  {groupOf(featured)}
                  {featured.author ? ` · ${featured.author}` : ""}
                  {yearOf(featured) ? ` · ${yearOf(featured)}` : ""}
                </span>
                <div>
                  <h2 className="font-serif text-2xl text-primary leading-tight group-hover:text-gold transition-colors md:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text/75">
                    {featured.subtitle}
                  </p>
                </div>
                <span className="inline-flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary group-hover:text-gold transition-colors">
                  Ler <ArrowRight size={14} />
                </span>
              </button>
            </section>
          )}

          {/* BUSCA */}
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

            {/* TIPO DE MATERIAL */}
            <div className="flex flex-wrap gap-2 justify-center">
              {GROUPS.map((option) => (
                <button
                  key={option}
                  onClick={() => setGroup(option)}
                  aria-pressed={group === option}
                  className={`min-h-11 rounded-sm border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    group === option
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-paper text-text/70 hover:border-igarape hover:bg-areia hover:text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          {/* ACERVO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="fv-card group flex flex-col p-8"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/45">
                  {groupOf(item)}
                  {item.author ? ` · ${item.author}` : ""}
                  {yearOf(item) ? ` · ${yearOf(item)}` : ""}
                </span>
                <h3 className="mt-3 font-serif text-2xl text-primary mb-3 leading-tight group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="mb-8 line-clamp-3 flex-1 text-sm leading-relaxed text-text/75">
                  {item.subtitle}
                </p>

                <button
                  onClick={() => handleOpenItem(item)}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group/btn"
                >
                  Ler{" "}
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

      <Footer />

      <PDFReader
        isOpen={!!selectedItem}
        onClose={handleClose}
        article={selectedItem}
      />
    </div>
  );
}

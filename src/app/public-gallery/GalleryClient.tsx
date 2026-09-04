"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image as ImageIcon,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GalleryClient({
  initialGallery,
}: {
  initialGallery: any[];
}) {
  // Showroom State
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("curadoria"); // curadoria | az
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );

  const safeGallery = useMemo(
    () => (Array.isArray(initialGallery) ? initialGallery : []),
    [initialGallery],
  );

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = safeGallery.flatMap((photo) => {
      if (Array.isArray(photo.tags)) return photo.tags;
      if (typeof photo.tags === "string")
        return photo.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      return [];
    });
    return Array.from(new Set(tags)).sort();
  }, [safeGallery]);

  // Helper to check if photo has a tag
  const hasTag = (photo: any, targetTag: string) => {
    if (Array.isArray(photo.tags)) return photo.tags.includes(targetTag);
    if (typeof photo.tags === "string") {
      return photo.tags
        .split(",")
        .map((t: string) => t.trim())
        .includes(targetTag);
    }
    return false;
  };

  // Filtering Logic
  const filteredPhotos = useMemo(() => {
    let result = [...safeGallery];

    // Filter by Tag
    if (filter !== "Todos") {
      result = result.filter((p) => hasTag(p, filter));
    }

    // Filter by Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const captionMatch = p.caption?.toLowerCase().includes(q);
        const tagsList = Array.isArray(p.tags)
          ? p.tags
          : typeof p.tags === "string"
            ? p.tags.split(",").map((t: string) => t.trim())
            : [];
        const tagMatch = tagsList.some((t: string) =>
          t.toLowerCase().includes(q),
        );
        return titleMatch || captionMatch || tagMatch;
      });
    }

    // Sorting
    if (sort === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [filter, search, sort, safeGallery]);

  // Lightbox Handlers
  const openLightbox = (index: number) => setSelectedPhotoIndex(index);
  const closeLightbox = () => setSelectedPhotoIndex(null);
  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
    }
  };
  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(
        (selectedPhotoIndex - 1 + filteredPhotos.length) %
          filteredPhotos.length,
      );
    }
  };

  return (
    <div className="fv-bg fv-bg-gallery flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="fv-container flex-1 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* HEADER */}
          <header className="text-center pt-10">
            <div className="mb-6 inline-flex items-center justify-center rounded-md bg-gold/15 p-3 text-gold-dark">
              <ImageIcon size={32} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl text-primary font-bold mb-4">
              Galeria de Imagens
            </h1>
            <p className="fv-lead mx-auto text-center">
              Um registro visual dos encontros, vivências e da beleza que
              floresce no Instituto Figura Viva.
            </p>
          </header>

          {/* SHOWROOM CONTROLS */}
          <section className="flex flex-col items-end justify-between gap-8 border-y border-border py-6 xl:flex-row">
            {/* Stats & Search */}
            <div className="w-full xl:w-auto flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                  {filteredPhotos.length} Registros
                </p>
                <div className="h-4 w-px bg-border" aria-hidden></div>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-text/70">
                  <button
                    onClick={() => setSort("curadoria")}
                    className={
                      sort === "curadoria"
                        ? "text-primary underline decoration-2 underline-offset-4"
                        : "hover:text-primary"
                    }
                  >
                    Recentes
                  </button>
                  <button
                    onClick={() => setSort("az")}
                    className={
                      sort === "az"
                        ? "text-primary underline decoration-2 underline-offset-4"
                        : "hover:text-primary"
                    }
                  >
                    A-Z
                  </button>
                </div>
              </div>

              <div className="relative group w-full max-w-md">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar momentos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-md border border-border bg-paper pl-12 pr-4 text-primary outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div className="w-full xl:w-auto flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                <Filter size={10} /> Filtros
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setFilter("Todos")}
                  aria-pressed={filter === "Todos"}
                  className={`rounded-sm border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    filter === "Todos"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-paper text-text/70 hover:border-igarape hover:bg-areia hover:text-primary"
                  }`}
                >
                  Todos
                </button>
                {allTags.map((tag: any) => (
                  <button
                    key={tag}
                    onClick={() => setFilter(tag)}
                    aria-pressed={filter === tag}
                    className={`rounded-sm border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      filter === tag
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-paper text-text/70 hover:border-igarape hover:bg-areia hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* GRID CONTENT */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layoutId={photo.id}
                className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-md border border-border bg-areia transition-colors duration-500 hover:border-igarape"
                onClick={() => openLightbox(index)}
                whileHover={{ y: -5 }}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-serif text-lg leading-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {photo.title}
                  </h3>
                  <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {(Array.isArray(photo.tags)
                      ? photo.tags
                      : typeof photo.tags === "string"
                        ? photo.tags
                            .split(",")
                            .map((t: string) => t.trim())
                            .filter(Boolean)
                        : []
                    )
                      .slice(0, 2)
                      .map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-sm bg-paper/25 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredPhotos.length === 0 && (
              <div className="col-span-full rounded-md border border-dashed border-border bg-areia/50 py-20">
                <EmptyState
                  icon={ImageIcon}
                  title="Nenhum Momento Encontrado"
                  description="Não encontramos imagens para os filtros selecionados. Tente ajustar sua busca ou categoria."
                  className="bg-transparent border-none shadow-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
            >
              <X size={32} />
            </button>

            <div
              className="relative flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-md bg-paper lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container */}
              <div className="relative flex flex-1 items-center justify-center bg-areia p-4">
                <img
                  src={filteredPhotos[selectedPhotoIndex].src}
                  alt={filteredPhotos[selectedPhotoIndex].title}
                  className="max-h-[70vh] max-w-full rounded-md object-contain"
                />

                {/* Nav Buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-paper/90 p-4 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white"
                >
                  <ArrowRight className="rotate-180" size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-paper/90 p-4 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white"
                >
                  <ArrowRight size={24} />
                </button>
              </div>

              {/* Sidebar Info */}
              <div className="flex w-full flex-col overflow-y-auto border-l border-border bg-paper p-8 lg:w-80">
                <h3 className="font-serif text-2xl text-primary mb-4 leading-tight">
                  {filteredPhotos[selectedPhotoIndex].title}
                </h3>
                <div className="mb-6 h-px w-10 bg-terra" aria-hidden></div>
                <p className="mb-8 whitespace-pre-line text-sm leading-relaxed text-text/80">
                  {filteredPhotos[selectedPhotoIndex].caption ||
                    "Sem descrição disponível."}
                </p>
                <div className="mt-auto">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(filteredPhotos[selectedPhotoIndex].tags)
                      ? filteredPhotos[selectedPhotoIndex].tags
                      : typeof filteredPhotos[selectedPhotoIndex].tags ===
                          "string"
                        ? filteredPhotos[selectedPhotoIndex].tags.split(",")
                        : []
                    ).map((tag: any) => (
                      <span
                        key={tag}
                        className="rounded-sm bg-areia px-2.5 py-1 text-[9px] uppercase tracking-widest text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

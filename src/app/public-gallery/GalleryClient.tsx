"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Filter, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { GalleryImage } from "@/features/public-site/gallery/GalleryImage";
import { normalizeGalleryMedia } from "@/features/public-site/gallery/gallery-media";

const CATEGORIES = [
  "Todos",
  "Formação",
  "Encontros",
  "Vivências",
  "Comunidade",
] as const;
type Category = (typeof CATEGORIES)[number];

export default function GalleryClient({
  initialGallery,
}: {
  initialGallery: any[];
}) {
  // Showroom State
  const [filter, setFilter] = useState<Category>("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("curadoria"); // curadoria | az
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const safeGallery = useMemo(
    () =>
      (Array.isArray(initialGallery) ? initialGallery : []).map((photo) => ({
        ...photo,
        ...normalizeGalleryMedia(photo),
      })),
    [initialGallery],
  );

  const featuredPhoto = safeGallery[0];
  const restGallery = safeGallery;

  // Helper to check if photo belongs to an editorial category
  const hasCategory = (photo: any, category: Category) => {
    if (category === "Todos") return true;
    const tagsList = Array.isArray(photo.tags)
      ? photo.tags
      : typeof photo.tags === "string"
        ? photo.tags.split(",").map((t: string) => t.trim())
        : [];
    const haystack =
      `${photo.title ?? ""} ${photo.caption ?? ""} ${tagsList.join(" ")}`.toLowerCase();
    return haystack.includes(category.toLowerCase());
  };

  // Filtering Logic
  const filteredPhotos = useMemo(() => {
    let result = [...restGallery];

    // Filter by Category
    if (filter !== "Todos") {
      result = result.filter((p) => hasCategory(p, filter));
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
  }, [filter, search, sort, restGallery]);

  // Lightbox Handlers
  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setSelectedPhotoIndex(index);
  };
  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  };
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

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return;
    }

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") nextPhoto();
      if (event.key === "ArrowLeft") prevPhoto();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="fv-bg fv-bg-gallery flex min-h-screen flex-col bg-paper">
      <Navbar />

      <PublicPageHero
        eyebrow="Confluência"
        title="Galeria de imagens"
        description="Um registro visual dos encontros, vivências e da beleza que floresce no Instituto Figura Viva."
        backgroundImage="/assets/fv/heroes/galeria.png"
      />

      <div className="fv-container flex-1 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* MOMENTO EM DESTAQUE */}
          {featuredPhoto && (
            <section>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gold">
                Momento em destaque
              </p>
              <button
                type="button"
                aria-label={`Abrir imagem: ${featuredPhoto.title}`}
                onClick={(event) =>
                  openLightbox(
                    filteredPhotos.indexOf(featuredPhoto) >= 0
                      ? filteredPhotos.indexOf(featuredPhoto)
                      : 0,
                    event.currentTarget,
                  )
                }
                className="group relative block h-[52vh] w-full overflow-hidden border border-border text-left"
              >
                <GalleryImage
                  src={featuredPhoto.src}
                  alt={featuredPhoto.title}
                  width={featuredPhoto.width}
                  height={featuredPhoto.height}
                  imageClassName="opacity-95 transition-opacity group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mata/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                  <h2 className="font-serif text-2xl leading-tight text-white md:text-3xl">
                    {featuredPhoto.title}
                  </h2>
                </div>
              </button>
            </section>
          )}

          {/* CATEGORIAS + FILTRAR */}
          <section className="flex flex-col gap-6 border-y border-border py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
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

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text/70 transition-colors hover:border-igarape hover:bg-areia hover:text-primary"
              >
                <Filter size={12} /> Filtrar
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative group w-full max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
                    size={18}
                  />
                  <input
                    type="text"
                    aria-label="Buscar momentos"
                    placeholder="Buscar momentos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 w-full rounded-md border border-border bg-paper pl-12 pr-4 text-primary outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
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
                          ? "min-h-11 text-primary underline decoration-2 underline-offset-4"
                          : "min-h-11 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      }
                    >
                      Recentes
                    </button>
                    <button
                      onClick={() => setSort("az")}
                      className={
                        sort === "az"
                          ? "min-h-11 text-primary underline decoration-2 underline-offset-4"
                          : "min-h-11 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      }
                    >
                      A-Z
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* GRID CONTENT */}
          <div className="grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPhotos.map((photo, index) => (
              <motion.button
                type="button"
                key={photo.id}
                layoutId={photo.id}
                aria-label={`Abrir imagem: ${photo.title}`}
                className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-areia text-left shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-igarape hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={(event) => openLightbox(index, event.currentTarget)}
                whileHover={{ y: -5 }}
              >
                <GalleryImage
                  src={photo.src}
                  alt={photo.title}
                  width={photo.width}
                  height={photo.height}
                  imageClassName="opacity-95 transition-opacity group-hover:opacity-100"
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
              </motion.button>
            ))}

            {filteredPhotos.length === 0 && (
              <div className="col-span-full rounded-md border border-dashed border-border bg-areia/50 py-20">
                <EmptyState
                  icon={Search}
                  title="Nenhum Momento Encontrado"
                  description="Não encontramos imagens para os filtros selecionados. Tente ajustar sua busca ou categoria."
                  className="bg-transparent border-none shadow-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-mata/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-dialog-title"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Fechar imagem ampliada"
              className="absolute right-4 top-4 z-[110] inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/30 text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-6 sm:top-6"
            >
              <X size={32} />
            </button>

            <div
              className="relative flex max-h-[90vh] w-[min(96vw,1280px)] flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container */}
              <div className="relative flex min-h-[45vh] min-w-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55),transparent_65%),#e9dfcf] p-4 sm:p-8">
                <div className="h-[min(68vh,760px)] w-full max-w-[920px]">
                  <GalleryImage
                    src={filteredPhotos[selectedPhotoIndex].src}
                    alt={filteredPhotos[selectedPhotoIndex].title}
                    width={filteredPhotos[selectedPhotoIndex].width}
                    height={filteredPhotos[selectedPhotoIndex].height}
                    fit="contain"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="h-full w-full rounded-md"
                    imageClassName="object-contain"
                  />
                </div>

                {/* Nav Buttons */}
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-4 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-full bg-paper/90 p-4 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowRight className="rotate-180" size={24} />
                </button>
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-4 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-full bg-paper/90 p-4 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowRight size={24} />
                </button>
              </div>

              {/* Sidebar Info */}
              <div className="flex max-h-[38vh] w-full shrink-0 flex-col overflow-y-auto border-t border-border bg-paper p-6 sm:p-8 lg:max-h-none lg:w-[min(34vw,380px)] lg:border-l lg:border-t-0">
                <h3
                  id="gallery-dialog-title"
                  className="font-serif text-2xl text-primary mb-4 leading-tight"
                >
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

"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Tag,
  Sparkles,
  Maximize2,
} from "lucide-react";
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
  "Workshops",
] as const;
type Category = (typeof CATEGORIES)[number];

// Helper to extract dominant color from an image URL with smooth green bias
function extractDominantColor(
  src: string,
  onResult: (rgba: string) => void,
) {
  const fallback = "rgba(0, 90, 31, 0.88)";
  if (typeof window === "undefined") {
    onResult(fallback);
    return;
  }

  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          onResult(fallback);
          return;
        }

        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;
        const buckets = new Map<string, {count:number; r:number; g:number; b:number}>();
        for (let i = 0; i < data.length; i += 4) {
          const lum = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2];
          if (data[i + 3] < 128 || lum <= 25 || lum >= 235) continue;
          const key = [data[i] >> 5, data[i + 1] >> 5, data[i + 2] >> 5].join(":");
          const bucket = buckets.get(key) ?? {count:0,r:0,g:0,b:0};
          bucket.count++; bucket.r += data[i]; bucket.g += data[i + 1]; bucket.b += data[i + 2]; buckets.set(key, bucket);
        }
        const dominant = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
        if (!dominant) { onResult(fallback); return; }
        const r = Math.round((dominant.r / dominant.count) * .23);
        const g = Math.round((dominant.g / dominant.count) * .23 + 45);
        const b = Math.round((dominant.b / dominant.count) * .23 + 10);
        onResult(`rgba(${r}, ${g}, ${b}, 0.94)`);
      } catch {
        onResult(fallback);
      }
    };

    img.onerror = () => onResult(fallback);
    img.src = src;
  } catch {
    onResult(fallback);
  }
}

// Grid photo card with dynamic dominant color hover analysis
function GalleryGridCard({
  photo,
  index,
  onOpen,
}: {
  photo: any;
  index: number;
  onOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [dominantBg, setDominantBg] = useState<string>("rgba(0, 90, 31, 0.86)");

  useEffect(() => {
    if (photo.src) {
      extractDominantColor(photo.src, setDominantBg);
    }
  }, [photo.src]);

  const tagsList = useMemo(() => {
    if (Array.isArray(photo.tags)) return photo.tags;
    if (typeof photo.tags === "string") {
      return photo.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    return [];
  }, [photo.tags]);

  const yearDisplay = photo.year || photo.ano;

  return (
    <motion.button
      type="button"
      layoutId={photo.id}
      aria-label={`Abrir imagem: ${photo.title}`}
      className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 text-left shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={onOpen}
      whileHover={{ y: -6 }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
        <GalleryImage
          src={photo.src}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          className="h-full w-full"
          imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Badge discreto com ano se houver */}
        {yearDisplay && (
          <div className="absolute top-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md opacity-85 group-hover:opacity-100 transition-opacity">
            {yearDisplay}
          </div>
        )}

        {/* Hover Overlay com Cor Predominante Analisada */}
        <div
          style={{ backgroundColor: dominantBg }}
          className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-gold text-[10px] font-bold uppercase tracking-widest translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <Sparkles size={11} />
            <span>{photo.category || "Registro Figura Viva"}</span>
          </div>

          <h3 className="font-serif text-lg font-medium leading-snug text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-75 line-clamp-2">
            {photo.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-1.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-100">
            {tagsList.slice(0, 3).map((tag: string, i: number) => (
              <span
                key={i}
                className="rounded-md bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function GalleryClient({
  initialGallery,
}: {
  initialGallery: any[];
}) {
  const [filter, setFilter] = useState<Category>("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("curadoria"); // curadoria | az
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxOpen = selectedPhotoIndex !== null;

  const safeGallery = useMemo(
    () =>
      (Array.isArray(initialGallery) ? initialGallery : []).map((photo) => ({
        ...photo,
        ...normalizeGalleryMedia(photo),
      })),
    [initialGallery],
  );

  const restGallery = safeGallery;

  const hasCategory = (photo: any, category: Category) => {
    if (category === "Todos") return true;
    const tagsList = Array.isArray(photo.tags)
      ? photo.tags
      : typeof photo.tags === "string"
        ? photo.tags.split(",").map((t: string) => t.trim())
        : [];
    const haystack =
      `${photo.title ?? ""} ${photo.caption ?? ""} ${photo.category ?? ""} ${tagsList.join(" ")}`.toLowerCase();
    return haystack.includes(category.toLowerCase());
  };

  const filteredPhotos = useMemo(() => {
    let result = [...restGallery];

    if (filter !== "Todos") {
      result = result.filter((p) => hasCategory(p, filter));
    }

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

    if (sort === "az") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [filter, search, sort, restGallery]);

  const featuredPhoto = filteredPhotos[0];

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
    if (lightboxOpen) closeButtonRef.current?.focus();
  }, [lightboxOpen]);

  useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") nextPhoto();
      if (event.key === "ArrowLeft") prevPhoto();
      if (event.key === "Tab" && lightboxRef.current) {
        const controls = [...lightboxRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
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
        backgroundImage="/assets/fv/heroes/galeria.webp"
      />

      <div className="fv-container flex-1 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* 1. MOMENTO EM DESTAQUE COM MOVIMENTO SUAVE (KEN BURNS) */}
          {featuredPhoto && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-gold" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                  Momento em destaque
                </p>
              </div>

              <button
                type="button"
                aria-label={`Abrir imagem em destaque: ${featuredPhoto.title}`}
                onClick={(event) =>
                  openLightbox(
                    filteredPhotos.indexOf(featuredPhoto) >= 0
                      ? filteredPhotos.indexOf(featuredPhoto)
                      : 0,
                    event.currentTarget,
                  )
                }
                className="group relative block h-[380px] sm:h-[460px] w-full overflow-hidden rounded-3xl border-2 border-stone-200/80 text-left shadow-xl"
              >
                {/* Imagem com animação de movimento suave contínuo */}
                <div
                  className="gallery-feature-motion h-full w-full will-change-transform"
                >
                  <GalleryImage
                    src={featuredPhoto.src}
                    alt={featuredPhoto.title}
                    width={featuredPhoto.width}
                    height={featuredPhoto.height}
                    className="h-full w-full"
                    imageClassName="object-[center_60%] w-full h-full"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-mata/90 via-mata/30 to-transparent p-8 sm:p-10 flex flex-col justify-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2">
                    {featuredPhoto.year ? `Ano ${featuredPhoto.year} · ` : ""}
                    {featuredPhoto.category || "Destaque Visual"}
                  </span>
                  <h2 className="font-serif text-2xl leading-tight text-white md:text-4xl max-w-2xl drop-shadow-sm">
                    {featuredPhoto.title}
                  </h2>
                  {featuredPhoto.caption && (
                    <p className="mt-2 text-white/80 text-sm sm:text-base line-clamp-2 max-w-xl">
                      {featuredPhoto.caption}
                    </p>
                  )}
                </div>

                <div className="absolute top-6 right-6 rounded-full bg-black/40 backdrop-blur-md p-3 text-white border border-white/20 group-hover:bg-primary transition-colors">
                  <Maximize2 size={16} />
                </div>
              </button>
            </section>
          )}

          {/* 2. BARRA DE NAVEGAÇÃO COM BORDAS ARREDONDADAS E BOTÕES TOP */}
          <section className="rounded-3xl border border-stone-200 bg-white/90 p-4 shadow-md backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Barra comum de navegação de temas */}
              <div
                className="flex flex-wrap items-center gap-2"
                role="navigation"
                aria-label="Navegação por temas"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    aria-pressed={filter === cat}
                    className={`min-h-[44px] rounded-2xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      filter === cat
                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                        : "bg-stone-50 border border-stone-200/80 text-stone-600 hover:border-primary/40 hover:bg-stone-100 hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Botão de busca / filtros complementares */}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors hover:border-primary hover:bg-stone-100 hover:text-primary"
              >
                <Filter size={14} />
                <span>{showFilters ? "Ocultar Busca" : "Buscar & Filtros"}</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
                <div className="relative group w-full max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-primary"
                    size={16}
                  />
                  <input
                    type="text"
                    aria-label="Buscar momentos fotográficos"
                    placeholder="Buscar por título, legenda ou tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    {filteredPhotos.length} Registros
                  </p>
                  <div className="h-4 w-px bg-stone-200" aria-hidden />
                  <div className="flex gap-3 text-xs font-bold uppercase tracking-widest text-stone-600">
                    <button
                      onClick={() => setSort("curadoria")}
                      className={`min-h-[36px] px-2 transition-colors ${
                        sort === "curadoria"
                          ? "text-primary underline decoration-2 underline-offset-4"
                          : "hover:text-primary"
                      }`}
                    >
                      Recentes
                    </button>
                    <button
                      onClick={() => setSort("az")}
                      className={`min-h-[36px] px-2 transition-colors ${
                        sort === "az"
                          ? "text-primary underline decoration-2 underline-offset-4"
                          : "hover:text-primary"
                      }`}
                    >
                      A-Z
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 3. GRID CONTENT COM ANÁLISE DE COR PREDOMINANTE E ÍCONES ELEGANTES */}
          <div className="grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotos.map((photo, index) => (
              <GalleryGridCard
                key={photo.id}
                photo={photo}
                index={index}
                onOpen={(e) => openLightbox(index, e.currentTarget)}
              />
            ))}

            {filteredPhotos.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 py-20">
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

      {/* 4. LIGHTBOX ADAPTATIVO COM BOTÕES EVIDENTES E LATERAL COM PAPEL & ANO */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-dialog-title"
          >
            {/* Botão Fechar em Alto Contraste */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Fechar visualização da imagem"
              className="absolute right-4 top-4 z-[120] inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-800 border-2 border-stone-200 shadow-2xl transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-6 sm:top-6 cursor-pointer"
            >
              <X size={22} />
            </button>

            {/* Janela Adaptativa */}
            <div
              className="relative flex max-h-[92vh] w-[min(96vw,1320px)] flex-col overflow-hidden rounded-3xl bg-paper shadow-2xl lg:flex-row border border-stone-200/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Espaço da Foto Adaptativo (preenche todo o espaço) */}
              <div className="relative flex min-h-[50vh] lg:min-h-[70vh] min-w-0 flex-1 items-center justify-center bg-stone-950 p-2 sm:p-4">
                <div className="relative h-full w-full flex items-center justify-center">
                  <GalleryImage
                    src={filteredPhotos[selectedPhotoIndex].src}
                    alt={filteredPhotos[selectedPhotoIndex].title}
                    width={filteredPhotos[selectedPhotoIndex].width}
                    height={filteredPhotos[selectedPhotoIndex].height}
                    fit="contain"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    className="h-full w-full flex items-center justify-center"
                    imageClassName="object-contain max-h-[78vh] w-auto h-auto mx-auto rounded-lg"
                  />
                </div>

                {/* 5. BOTÕES DE NAVEGAÇÃO EVIDENTES COM BORDAS E SOMBREADO */}
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary border-2 border-primary/20 shadow-2xl transition-all duration-200 hover:bg-primary hover:text-white hover:border-gold hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowLeft size={20} />
                </button>

                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary border-2 border-primary/20 shadow-2xl transition-all duration-200 hover:bg-primary hover:text-white hover:border-gold hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* 6. LATERAL DIREITA: TÍTULO, ANO, DESCRIÇÃO E EFEITO SUAVE DE PAPEL */}
              <div
                className="flex max-h-[38vh] w-full shrink-0 flex-col overflow-y-auto border-t border-stone-200/80 p-6 sm:p-8 lg:max-h-none lg:w-[380px] lg:border-l lg:border-t-0"
                style={{
                  backgroundColor: "#faf6ee",
                  backgroundImage:
                    "radial-gradient(rgba(180, 165, 140, 0.28) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {/* Cabeçalho do Card: Categoria & Ano com Destaque */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    {filteredPhotos[selectedPhotoIndex].category ||
                      "Galeria Figura Viva"}
                  </span>

                  {(filteredPhotos[selectedPhotoIndex].year ||
                    filteredPhotos[selectedPhotoIndex].ano) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-bold text-primary tracking-wide">
                      <Calendar size={11} />
                      Ano: {filteredPhotos[selectedPhotoIndex].year || filteredPhotos[selectedPhotoIndex].ano}
                    </span>
                  )}
                </div>

                <h3
                  id="gallery-dialog-title"
                  className="font-serif text-2xl font-medium text-primary mb-3 leading-tight"
                >
                  {filteredPhotos[selectedPhotoIndex].title}
                </h3>

                <div className="mb-5 h-0.5 w-12 bg-gold/70" aria-hidden="true" />

                <div className="mb-6 flex-1">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">
                    {filteredPhotos[selectedPhotoIndex].caption ||
                      "Registro visual dos encontros, práticas e vivências do Instituto Figura Viva."}
                  </p>
                </div>

                {/* Tags / Temas */}
                <div className="mt-auto pt-4 border-t border-stone-200/70">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                    <Tag size={11} /> Temas & Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(filteredPhotos[selectedPhotoIndex].tags)
                      ? filteredPhotos[selectedPhotoIndex].tags
                      : typeof filteredPhotos[selectedPhotoIndex].tags ===
                          "string"
                        ? filteredPhotos[selectedPhotoIndex].tags.split(",")
                        : []
                    ).map((tag: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-white/90 border border-stone-200/80 px-2.5 py-1 text-[10px] font-medium text-primary shadow-2xs"
                      >
                        {String(tag).trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS Animation for Ken Burns effect */}
      <style jsx global>{`
        .gallery-feature-motion { animation: fvKenBurns 22s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) { .gallery-feature-motion { animation: none; } }
        @keyframes fvKenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          50% {
            transform: scale(1.08) translate(-1%, -0.8%);
          }
          100% {
            transform: scale(1.03) translate(1%, 0.5%);
          }
        }
      `}</style>
    </div>
  );
}

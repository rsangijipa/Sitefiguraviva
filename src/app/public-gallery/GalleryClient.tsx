"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { GalleryImage } from "@/features/public-site/gallery/GalleryImage";
import { normalizeGalleryMedia } from "@/features/public-site/gallery/gallery-media";
import {
  GALLERY_FALLBACK_COLOR,
  computeDominantColorFromUrl,
  overlayBackground,
} from "@/features/public-site/gallery/dominant-color";
import {
  GalleryLightbox,
  photoTags,
  type LightboxPhoto,
} from "@/features/public-site/gallery/GalleryLightbox";
import styles from "./gallery.module.css";

const THEMES = [
  "Formação",
  "Encontros",
  "Vivências",
  "Comunidade",
  "Workshops",
  "Eventos",
  "Espaço",
];

type GalleryPhoto = LightboxPhoto & { dominantColor?: string | null };

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

function matchesTheme(photo: GalleryPhoto, theme: string) {
  const haystack = normalizeText(
    `${photo.category ?? ""} ${photoTags(photo.tags).join(" ")} ${photo.title} ${photo.caption ?? ""}`,
  );
  return haystack.includes(normalizeText(theme));
}

// Cores calculadas no navegador para fotos antigas, uma vez por visita.
const computedColors = new Map<string, Promise<string | null>>();

function GalleryGridCard({
  photo,
  onOpen,
}: {
  photo: GalleryPhoto;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const [color, setColor] = useState<string>(
    photo.dominantColor || GALLERY_FALLBACK_COLOR,
  );
  const tags = photoTags(photo.tags);
  const year = photo.year ?? photo.ano;

  // Só calcula quando a pessoa chega na foto e não há cor guardada.
  const ensureColor = useCallback(() => {
    if (photo.dominantColor || !photo.src) return;
    let pending = computedColors.get(photo.src);
    if (!pending) {
      pending = computeDominantColorFromUrl(photo.src);
      computedColors.set(photo.src, pending);
    }
    void pending.then((value) => value && setColor(value));
  }, [photo.dominantColor, photo.src]);

  return (
    <button
      type="button"
      aria-label={`Abrir foto: ${photo.title}${year ? `, ${year}` : ""}`}
      className={`${styles.card} group relative block w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 text-left shadow-md transition-shadow duration-300 hover:shadow-xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary`}
      onPointerEnter={ensureColor}
      onFocus={ensureColor}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      <GalleryImage
        src={photo.src}
        alt=""
        width={4}
        height={3}
        className="h-full w-full"
        imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      {year && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {year}
        </span>
      )}
      <span
        aria-hidden="true"
        className="absolute left-2.5 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm"
      >
        <Maximize2 size={12} />
      </span>

      <div
        className={`${styles.overlay} absolute inset-0 flex flex-col justify-end p-4 backdrop-blur-[2px]`}
        style={{ backgroundColor: overlayBackground(color) }}
      >
        <div className={styles.overlayContent}>
          {photo.category && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
              {photo.category}
            </p>
          )}
          <p className="line-clamp-2 font-serif text-lg font-medium leading-snug text-white">
            {photo.title}
          </p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/30 bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function GalleryClient({
  initialGallery,
}: {
  initialGallery: any[];
}) {
  const [theme, setTheme] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const photos = useMemo<GalleryPhoto[]>(
    () =>
      (Array.isArray(initialGallery) ? initialGallery : []).map((photo) => ({
        ...photo,
        ...normalizeGalleryMedia(photo),
        id: String(photo.id),
      })),
    [initialGallery],
  );

  const themes = useMemo(
    () => [
      "Todos",
      ...THEMES.filter((name) =>
        photos.some((photo) => matchesTheme(photo, name)),
      ),
    ],
    [photos],
  );

  const filtered = useMemo(() => {
    const query = normalizeText(search.trim());
    return photos.filter(
      (photo) =>
        (theme === "Todos" || matchesTheme(photo, theme)) &&
        (!query ||
          normalizeText(
            `${photo.title} ${photo.caption ?? ""} ${photoTags(photo.tags).join(" ")}`,
          ).includes(query)),
    );
  }, [photos, theme, search]);

  const featured = photos[0];

  const open = (index: number, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setSelected(index);
  };

  const close = () => {
    setSelected(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  };

  // O destaque abre dentro da lista completa, mesmo que um filtro o esconda.
  const [lightboxPhotos, setLightboxPhotos] = useState<GalleryPhoto[]>([]);
  const openFrom = (
    list: GalleryPhoto[],
    index: number,
    trigger: HTMLButtonElement,
  ) => {
    setLightboxPhotos(list);
    open(index, trigger);
  };

  return (
    <div className="fv-bg fv-bg-gallery flex min-h-screen flex-col bg-paper">
      <Navbar />

      <PublicPageHero
        eyebrow="Confluência"
        title="Galeria de imagens"
        description="Um registro visual dos encontros, vivências e da beleza que floresce no Instituto Figura Viva."
        backgroundImage="/assets/fv/heroes/galeria.webp"
      />

      <div className="fv-container flex-1 pb-20 pt-12">
        <div className="space-y-10">
          {featured && (
            <section aria-labelledby="gallery-featured-title">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-gold-dark">
                Momento em destaque
              </p>
              <button
                type="button"
                onClick={(event) => openFrom(photos, 0, event.currentTarget)}
                aria-label={`Abrir foto em destaque: ${featured.title}`}
                className="group relative block h-[340px] w-full overflow-hidden rounded-3xl border border-stone-200 text-left shadow-xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-[460px]"
              >
                <div className={styles.kenBurns}>
                  <GalleryImage
                    src={featured.src}
                    alt=""
                    width={featured.width}
                    height={featured.height}
                    priority
                    sizes="100vw"
                    className="h-full w-full"
                    imageClassName="object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 sm:p-10">
                  <span className="mb-2 text-xs font-bold uppercase tracking-widest text-white/85">
                    {[featured.category, featured.year ?? featured.ano]
                      .filter(Boolean)
                      .join(" · ") || "Destaque"}
                  </span>
                  <h2
                    id="gallery-featured-title"
                    className="max-w-2xl font-serif text-2xl leading-tight text-white drop-shadow md:text-4xl"
                  >
                    {featured.title}
                  </h2>
                  {featured.caption && (
                    <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/85 sm:text-base">
                      {featured.caption}
                    </p>
                  )}
                </div>
              </button>
            </section>
          )}

          {/* Barra de navegação por temas */}
          <nav
            aria-label="Temas da galeria"
            className="sticky top-20 z-20 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-md backdrop-blur-md sm:p-3"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
                {themes.map((name) => (
                  <li key={name} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setTheme(name)}
                      aria-pressed={theme === name}
                      className={`min-h-11 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        theme === name
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                />
                <input
                  type="search"
                  aria-label="Buscar momentos"
                  placeholder="Buscar fotos…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-10 text-sm text-stone-800 outline-none placeholder:text-stone-500 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Limpar busca"
                    className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:text-primary"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </nav>

          <p
            className="text-xs font-semibold uppercase tracking-widest text-stone-600"
            role="status"
          >
            {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
          </p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((photo, index) => (
              <li key={photo.id}>
                <GalleryGridCard
                  photo={photo}
                  onOpen={(trigger) => openFrom(filtered, index, trigger)}
                />
              </li>
            ))}
          </motion.ul>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 py-16">
              <EmptyState
                icon={Search}
                title="Nenhuma foto encontrada"
                description="Tente outro tema ou outra palavra na busca."
                className="border-none bg-transparent shadow-none"
              />
            </div>
          )}
        </div>
      </div>

      <Footer />

      {selected !== null && lightboxPhotos[selected] && (
        <GalleryLightbox
          photos={lightboxPhotos}
          index={selected}
          onIndexChange={setSelected}
          onClose={close}
        />
      )}
    </div>
  );
}

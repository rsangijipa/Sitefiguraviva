"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Calendar, X } from "lucide-react";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import styles from "./GalleryLightbox.module.css";

export interface LightboxPhoto {
  id: string;
  src: string;
  title: string;
  caption?: string | null;
  category?: string | null;
  year?: string | number | null;
  ano?: string | number | null;
  tags?: string[] | string | null;
  width?: number;
  height?: number;
}

export function photoTags(tags: LightboxPhoto["tags"]): string[] {
  if (Array.isArray(tags))
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === "string")
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  return [];
}

const FOCUSABLE =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function GalleryLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const photo = photos[index];
  const windowRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Proporção real medida ao carregar; começa pelo que o banco informa.
  const [ratio, setRatio] = useState<number>(() =>
    photo?.width && photo?.height ? photo.width / photo.height : 4 / 3,
  );

  useBodyScrollLock(true);

  useEffect(() => {
    if (photo?.width && photo?.height) setRatio(photo.width / photo.height);
  }, [photo?.id, photo?.width, photo?.height]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const count = photos.length;
  const go = (delta: number) => {
    if (count > 1) onIndexChange((index + delta + count) % count);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "Tab" && windowRef.current) {
        const items = [
          ...windowRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (
          event.shiftKey &&
          (active === first || !windowRef.current.contains(active))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (active === last || !windowRef.current.contains(active))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  if (!photo) return null;
  const year = photo.year ?? photo.ano;
  const tags = photoTags(photo.tags);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-lightbox-title"
        className={styles.window}
        style={{ "--ar": ratio } as CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar foto"
          className={styles.close}
        >
          <X size={22} aria-hidden="true" />
        </button>

        <div className={styles.photo}>
          <Image
            key={photo.id}
            src={photo.src}
            alt={photo.title}
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 75vw"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setRatio(img.naturalWidth / img.naturalHeight);
              }
            }}
          />
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={() => go(-1)}
                className={`${styles.nav} ${styles.prev}`}
              >
                <ArrowLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Próxima foto"
                onClick={() => go(1)}
                className={`${styles.nav} ${styles.next}`}
              >
                <ArrowRight size={22} aria-hidden="true" />
              </button>
              <span className={styles.counter} aria-live="polite">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>

        <aside className={styles.panel}>
          <div className={styles.meta}>
            <span>{photo.category || "Galeria Figura Viva"}</span>
            {year ? (
              <span className={styles.year}>
                <Calendar size={12} aria-hidden="true" />
                <span className="sr-only">Ano: </span>
                {year}
              </span>
            ) : null}
          </div>
          <h2 id="gallery-lightbox-title" className={styles.title}>
            {photo.title}
          </h2>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.caption}>
            {photo.caption?.trim() ||
              "Registro dos encontros, práticas e vivências do Instituto Figura Viva."}
          </p>
          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Temas da foto">
              {tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

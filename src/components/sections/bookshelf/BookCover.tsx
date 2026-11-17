"use client";
import { useState } from "react";
import Image from "next/image";
import type { Livro } from "../BookshelfSection";
import styles from "./Bookshelf.module.css";

export function safeBookUrl(value: string | null | undefined): string | null {
  try {
    const url = new URL(value || "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function BookCover({
  book,
  sizes,
  fillContainer = true,
}: {
  book: Livro;
  sizes: string;
  fillContainer?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = safeBookUrl(book.coverImageUrl);
  const optimized =
    source &&
    new URL(source).protocol === "https:" &&
    (new URL(source).hostname.endsWith(".supabase.co") ||
      [
        "firebasestorage.googleapis.com",
        "storage.googleapis.com",
        "lh3.googleusercontent.com",
      ].includes(new URL(source).hostname));

  return (
    <div className={styles.realisticBookWrapper}>
      {source && failedSource !== source ? (
        <Image
          src={source}
          alt={`Capa do livro ${book.title}`}
          fill
          sizes={sizes}
          loading="lazy"
          unoptimized={!optimized}
          className={styles.coverImage}
          onError={() => setFailedSource(source)}
        />
      ) : (
        <span
          className={styles.missingCover}
          role="img"
          aria-label={`Capa indisponível: ${book.title}`}
        >
          <span>{book.title}</span>
          <small>{book.author}</small>
          <small>{book.publicationYear ? `(${book.publicationYear})` : "Figura Viva"}</small>
        </span>
      )}

      {/* Camadas realistas de capa: lombada 3D, vinco da dobra, brilho suave e espessura das páginas */}
      <span className={styles.spineHighlight} aria-hidden="true" />
      <span className={styles.hingeCrease} aria-hidden="true" />
      <span className={styles.coverSheen} aria-hidden="true" />
      <span className={styles.pageEdgeEffect} aria-hidden="true" />
    </div>
  );
}

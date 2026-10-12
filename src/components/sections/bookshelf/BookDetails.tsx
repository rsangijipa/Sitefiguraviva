"use client";
import { useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";
import type { Livro } from "../BookshelfSection";
import BookCover, { safeBookUrl } from "./BookCover";
import styles from "./Bookshelf.module.css";

export default function BookDetails({
  book,
  onClose,
}: {
  book: Livro;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = originalOverflow;
      opener?.focus();
    };
  }, []);
  const purchaseUrl = safeBookUrl(book.purchaseUrl);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="book-detail-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href]",
          ),
        ];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <header className={styles.dialogHeader}>
        <p className={styles.eyebrow}>Um livro, um encontro</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do livro"
          className={styles.close}
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <div className={styles.dialogBody} data-lenis-prevent>
        <div className={styles.dialogCover}>
          <BookCover book={book} sizes="(max-width: 639px) 150px, 210px" />
        </div>
        <div className={styles.dialogCopy}>
          {book.category && <p className={styles.eyebrow}>{book.category}</p>}
          <h2 id="book-detail-title">{book.title}</h2>
          <p className={styles.author}>{book.author}</p>
          <p className={styles.year}>
            {book.publicationYear != null
              ? `Publicado em ${book.publicationYear}`
              : "Ano de publicação não informado"}
          </p>
          <p className={styles.description}>
            {book.description?.trim() ||
              "A apresentação desta obra será compartilhada em breve pela nossa equipe."}
          </p>
          {purchaseUrl ? (
            <a
              href={purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.purchase}
            >
              Onde encontrar <ExternalLink size={17} aria-hidden="true" />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          ) : (
            <p className={styles.year}>Link externo indisponível no momento.</p>
          )}
        </div>
      </div>
    </dialog>
  );
}

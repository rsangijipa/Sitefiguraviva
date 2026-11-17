"use client";
import { useEffect, useRef } from "react";
import { ExternalLink, X, BookOpen, Calendar, User } from "lucide-react";
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
        ) {
          onClose();
        }
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
      {/* Barra superior com o título do livro */}
      <header className={styles.dialogHeader}>
        <div className={styles.dialogHeaderCopy}>
          <p className={styles.eyebrow}>
            {book.category || "Gestalt-Terapia · Literatura Clínica"}
          </p>
          <h2 id="book-detail-title" className={styles.dialogTopTitle}>
            {book.title}
          </h2>
        </div>
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
        {/* Capa do livro preenchendo todo o espaço */}
        <div className={styles.dialogCoverFull}>
          <BookCover
            book={book}
            sizes="(max-width: 639px) 100vw, 360px"
            fillContainer={true}
          />
        </div>

        {/* Detalhes, autores e ano em destaque */}
        <div className={styles.dialogCopy}>
          {/* Card de destaque de autores e ano */}
          <div className={styles.metaHighlightCard}>
            <div className={styles.metaHighlightItem}>
              <span className={styles.metaLabel}>
                <User size={13} aria-hidden="true" /> Autoria
              </span>
              <p className={styles.metaAuthor}>{book.author}</p>
            </div>

            <div className={styles.metaHighlightItem}>
              <span className={styles.metaLabel}>
                <Calendar size={13} aria-hidden="true" /> Ano de Publicação
              </span>
              <p className={styles.metaYear}>
                {book.publicationYear != null ? (
                  <span className={styles.yearBadge}>{book.publicationYear}</span>
                ) : (
                  <span className={styles.yearMuted}>Não informado</span>
                )}
              </p>
            </div>
          </div>

          {/* Texto e sinopse da obra abaixo */}
          <div className={styles.descriptionBlock}>
            <h3 className={styles.descriptionSectionTitle}>
              <BookOpen size={16} aria-hidden="true" /> Sobre esta Leitura
            </h3>
            <p className={styles.description}>
              {book.description?.trim() ||
                "Uma das referências fundamentais selecionadas pela equipe do Instituto Figura Viva para o diálogo com a clínica, o pensamento gestáltico e a sensibilidade humana."}
            </p>
          </div>

          {purchaseUrl ? (
            <div className={styles.dialogActionWrap}>
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.purchase}
              >
                Onde encontrar / Adquirir obra
                <ExternalLink size={17} aria-hidden="true" />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </div>
          ) : (
            <p className={styles.yearMuted}>
              Obra de referência disponível no acervo do Instituto Figura Viva.
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}

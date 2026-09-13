"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";

/**
 * Estante pública — curadoria administrada em /admin/books.
 * Capas só existem aqui quando a equipe confirma autorização de uso no
 * formulário do Admin; o componente em si não valida isso, apenas exibe
 * o que já foi aprovado editorialmente.
 */
export interface Livro {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImageUrl: string;
  purchaseUrl: string;
  publicationYear?: number | null;
}

export default function BookshelfSection({ livros }: { livros: Livro[] }) {
  const [selected, setSelected] = useState<Livro | null>(null);

  useEffect(() => {
    if (!selected) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleEsc);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalOverflow;
    };
  }, [selected]);

  return (
    <section
      aria-labelledby="estante-titulo"
      className="fv-section fv-section--cream fv-bg border-t border-border"
    >
      <div className="fv-container">
        <div className="mb-12 max-w-2xl">
          <span className="fv-eyebrow mb-4">Leituras</span>
          <h2 id="estante-titulo" className="heading-section">
            Estante de preferidos
          </h2>
          <p className="fv-lead mt-4">
            Obras que atravessam a formação e a clínica no Instituto. As
            referências levam ao catálogo do editor — o acervo em texto integral
            fica na Biblioteca.
          </p>
        </div>

        {livros.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-paper px-6 py-16 text-center">
            <p className="fv-lead text-text/60">Estante em preparação.</p>
          </div>
        ) : (
          <ul className="book-shelf grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {livros.map((livro) => (
              <li key={livro.id} className="book-card group flex">
                <button
                  type="button"
                  onClick={() => setSelected(livro)}
                  aria-label={`Ver detalhes de ${livro.title}, de ${livro.author}`}
                  className="touch-manipulation flex w-full flex-col overflow-hidden rounded-lg border border-border bg-paper text-left shadow-sm outline-offset-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {/* Proporção fixa 2:3 + object-cover: toda capa enviada no Admin
                      é recortada para este mesmo tamanho, independente das
                      dimensões originais do arquivo. */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-areia">
                    <Image
                      src={livro.coverImageUrl}
                      alt={`Capa do livro ${livro.title}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <span className="font-serif text-sm font-semibold leading-snug text-primary">
                      {livro.title}
                    </span>
                    <span className="text-xs text-text/70">{livro.author}</span>
                    {livro.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text/60">
                        {livro.description}
                      </p>
                    )}
                    <span className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                      Saiba mais
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-primary/30 backdrop-blur-sm"
                onClick={() => setSelected(null)}
              >
                <div className="flex min-h-full items-center justify-center p-0 sm:p-4 sm:py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="book-detail-title"
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full max-w-2xl flex-col overflow-hidden overscroll-contain bg-paper shadow-2xl sm:flex-row sm:rounded-xl h-full max-h-dvh sm:h-auto sm:max-h-[calc(100dvh-4rem)]"
                  >
                    <div className="relative flex w-full shrink-0 items-center justify-center border-b border-border bg-areia p-6 sm:w-60 sm:border-b-0 sm:border-r">
                      <div className="relative aspect-[2/3] w-full max-w-[190px] overflow-hidden rounded-md border border-border shadow-md">
                        <Image
                          src={selected.coverImageUrl}
                          alt={`Capa do livro ${selected.title}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 60vw, 190px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        aria-label="Fechar"
                        className="touch-manipulation absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/70 text-white backdrop-blur-sm transition-colors hover:bg-primary active:bg-primary sm:hidden"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain bg-paper p-6">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h3
                          id="book-detail-title"
                          className="font-serif text-2xl font-semibold leading-snug text-primary"
                        >
                          {selected.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setSelected(null)}
                          aria-label="Fechar"
                          className="touch-manipulation hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-text/40 transition-colors hover:bg-areia hover:text-primary active:bg-areia sm:flex"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <p className="text-sm text-text/70">{selected.author}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-text/40">
                        {selected.publicationYear
                          ? `Publicado em ${selected.publicationYear}`
                          : "Ano de publicação não informado"}
                      </p>

                      {selected.description && (
                        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text/70">
                          {selected.description}
                        </p>
                      )}

                      <a
                        href={selected.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-manipulation mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gold active:bg-gold sm:w-fit sm:justify-start"
                      >
                        Onde encontrar
                        <ExternalLink size={12} aria-hidden />
                      </a>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

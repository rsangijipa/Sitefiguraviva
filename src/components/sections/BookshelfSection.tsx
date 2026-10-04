"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";

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

const THEMES = [
  "Todos",
  "Gestalt",
  "Fenomenologia",
  "Clínica",
  "Corpo",
  "Arte",
  "Território",
] as const;
type Theme = (typeof THEMES)[number];

function matchesTheme(livro: Livro, theme: Theme): boolean {
  if (theme === "Todos") return true;
  const haystack =
    `${livro.title} ${livro.description ?? ""} ${livro.author}`.toLowerCase();
  return haystack.includes(theme.toLowerCase());
}

export default function BookshelfSection({ livros }: { livros: Livro[] }) {
  const [selected, setSelected] = useState<Livro | null>(null);
  const [theme, setTheme] = useState<Theme>("Todos");

  const [featured, ...rest] = livros;
  const filtered = useMemo(
    () => rest.filter((livro) => matchesTheme(livro, theme)),
    [rest, theme],
  );

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
      aria-label="Estante de preferidos"
      className="fv-section fv-section--cream fv-bg border-t border-border"
    >
      <div className="mb-14">
        <PublicPageHero
          eyebrow="Leituras"
          title="Estante de preferidos"
          description="Obras que atravessam a formação e a clínica no Instituto. As referências levam ao catálogo do editor — o acervo em texto integral fica na Biblioteca."
          backgroundImage="/assets/fv/heroes/estante.png"
        />
      </div>

      <div className="fv-container">
        {livros.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-paper px-6 py-16 text-center">
            <p className="fv-lead text-text/60">Estante em preparação.</p>
          </div>
        ) : (
          <>
            {/* CURADORIA DO MÊS */}
            {featured && (
              <div className="mb-14">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gold">
                  Curadoria do mês
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(featured)}
                  aria-label={`Ver detalhes de ${featured.title}, de ${featured.author}`}
                  className="grid w-full gap-8 border border-border bg-paper p-6 text-left transition-colors hover:border-igarape md:grid-cols-[auto_1fr] md:p-10"
                >
                  <div className="relative mx-auto aspect-[2/3] w-full max-w-[180px] overflow-hidden bg-areia md:mx-0">
                    <Image
                      src={featured.coverImageUrl}
                      alt={`Capa do livro ${featured.title}`}
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-serif text-2xl text-primary md:text-3xl">
                      {featured.title}
                    </h3>
                    <p className="mt-1 text-sm text-text/70">
                      {featured.author}
                      {featured.publicationYear
                        ? ` · ${featured.publicationYear}`
                        : ""}
                    </p>
                    {featured.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-text/65">
                        {featured.description}
                      </p>
                    )}
                    <span className="mt-5 inline-flex w-fit items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                      Saiba mais
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* TEMAS */}
            <div className="mb-10 flex flex-wrap gap-2">
              {THEMES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTheme(option)}
                  aria-pressed={theme === option}
                  className={`min-h-11 rounded-sm border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    theme === option
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-paper text-text/70 hover:border-igarape hover:bg-areia hover:text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* PRATELEIRA */}
            <ul className="book-shelf grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((livro) => (
                <li key={livro.id} className="book-card group flex">
                  <button
                    type="button"
                    onClick={() => setSelected(livro)}
                    aria-label={`Ver detalhes de ${livro.title}, de ${livro.author}`}
                    className="touch-manipulation flex w-full flex-col overflow-hidden rounded-md border border-border bg-paper text-left outline-offset-4 transition-colors duration-300 hover:border-igarape focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {/* Proporção fixa 2:3 + object-cover: toda capa enviada no Admin
                        é recortada para este mesmo tamanho, independente das
                        dimensões originais do arquivo. */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-areia">
                      <Image
                        src={livro.coverImageUrl}
                        alt={`Capa do livro ${livro.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                      />
                    </div>
                    {/* Prateleira: linha Areia/Névoa simulando o apoio do livro */}
                    <div className="h-1.5 border-t border-border bg-areia" />

                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <span className="font-serif text-sm font-semibold leading-snug text-primary">
                        {livro.title}
                      </span>
                      <span className="text-xs text-text/70">
                        {livro.author}
                      </span>
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

            {filtered.length === 0 && (
              <div className="rounded-md border border-dashed border-border bg-paper px-6 py-16 text-center">
                <p className="fv-lead text-text/60">
                  Nenhum livro encontrado para este tema.
                </p>
              </div>
            )}
          </>
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

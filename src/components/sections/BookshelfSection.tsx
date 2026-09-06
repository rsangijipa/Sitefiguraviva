"use client";

import { ExternalLink } from "lucide-react";

/**
 * "Estante de preferidos" — item 10 do plano editorial.
 *
 * Duas decisões que valem a explicação:
 *
 * 1. **Sem capa.** O Design System lembra que capa de livro é obra protegida:
 *    pode ser citada como referência bibliográfica, não reproduzida nem
 *    alterada. Então a estante é tipográfica — a lombada é o próprio título,
 *    em Fraunces, sobre Areia. Nada de imagem de capa, nem gerada por IA.
 *
 * 2. **Sem conteúdo inventado.** A lista vem do acervo que a instituição já
 *    mantém (`publicLibrary`, itens marcados como livro). Se ainda não há
 *    nenhum, a seção não renderiza — uma estante com títulos que o Instituto
 *    nunca indicou seria pior que estante nenhuma.
 */
export interface Livro {
  id: string;
  title: string;
  /** Autoria, editora, ano — o que existir. Exibido como referência. */
  subtitle?: string;
  /** Link externo opcional (catálogo, editora). Nunca um arquivo da obra. */
  url?: string;
}

export default function BookshelfSection({ livros }: { livros: Livro[] }) {
  if (!livros?.length) return null;

  return (
    <section
      aria-labelledby="estante-titulo"
      className="fv-section fv-section--cream fv-bg fv-bg-bookshelf border-t border-border"
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

        <ul className="book-grid grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {livros.map((livro) => {
            const conteudo = (
              <>
                {/* A "lombada": faixa Areia com o título em serifa, girado no
                    desktop para sugerir o livro em pé na prateleira sem
                    desenhar nenhuma capa. */}
                <div className="book-card__cover flex min-h-[7rem] items-end bg-areia p-6 transition-colors group-hover:bg-nevoa">
                  <span className="font-serif text-xl font-semibold leading-snug text-primary">
                    {livro.title}
                  </span>
                </div>
                <div className="book-card__meta flex flex-1 flex-col p-6">
                  {livro.subtitle && (
                    <p className="text-sm leading-relaxed text-text/75">
                      {livro.subtitle}
                    </p>
                  )}
                  {livro.url && (
                    <span className="mt-auto flex items-center gap-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-primary">
                      Ver referência
                      <ExternalLink size={12} aria-hidden />
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <li key={livro.id} className="book-card group flex bg-paper">
                {livro.url ? (
                  <a
                    href={livro.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full flex-col transition-colors hover:bg-areia/40"
                  >
                    {conteudo}
                  </a>
                ) : (
                  <div className="flex w-full flex-col">{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

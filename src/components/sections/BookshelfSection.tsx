import Image from "next/image";
import { ExternalLink } from "lucide-react";

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
}

export default function BookshelfSection({ livros }: { livros: Livro[] }) {
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
          <ul className="book-shelf grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {livros.map((livro) => (
              <li key={livro.id} className="book-card group flex flex-col">
                <a
                  href={livro.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver onde encontrar ${livro.title}, de ${livro.author} (abre em nova aba)`}
                  className="flex flex-col rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm border border-border bg-areia shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <Image
                      src={livro.coverImageUrl}
                      alt={`Capa do livro ${livro.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                    />
                  </div>

                  {/* Sombra discreta sob a capa, sugerindo a prateleira sem desenhar uma. */}
                  <div className="mx-2 h-2 rounded-b-sm bg-gradient-to-b from-border/60 to-transparent" />

                  <div className="mt-4 flex flex-1 flex-col gap-1">
                    <span className="font-serif text-base font-semibold leading-snug text-primary">
                      {livro.title}
                    </span>
                    <span className="text-sm text-text/70">{livro.author}</span>
                    {livro.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text/60">
                        {livro.description}
                      </p>
                    )}
                    <span className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                      Onde encontrar
                      <ExternalLink size={12} aria-hidden />
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

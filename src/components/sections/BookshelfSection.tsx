"use client";
import { useMemo, useState } from "react";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import { ArrowDown, ArrowUpRight, Search, X } from "lucide-react";
import BookCover from "./bookshelf/BookCover";
import BookDetails from "./bookshelf/BookDetails";
import styles from "./bookshelf/Bookshelf.module.css";

export interface Livro {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  coverImageUrl: string | null;
  purchaseUrl: string | null;
  publicationYear?: number | null;
  category?: string | null;
}
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

export default function BookshelfSection({
  livros,
  loadError = false,
}: {
  livros: Livro[];
  loadError?: boolean;
}) {
  const [selected, setSelected] = useState<Livro | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const categories = useMemo(
    () =>
      [
        ...new Set(
          livros
            .map((book) => book.category?.trim())
            .filter((value): value is string => !!value),
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [livros],
  );
  const filtered = useMemo(() => {
    const search = normalize(query.trim());
    return livros.filter(
      (book) =>
        (!category || book.category?.trim() === category) &&
        (!search || normalize(`${book.title} ${book.author}`).includes(search)),
    );
  }, [livros, query, category]);
  const featured = livros[0];
  return (
    <div className={styles.page}>
      <PublicPageHero
        eyebrow="Leituras"
        title="Uma estante de encontros"
        description="Livros que atravessam a clínica, acompanham a formação e ampliam nossos modos de estar no mundo."
        backgroundImage="/assets/fv/heroes/estante.webp"
        actions={
          <a href="#acervo" className={styles.textLink}>
            Percorrer a estante <ArrowDown size={16} aria-hidden="true" />
          </a>
        }
      />
      <div className={styles.container}>
        {featured && (
          <section
            className={styles.featured}
            aria-labelledby="featured-heading"
          >
            <div className={styles.featuredCover}>
              <button
                type="button"
                onClick={() => setSelected(featured)}
                aria-label={`Ver detalhes de ${featured.title}, de ${featured.author}`}
                className={styles.featuredTrigger}
                aria-haspopup="dialog"
              >
                <BookCover
                  book={featured}
                  sizes="(max-width: 639px) 180px, 240px"
                />
              </button>
            </div>
            <div className={styles.featuredCopy}>
              <p className={styles.eyebrow}>Um encontro para começar</p>
              <h2 id="featured-heading">{featured.title}</h2>
              <p className={styles.author}>
                {featured.author}
                {featured.publicationYear != null
                  ? ` · ${featured.publicationYear}`
                  : ""}
              </p>
              <p className={styles.featuredDescription}>
                {featured.description?.trim() ||
                  "Uma das leituras escolhidas pela equipe do Instituto para acompanhar nossos encontros com a clínica e a formação."}
              </p>
              <button
                type="button"
                className={styles.textLink}
                onClick={() => setSelected(featured)}
              >
                Conhecer esta leitura{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
        <section
          id="acervo"
          aria-labelledby="shelf-heading"
          className={styles.collection}
        >
          <div className={styles.collectionHeading}>
            <div>
              <p className={styles.eyebrow}>Escolhas que nos acompanham</p>
              <h2 id="shelf-heading">Na nossa estante</h2>
            </div>
            <p>
              Escolha uma capa.
              <br />
              Deixe a leitura abrir uma conversa.
            </p>
          </div>
          {livros.length > 0 && (
            <div className={styles.tools}>
              <label className={styles.search}>
                <Search size={19} aria-hidden="true" />
                <span className="sr-only">Buscar por título ou autor</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por título ou autor"
                  aria-controls="bookshelf-results"
                />
              </label>
              <div
                className={styles.filters}
                role="group"
                aria-label="Filtrar por categoria"
              >
                <button
                  type="button"
                  aria-pressed={category === null}
                  onClick={() => setCategory(null)}
                >
                  Todas as leituras
                </button>
                {categories.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p
            className={styles.resultCount}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} {filtered.length === 1 ? "leitura" : "leituras"}
            {query || category
              ? filtered.length === 1
                ? " encontrada"
                : " encontradas"
              : " na estante"}
          </p>
          <div id="bookshelf-results">
            {filtered.length > 0 ? (
              <ul className={styles.shelves} aria-label="Livros da estante">
                {filtered.map((book) => (
                  <li key={book.id} className={styles.book}>
                    <button
                      type="button"
                      className={styles.coverTrigger}
                      onClick={() => setSelected(book)}
                      aria-label={`Ver detalhes de ${book.title}, de ${book.author}`}
                      aria-haspopup="dialog"
                    >
                      <span className={styles.cover}>
                        <BookCover
                          book={book}
                          sizes="(max-width: 449px) 42vw, (max-width: 699px) 28vw, (max-width: 999px) 21vw, (max-width: 1199px) 17vw, (max-width: 1399px) 14vw, 170px"
                        />
                      </span>
                    </button>
                    <div className={styles.caption}>
                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                      <p className={styles.bookDescription}>
                        {book.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <h3>
                  {loadError
                    ? "A estante está temporariamente indisponível."
                    : livros.length === 0
                      ? "Nossa estante está em preparação."
                      : "Ainda não encontramos essa leitura."}
                </h3>
                <p>
                  {loadError
                    ? "Tente carregar a página novamente em alguns instantes."
                    : livros.length === 0
                      ? "Em breve, novas referências para nossos encontros."
                      : "Experimente outro título, autor ou categoria."}
                </p>
                {(query || category) && (
                  <button
                    type="button"
                    className={styles.textLink}
                    onClick={() => {
                      setQuery("");
                      setCategory(null);
                    }}
                  >
                    Limpar busca e filtros <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
        <aside className={styles.invitation}>
          <p className={styles.eyebrow}>Uma leitura leva a outra</p>
          <h2>
            Há sempre um novo
            <br />
            encontro entre as páginas.
          </h2>
          <p>
            Volte a esta estante. Nossa curadoria acompanha as perguntas que
            nascem na clínica, na formação e na vida.
          </p>
          <a href="#acervo" className={styles.textLink}>
            Descobrir outras leituras{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </aside>
      </div>
      {selected && (
        <BookDetails book={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

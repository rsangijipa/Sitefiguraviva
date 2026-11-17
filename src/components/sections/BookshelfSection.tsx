"use client";
import { useMemo, useState } from "react";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import { ArrowDown, ArrowUpRight, Search, X, BookOpen, Sparkles } from "lucide-react";
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
        {/* LIVRO EM DESTAQUE - Card com bordas arredondadas e fundo de traçados aquarela */}
        {featured && (
          <section
            className={styles.featuredCard}
            aria-labelledby="featured-heading"
          >
            <div className={styles.featuredWatercolorBg} aria-hidden="true" />

            <div className={styles.featuredContent}>
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
                <span className={styles.featuredBadge}>
                  <Sparkles size={12} /> Obra em Destaque
                </span>
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
                    "Uma das leituras fundamentais escolhidas pela equipe do Instituto para acompanhar nossos encontros com a clínica, a arte e a formação."}
                </p>
                <button
                  type="button"
                  className={styles.featuredOpenBtn}
                  onClick={() => setSelected(featured)}
                >
                  <BookOpen size={16} /> Conhecer esta leitura{" "}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ÁREA DA ESTANTE: CARD COM EFEITO DE PROFUNDIDADE E BARRA DE PESQUISA */}
        <section
          id="acervo"
          aria-labelledby="shelf-heading"
          className={styles.collection}
        >
          <div className={styles.shelfHeaderCard}>
            <div className={styles.shelfHeaderMain}>
              <div className={styles.shelfHeaderTitles}>
                <p className={styles.eyebrow}>Escolhas que nos acompanham</p>
                <h2 id="shelf-heading">Na nossa estante</h2>
                <p className={styles.shelfSubtitle}>
                  Escolha uma capa. Deixe a leitura abrir uma conversa.
                </p>
              </div>

              {/* Barra de pesquisa normal à frente da nossa estante */}
              <div className={styles.searchBarWrap}>
                <label className={styles.searchBarNormal}>
                  <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                  <span className="sr-only">Buscar por título ou autor</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por título ou autor..."
                    aria-label="Buscar por título ou autor na estante"
                    aria-controls="bookshelf-results"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className={styles.clearSearchBtn}
                      aria-label="Limpar busca"
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
              </div>
            </div>

            {/* Categorias */}
            {categories.length > 0 && (
              <div
                className={styles.filters}
                role="group"
                aria-label="Filtrar por categoria"
              >
                <button
                  type="button"
                  aria-pressed={category === null}
                  onClick={() => setCategory(null)}
                  className={styles.filterPill}
                >
                  Todas as leituras
                </button>
                {categories.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                    className={styles.filterPill}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>

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

          {/* ESTANTE REALISTA */}
          <div id="bookshelf-results">
            {filtered.length > 0 ? (
              <div className={styles.realisticBookshelfStructure}>
                {/* Lado esquerdo da estante */}
                <div className={styles.shelfPillarLeft} aria-hidden="true" />

                <ul className={styles.shelvesGrid} aria-label="Livros na estante">
                  {filtered.map((book) => (
                    <li key={book.id} className={styles.bookItem}>
                      <div className={styles.bookStage}>
                        {/* Capa com efeito 3D realista */}
                        <div
                          className={styles.bookCoverWrapper}
                          onClick={() => setSelected(book)}
                        >
                          <BookCover
                            book={book}
                            sizes="(max-width: 449px) 42vw, (max-width: 699px) 28vw, (max-width: 999px) 21vw, (max-width: 1199px) 17vw, 180px"
                          />
                        </div>

                        {/* Card interativo na frente ao passar o mouse */}
                        <div className={styles.bookHoverCard}>
                          <span className={styles.hoverCategoryTag}>
                            {book.category || "Arte-terapia · Gestalt"}
                          </span>
                          <h4 className={styles.hoverTitle}>{book.title}</h4>
                          <p className={styles.hoverAuthor}>{book.author}</p>
                          <p className={styles.hoverSummary}>
                            {book.description?.trim() ||
                              "Obra de referência clínica e expressiva selecionada pelo Instituto Figura Viva."}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelected(book)}
                            className={styles.hoverOpenBtn}
                            aria-haspopup="dialog"
                          >
                            <BookOpen size={14} /> Abrir detalhes
                          </button>
                        </div>
                      </div>

                      {/* Tábua de madeira realista da estante */}
                      <div className={styles.shelfWoodPlank} aria-hidden="true">
                        <div className={styles.shelfWoodTop} />
                        <div className={styles.shelfWoodBevel} />
                        <div className={styles.shelfWoodShadow} />
                      </div>

                      {/* Legenda simples abaixo da estante para acessibilidade e mobile */}
                      <div className={styles.caption}>
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Lado direito da estante */}
                <div className={styles.shelfPillarRight} aria-hidden="true" />
              </div>
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

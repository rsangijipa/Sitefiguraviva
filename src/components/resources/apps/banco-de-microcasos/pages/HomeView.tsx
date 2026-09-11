import { ArrowRight, Search, Bookmark } from "lucide-react";
import { MicroCase } from "../types";
import CaseCard from "../components/CaseCard";

interface HomeViewProps {
  cases: MicroCase[];
  themes: string[];
  query: string;
  setQuery: (q: string) => void;
  filterLevel: string;
  setFilterLevel: (lvl: string) => void;
  saved: string[];
  openCase: (index: number) => void;
  toggleBookmark: (id: string) => void;
  goToHistory: () => void;
}

export default function HomeView({
  cases,
  themes,
  query,
  setQuery,
  filterLevel,
  setFilterLevel,
  saved,
  openCase,
  toggleBookmark,
  goToHistory,
}: HomeViewProps) {
  const filtered = cases.filter((c) => {
    const matchQuery = `${c.title} ${c.summary} ${c.theme}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchLevel = filterLevel === "Todos" || c.level === filterLevel;
    return matchQuery && matchLevel;
  });

  const firstSavedId = saved[0];
  const continueCase = cases.find((c) => c.id === firstSavedId) || cases[0];

  return (
    <main className="mc-shell">
      <section className="mc-landing">
        <div>
          <small>APRENDER · RACIOCÍNIO CLÍNICO</small>
          <h1>
            Banco de
            <br />
            <em>Microcasos</em>
          </h1>
          <p>
            Situações breves para observar, pensar e experimentar diferentes
            leituras da prática clínica.
          </p>
          <button className="mc-primary" onClick={() => openCase(0)}>
            Explorar microcasos <ArrowRight size={16} />
          </button>
        </div>
        <div className="mc-art">
          <i />
          <i />
          <i />
          <span>
            contexto
            <br />
            relação
            <br />
            presença
          </span>
        </div>
      </section>

      {saved.length > 0 && (
        <section className="mc-continue-banner">
          <div>
            <small>CONTINUE SUA EXPLORAÇÃO</small>
            <h2>{continueCase.title}</h2>
            <span>
              {continueCase.theme} · {continueCase.level} · ~
              {continueCase.minutes} min restantes
            </span>
          </div>
          <button
            className="mc-primary"
            onClick={() =>
              openCase(cases.findIndex((c) => c.id === continueCase.id))
            }
          >
            Continuar
          </button>
        </section>
      )}

      <section className="mc-catalog">
        <div className="mc-catalog-header">
          <div>
            <h2>Explorar por tema</h2>
            <p>Uma situação de cada vez. Sem pressa de fechar a leitura.</p>
          </div>
          <div className="mc-filters">
            {["Todos", "Introdutório", "Intermediário", "Avançado"].map(
              (lvl) => (
                <button
                  key={lvl}
                  className={filterLevel === lvl ? "active-filter" : ""}
                  onClick={() => setFilterLevel(lvl)}
                >
                  {lvl}
                </button>
              ),
            )}
          </div>
        </div>

        <label className="mc-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar situação, conceito ou tema..."
          />
        </label>

        <div className="mc-themes">
          {themes.map((t) => (
            <button key={t} onClick={() => setQuery(t)}>
              {t}{" "}
              <small>{cases.filter((c) => c.theme === t).length || "—"}</small>
            </button>
          ))}
        </div>

        <div className="mc-grid">
          {filtered.map((c) => (
            <CaseCard
              key={c.id}
              item={c}
              isSaved={saved.includes(c.id)}
              onBookmark={() => toggleBookmark(c.id)}
              onOpen={() => openCase(cases.indexOf(c))}
            />
          ))}
        </div>
      </section>
      <button type="button" className="mc-primary" onClick={goToHistory}>
        Minha exploração
      </button>
    </main>
  );
}

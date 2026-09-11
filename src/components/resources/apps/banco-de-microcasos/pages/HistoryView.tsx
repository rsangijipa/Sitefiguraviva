import { MicroCase } from "../types";
import CaseCard from "../components/CaseCard";

interface HistoryViewProps {
  cases: MicroCase[];
  saved: string[];
  reviewed: string[];
  openCase: (index: number) => void;
  toggleBookmark: (id: string) => void;
}

export default function HistoryView({
  cases,
  saved,
  reviewed,
  openCase,
  toggleBookmark,
}: HistoryViewProps) {
  const savedCases = cases.filter((c) => saved.includes(c.id));

  return (
    <main className="mc-shell">
      <section className="mc-landing">
        <small>MINHA EXPLORAÇÃO</small>
        <h1>
          O que permanece
          <br />
          <em>em campo</em>
        </h1>
        <div className="mc-stats">
          <span>
            <b>{cases.length}</b>Microcasos explorados
          </span>
          <span>
            <b>{saved.length}</b>Guardados
          </span>
          <span>
            <b>{reviewed.length}</b>Para rever
          </span>
        </div>

        <div className="mc-history-lists" style={{ marginTop: "40px" }}>
          <h2>Casos guardados e favoritos</h2>
          <div className="mc-grid" style={{ marginTop: "20px" }}>
            {savedCases.length > 0 ? (
              savedCases.map((c) => (
                <CaseCard
                  key={c.id}
                  item={c}
                  isSaved={true}
                  onBookmark={() => toggleBookmark(c.id)}
                  onOpen={() => openCase(cases.indexOf(c))}
                />
              ))
            ) : (
              <p style={{ color: "var(--muted)" }}>
                Nenhum caso guardado no momento.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

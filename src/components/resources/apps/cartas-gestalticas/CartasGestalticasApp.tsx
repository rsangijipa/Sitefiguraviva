"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Filter,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type Card = {
  id: string;
  type: string;
  title: string;
  body: string;
  author?: string;
  prompt: string;
  accent: string;
};
const cards: Card[] = [
  {
    id: "C023",
    type: "CONCEITO",
    title: "Awareness",
    body: "A capacidade de perceber o que acontece, aqui e agora, incluindo sensações, sentimentos, pensamentos e o ambiente.",
    author: "Laura Perls",
    prompt: "O que já está se apresentando antes de você precisar procurar?",
    accent: "#01C94D",
  },
  {
    id: "C011",
    type: "CONCEITO",
    title: "Figura e fundo",
    body: "A experiência organiza-se em figuras que emergem de um fundo. Quando uma figura se completa, outra pode surgir.",
    author: "Fritz Perls",
    prompt: "O que está em primeiro plano neste momento?",
    accent: "#FED701",
  },
  {
    id: "A004",
    type: "AUTOR",
    title: "Laura Perls",
    body: "Co-fundadora da Gestalt-terapia, Laura trouxe para a abordagem a atenção ao corpo, ao contato e à experiência vivida.",
    prompt:
      "Que parte da experiência costuma ficar no fundo quando você pensa em uma teoria?",
    accent: "#FE538B",
  },
  {
    id: "P008",
    type: "PERGUNTA",
    title: "Permanecer",
    body: "Nem toda experiência precisa ser imediatamente explicada. Às vezes, a presença abre uma compreensão diferente.",
    prompt:
      "O que muda quando você deixa de procurar uma resposta e permanece com a experiência?",
    accent: "#96551F",
  },
  {
    id: "F002",
    type: "CAMPO",
    title: "Contato",
    body: "Contato é o encontro vivo entre organismo e ambiente, uma fronteira onde algo pode ser assimilado ou transformado.",
    prompt: "Que relação está participando do que você sente agora?",
    accent: "#005A1F",
  },
];

const territories = [
  ["Conceitos", "Fundamentos e ideias centrais."],
  ["Autores", "Pessoas e produções importantes."],
  ["Perguntas", "Questões para permanecer pensando."],
  ["Clínica", "Situações relacionadas à prática."],
  ["Campo", "Relação, contexto e presença."],
  ["Fenomenologia", "Experiência, descrição e método."],
];

export default function CartasGestalticasApp({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [mode, setMode] = useState<"home" | "explore" | "session" | "saved">(
    "home",
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const card = cards[index];
  const filtered = useMemo(
    () =>
      cards.filter((c) =>
        `${c.title} ${c.type} ${c.body}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const next = () => {
    setIndex((i) => (i + 1) % cards.length);
    setFlipped(false);
  };
  const previous = () => {
    setIndex((i) => (i - 1 + cards.length) % cards.length);
    setFlipped(false);
  };
  const toggleSaved = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (mode === "home")
    return (
      <main className="cg-shell">
        <header className="cg-header">
          <button onClick={onClose} className="cg-back">
            <ArrowLeft size={16} /> Recursos · Aprender
          </button>
          <span>Cartas Gestálticas</span>
          <span className="cg-index">Biblioteca viva</span>
        </header>
        <section className="cg-hero">
          <div>
            <p className="cg-kicker">UMA COLEÇÃO PARA EXPLORAR</p>
            <h1>
              Cartas
              <br />
              <em>Gestálticas</em>
            </h1>
            <p className="cg-lead">
              Conceitos, autores, perguntas e provocações para explorar a
              Gestalt-terapia em diferentes caminhos.
            </p>
            <div className="cg-modes">
              {[
                ["Explorar", "Percorrer as cartas por território.", "explore"],
                ["Revisar", "Reencontrar o que você marcou.", "saved"],
                ["Aleatório", "Receber uma carta sem escolher.", "session"],
                ["Favoritos", "Abrir sua coleção pessoal.", "saved"],
              ].map(([title, desc, target]) => (
                <button
                  key={title}
                  onClick={() => setMode(target as typeof mode)}
                >
                  <span className="cg-mode-icon">
                    <Sparkles size={17} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="cg-stack" aria-hidden="true">
            {cards.slice(0, 3).map((c, i) => (
              <div
                key={c.id}
                className="cg-mini"
                style={{
                  transform: `rotate(${(i - 1) * 6}deg) translate(${i * 12}px, ${i * 4}px)`,
                  zIndex: i,
                  borderTopColor: c.accent,
                }}
              >
                <small>{c.type}</small>
                <b>{c.title}</b>
              </div>
            ))}
          </div>
        </section>
      </main>
    );

  if (mode === "explore" || mode === "saved")
    return (
      <main className="cg-shell">
        <header className="cg-header">
          <button onClick={() => setMode("home")} className="cg-back">
            <ArrowLeft size={16} /> Voltar
          </button>
          <span>{mode === "saved" ? "Cartas guardadas" : "Explorar"}</span>
          <span className="cg-index">
            {mode === "saved"
              ? `${saved.length} guardadas`
              : `${cards.length} cartas`}
          </span>
        </header>
        <section className="cg-library">
          <p className="cg-kicker">
            {mode === "saved" ? "MINHA COLEÇÃO" : "TERRITÓRIOS"}
          </p>
          <h2>
            {mode === "saved"
              ? "Cartas guardadas"
              : "Por onde você quer começar?"}
          </h2>
          <p className="cg-muted">
            {mode === "saved"
              ? "Conceitos e provocações que você quis manter por perto."
              : "Escolha um território ou percorra a coleção inteira, sem pressa."}
          </p>
          {mode === "explore" && (
            <div className="cg-territories">
              {territories.map(([t, d]) => (
                <button
                  key={t}
                  onClick={() => {
                    setIndex(
                      cards.findIndex((c) =>
                        c.type
                          .toLowerCase()
                          .includes(t.slice(0, -1).toLowerCase()),
                      ) >= 0
                        ? cards.findIndex((c) =>
                            c.type
                              .toLowerCase()
                              .includes(t.slice(0, -1).toLowerCase()),
                          )
                        : 0,
                    );
                    setMode("session");
                  }}
                >
                  <span>{t[0]}</span>
                  <strong>{t}</strong>
                  <small>{d}</small>
                </button>
              ))}
            </div>
          )}
          <div className="cg-tools">
            <label>
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conceito, autor ou palavra…"
              />
            </label>
            <button onClick={() => setShowFilter(!showFilter)}>
              <Filter size={16} /> Filtrar
            </button>
          </div>
          {showFilter && (
            <div className="cg-filter">
              Filtros ficam disponíveis conforme sua coleção cresce.{" "}
              <button
                onClick={() => {
                  setQuery("");
                  setShowFilter(false);
                }}
              >
                Limpar
              </button>
            </div>
          )}
          <div className="cg-grid">
            {filtered
              .filter((c) => mode === "explore" || saved.includes(c.id))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setIndex(cards.indexOf(c));
                    setMode("session");
                  }}
                >
                  <small>
                    {c.type} · FV {c.id}
                  </small>
                  <strong>{c.title}</strong>
                  <span>{c.body}</span>
                  <em>Virar carta →</em>
                </button>
              ))}
          </div>
          {mode === "saved" && !saved.length && (
            <div className="cg-empty">
              Você ainda não guardou nenhuma carta.
              <br />
              <small>
                Quando alguma quiser ficar com você, escolha Guardar.
              </small>
            </div>
          )}
        </section>
      </main>
    );

  return (
    <main
      className="cg-shell cg-session"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped(!flipped);
        }
      }}
    >
      <header className="cg-header">
        <button onClick={() => setMode("home")} className="cg-back">
          <ArrowLeft size={16} /> Sair da exploração
        </button>
        <span>Cartas Gestálticas</span>
        <span className="cg-index">
          Carta {index + 1} · {cards.length} disponíveis
        </span>
      </header>
      <div className="cg-session-body">
        <p className="cg-kicker">
          {card.type} <span>· FV {card.id}</span>
        </p>
        <button
          className={`cg-card ${flipped ? "is-flipped" : ""}`}
          onClick={() => setFlipped(!flipped)}
          aria-label={
            flipped
              ? `Verso da carta ${card.title}`
              : `Frente da carta ${card.title}`
          }
        >
          <div className="cg-card-face" style={{ borderTopColor: card.accent }}>
            <small>{card.type}</small>
            <span className="cg-card-id">FV · {card.id}</span>
            <h2>{card.title}</h2>
            <p>Toque para explorar</p>
          </div>
          <div
            className="cg-card-face cg-card-back"
            style={{ borderTopColor: card.accent }}
          >
            <small>{card.title}</small>
            <p>{card.body}</p>
            {card.author && (
              <span className="cg-detail">Autor · {card.author}</span>
            )}
            <div className="cg-prompt">
              <b>Para ficar com isso</b>
              <span>{card.prompt}</span>
            </div>
          </div>
        </button>
        <div className="cg-actions">
          <button onClick={() => toggleSaved(card.id)}>
            {saved.includes(card.id) ? (
              <Check size={17} />
            ) : (
              <Bookmark size={17} />
            )}{" "}
            {saved.includes(card.id) ? "Guardada" : "Guardar"}
          </button>
          <button onClick={() => setFlipped(!flipped)} className="cg-primary">
            {flipped ? "Voltar à frente" : "Virar carta"}
          </button>
          <span className="cg-spacer" />
          <button onClick={previous} aria-label="Carta anterior">
            <ArrowLeft size={18} />
          </button>
          <button onClick={next} aria-label="Próxima carta">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}

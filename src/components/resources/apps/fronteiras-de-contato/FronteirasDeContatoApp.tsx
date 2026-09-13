"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Grid3X3,
  Menu,
  Shuffle,
} from "lucide-react";
const items = [
  {
    title: "Quando o silêncio se aproxima",
    theme: "Presença",
    text: "Durante a conversa, a pessoa permanece em silêncio e olha para o chão. O que emerge entre vocês?",
  },
  {
    title: "O pedido que não chega",
    theme: "Necessidade",
    text: "Ela fala longamente sobre autonomia, mas seus ombros baixam quando você oferece apoio.",
  },
  {
    title: "A fronteira que se move",
    theme: "Contato",
    text: "Uma mudança no ritmo da fala altera a atmosfera do encontro. Permaneça com o que se apresenta.",
  },
];
export default function FronteirasDeContatoApp({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [tab, setTab] = useState("experiment"),
    [i, setI] = useState(0);
  const v = items[i];
  return (
    <main className="fc-shell">
      <header className="fc-header">
        <button onClick={onClose}>
          <ArrowLeft size={16} /> Recursos
        </button>
        <div>
          <small>APRENDER · EXPERIMENTAR</small>
          <h1>Fronteiras de Contato</h1>
        </div>
        <button aria-label="Menu">
          <Menu size={20} />
        </button>
      </header>
      <nav className="fc-tabs">
        {[
          ["experiment", "Experiência"],
          ["catalog", "Vinhetas"],
          ["theory", "Teoria"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab === key ? "active" : ""}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "experiment" && (
        <section className="fc-main">
          <div className="fc-intro">
            <small>
              VINHETA {String(i + 1).padStart(2, "0")} · {v.theme.toUpperCase()}
            </small>
            <h2>{v.title}</h2>
            <p>{v.text}</p>
            <blockquote>“O que acontece nesse silêncio agora?”</blockquote>
            <div className="fc-actions">
              <button
                onClick={() => setI((i + items.length - 1) % items.length)}
              >
                <ArrowLeft /> Anterior
              </button>
              <button
                onClick={() => setI((i + 1) % items.length)}
                className="fc-primary"
              >
                Próxima <ArrowRight />
              </button>
            </div>
          </div>
          <div className="fc-field">
            <div className="fc-ring r1" />
            <div className="fc-ring r2" />
            <div className="fc-dot d1" />
            <div className="fc-dot d2" />
            <span>
              observe
              <br />o campo
            </span>
          </div>
        </section>
      )}
      {tab === "catalog" && (
        <section className="fc-catalog">
          <h2>Biblioteca de vinhetas</h2>
          <p>Pequenas situações para observar, experimentar e pensar.</p>
          {items.map((x, n) => (
            <button
              key={x.title}
              onClick={() => {
                setI(n);
                setTab("experiment");
              }}
            >
              <span>
                <small>{x.theme}</small>
                <strong>{x.title}</strong>
              </span>
              <ArrowRight />
            </button>
          ))}
        </section>
      )}
      {tab === "theory" && (
        <section className="fc-catalog">
          <BookOpen size={28} color="#96551f" />
          <h2>Um campo para experimentar</h2>
          <p>
            As fronteiras de contato são lugares de encontro, diferença e
            transformação. Não há uma leitura única: há o convite a permanecer
            próximo da experiência.
          </p>
          <div className="fc-note">
            <b>PRÁTICA RELACIONAL</b>
            <span>
              Descreva antes de interpretar. Deixe que a situação revele suas
              possibilidades.
            </span>
          </div>
        </section>
      )}
      <footer className="fc-footer">
        <span>
          <Bookmark size={15} /> Guardar experiência
        </span>
        <span>
          <Shuffle size={15} /> Escolher outra vinheta
        </span>
        <span>
          <Grid3X3 size={15} /> {items.length} situações
        </span>
      </footer>
    </main>
  );
}

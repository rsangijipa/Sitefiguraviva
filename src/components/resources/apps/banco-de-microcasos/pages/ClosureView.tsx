import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { MicroCase } from "../types";

interface ClosureViewProps {
  item: MicroCase;
  isReviewed: boolean;
  isSaved: boolean;
  onBack: () => void;
  onToggleReview: () => void;
  onToggleBookmark: () => void;
}

export default function ClosureView({
  item,
  isReviewed,
  isSaved,
  onBack,
  onToggleReview,
  onToggleBookmark,
}: ClosureViewProps) {
  return (
    <main className="mc-shell">
      <div className="mc-closure-container">
        <div className="mc-closure-badge">
          <CheckCircle2 size={24} className="text-emerald-600" />
          <span>Fechando o caso · {item.title}</span>
        </div>
        <h1>O que este caso coloca em questão</h1>
        <p className="mc-closure-intro">{item.closure.question}</p>

        <div className="mc-closure-grid">
          <section className="mc-closure-card">
            <h3>
              <Compass size={18} /> Elementos para observar
            </h3>
            <ul>
              {item.closure.observables.map((o, idx) => (
                <li key={idx}>{o}</li>
              ))}
            </ul>
          </section>
          <section className="mc-closure-card">
            <h3>
              <BookOpen size={18} /> Possíveis leituras
            </h3>
            <ul>
              {item.closure.readings.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mc-closure-footer-section">
          <div>
            <strong>Conceitos relacionados:</strong>
            <div className="mc-tags">
              {item.closure.concepts.map((c) => (
                <span key={c} className="mc-tag">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <strong>Questões que permanecem:</strong>
            <ul>
              {item.closure.questionsRemaining.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mc-actions-bottom">
          <button className="mc-primary" onClick={onBack}>
            Voltar ao início <ArrowRight size={16} />
          </button>
          <button className="mc-secondary" onClick={onToggleReview}>
            {isReviewed ? "Na lista de revisão" : "Marcar para rever"}
          </button>
          <button className="mc-secondary" onClick={onToggleBookmark}>
            {isSaved ? "Remover dos guardados" : "Guardar caso"}
          </button>
        </div>
      </div>
    </main>
  );
}

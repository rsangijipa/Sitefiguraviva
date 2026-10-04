import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { MicroCase } from "../types";

interface PlayerViewProps {
  item: MicroCase;
  step: number;
  answers: Record<number, string[]>;
  textAnswers: Record<number, string>;
  isSaved: boolean;
  onBookmark: () => void;
  onToggleOption: (option: string) => void;
  onTextChange: (text: string) => void;
  onNext: () => void;
}

export default function PlayerView({
  item,
  step,
  answers,
  textAnswers,
  isSaved,
  onBookmark,
  onToggleOption,
  onTextChange,
  onNext,
}: PlayerViewProps) {
  const currentStepData = item.steps[step];

  return (
    <main className="mc-shell">
      <div className="mc-player">
        <aside className="mc-context">
          <small>
            MICROCASO {item.id} · {item.theme.toUpperCase()}
          </small>
          <h2>{item.title}</h2>
          <p>{item.vignette}</p>
          <blockquote className="mc-quote">“{item.quote}”</blockquote>
          <h3>Dados disponíveis</h3>
          <ul>
            {item.context.map((ctx, idx) => (
              <li key={idx}>{ctx}</li>
            ))}
          </ul>
        </aside>
        <section className="mc-activity">
          <div
            className="mc-steps"
            aria-label={`Etapa ${step + 1} de ${item.steps.length}`}
          >
            {item.steps.map((_, i) => (
              <i key={i} className={i <= step ? "active" : ""} />
            ))}
          </div>

          <small>
            ETAPA {step + 1} · {currentStepData.title.toUpperCase()}
          </small>
          <h1>{currentStepData.title}</h1>
          <p>{currentStepData.prompt}</p>

          {currentStepData.options ? (
            <div className="mc-options">
              {currentStepData.options.map((opt) => {
                const selected = (answers[step] || []).includes(opt);
                return (
                  <button
                    key={opt}
                    className={selected ? "selected" : ""}
                    onClick={() => onToggleOption(opt)}
                  >
                    {opt} {selected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mc-textarea-wrapper">
              <textarea
                rows={4}
                value={textAnswers[step] || ""}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Escreva sua reflexão ou pergunta aqui..."
              />
              <div className="mc-feedback-note">
                <Sparkles size={14} /> Dica editorial: Busque formular sem
                pressupor respostas prontas ou explicações antecipadas.
              </div>
            </div>
          )}

          <div className="mc-player-footer">
            <div className="mc-player-tools">
              <span className="mc-save-status">
                <CheckCircle2 size={14} className="text-emerald-500" /> Salvo
                neste dispositivo
              </span>
              <button
                type="button"
                className={isSaved ? "mc-book" : "mc-secondary"}
                onClick={onBookmark}
              >
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Guardado" : "Guardar"}
              </button>
            </div>
            <button className="mc-primary" onClick={onNext}>
              {step === item.steps.length - 1
                ? "Concluir análise"
                : "Avançar etapa"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

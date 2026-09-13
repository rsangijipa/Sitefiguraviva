import { motion } from "framer-motion";
import { RotateCcw, Home, Share2 } from "lucide-react";
import { Quiz, Screening, QuizResult } from "../types";
import { AppHeader } from "../components/AppHeader";
import { Disclaimer } from "../components/Disclaimer";
import { ResultCard } from "../components/ResultCard";
import "./ResultPage.css";

interface ResultPageProps {
  questionnaire: Quiz | Screening;
  result: QuizResult;
  onRestart: () => void;
  onHome: () => void;
}

export function ResultPage({
  questionnaire,
  result,
  onRestart,
  onHome,
}: ResultPageProps) {
  const isScreening = questionnaire.type === "screening";

  const handleShare = () => {
    const text = `Completei o questionário "${questionnaire.title}" em MenteQuiz.`;
    if (navigator.share) {
      navigator.share({
        title: "MenteQuiz",
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Texto copiado!");
    }
  };

  return (
    <div className="result-page">
      <AppHeader onBack={onHome} showBack={true} />

      <main className="qz-app-container result-page__main">
        {/* TITLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="result-page__header"
        >
          <h1 className="result-page__title">Seu resultado</h1>
          {questionnaire.subtitle && (
            <p className="result-page__subtitle">{questionnaire.subtitle}</p>
          )}
        </motion.section>

        {/* RESULTS */}
        {isScreening && result.results && result.results.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="result-page__results"
          >
            <h2 className="result-page__results-title">
              Seu mapa de respostas
            </h2>
            <div className="result-page__results-grid">
              {result.results.map((domainResult, index) => (
                <ResultCard
                  key={domainResult.domain}
                  domain={domainResult}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* INTERPRETATION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="result-page__interpretation"
        >
          <h2 className="result-page__section-title">O que isso significa?</h2>
          <div className="result-page__text-content">
            <p>
              Suas respostas foram organizadas nos domínios apresentados acima.
              Cada domínio foi calculado a partir de suas respostas, refletindo
              com que frequência você relatou dificuldades relacionadas a cada
              área.
            </p>
            {isScreening && (
              <p>
                Esse resultado é baseado em um questionário de auto-observação.
                Outras condições — como estresse agudo, privação de sono,
                pressão profissional — também podem produzir sintomas
                semelhantes. Uma avaliação adequada considera história de vida
                completa, contexto, duração, intensidade, prejuízo funcional e
                informações clínicas aprofundadas.
              </p>
            )}
          </div>
        </motion.section>

        {/* DISCLAIMER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="result-page__disclaimer"
        >
          <Disclaimer
            text={
              questionnaire.disclaimer ||
              "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico psicológico ou psiquiátrico."
            }
            type="clinical"
          />
        </motion.section>

        {/* ACTIONS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="result-page__actions"
        >
          <button onClick={onRestart} className="qz-btn qz-btn-primary">
            <RotateCcw size={18} strokeWidth={2} />
            Refazer questionário
          </button>
          <button onClick={onHome} className="qz-btn qz-btn-secondary">
            <Home size={18} strokeWidth={2} />
            Voltar ao catálogo
          </button>
          <button onClick={handleShare} className="qz-btn qz-btn-ghost">
            <Share2 size={18} strokeWidth={2} />
            Compartilhar
          </button>
        </motion.section>

        {/* FOOTER */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="result-page__footer"
        >
          <p>Resultado salvo em seu navegador</p>
        </motion.section>
      </main>
    </div>
  );
}

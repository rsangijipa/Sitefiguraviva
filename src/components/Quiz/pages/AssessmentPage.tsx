import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { ValidatedInstrument, AssessmentResult } from "../types";
import { AssessmentQuestion } from "../components/assessment/AssessmentQuestion";
import { AssessmentResultComponent } from "../components/assessment/AssessmentResult";
import { AppHeader } from "../components/AppHeader";
import { Disclaimer } from "../components/Disclaimer";
import "./AssessmentPage.css";

interface AssessmentPageProps {
  instrument: ValidatedInstrument;
  onBack: () => void;
}

type AssessmentScreen = "intro" | "questions" | "result" | "error";

export function AssessmentPage({ instrument, onBack }: AssessmentPageProps) {
  const [screen, setScreen] = useState<AssessmentScreen>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // Foco automático ao entrar na tela de resultado
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (screen === "result" && resultHeadingRef.current) {
      resultHeadingRef.current.focus();
    }
  }, [screen]);

  // ─── Guard: instrumento sem questões ────────────────────────────
  const totalQuestions = instrument.questions.length;

  if (totalQuestions === 0) {
    return (
      <div className="assessment-page">
        <AppHeader onBack={onBack} />
        <main className="qz-app-container assessment-page__error-container">
          <div className="assessment-page__error-box" role="alert">
            <AlertCircle
              size={40}
              aria-hidden="true"
              className="assessment-page__error-icon"
            />
            <h2 className="assessment-page__error-title">
              Instrumento sem questões
            </h2>
            <p className="assessment-page__error-text">
              Este instrumento não possui perguntas configuradas. Por favor,
              tente outro questionário.
            </p>
            <button
              className="assessment-page__button assessment-page__button--primary"
              onClick={onBack}
            >
              Voltar ao catálogo
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = instrument.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed =
    currentQuestion !== undefined &&
    responses[currentQuestion.id] !== undefined;

  // ─── Handlers ───────────────────────────────────────────────────

  const handleStartAssessment = () => {
    setScreen("questions");
    setCurrentQuestionIndex(0);
    setResponses({});
    setScoringError(null);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!currentQuestion || !canProceed) return;

    if (isLastQuestion) {
      // ── Calcular resultado com proteção contra exceções ──────────
      try {
        const calculatedResult = instrument.scoring.algorithm(responses);
        setResult(calculatedResult);
        setScreen("result");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro desconhecido no cálculo.";
        setScoringError(message);
        setScreen("error");
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setScreen("intro");
    }
  };

  const handleRefresh = () => {
    setScreen("intro");
    setCurrentQuestionIndex(0);
    setResponses({});
    setResult(null);
    setScoringError(null);
  };

  // ─── Tela: Intro ─────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div className="assessment-page">
        <AppHeader onBack={onBack} />

        <main className="qz-app-container assessment-page__main">
          <motion.section
            className="assessment-page__intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="assessment-page__intro-header">
              <h1 className="assessment-page__intro-title">
                {instrument.publicTitle}
              </h1>
              <p className="assessment-page__intro-subtitle">
                {instrument.purpose}
              </p>
            </div>

            <div className="assessment-page__intro-info">
              <div className="assessment-page__intro-item">
                <span className="assessment-page__intro-label">Duração</span>
                <p className="assessment-page__intro-value">
                  Aprox. {Math.ceil(totalQuestions / 2)} minutos
                </p>
              </div>
              <div className="assessment-page__intro-item">
                <span className="assessment-page__intro-label">Perguntas</span>
                <p className="assessment-page__intro-value">
                  {totalQuestions} questões
                </p>
              </div>
              <div className="assessment-page__intro-item">
                <span className="assessment-page__intro-label">Período</span>
                <p className="assessment-page__intro-value">
                  {instrument.timeframe}
                </p>
              </div>
            </div>

            <Disclaimer text={instrument.disclaimer} />

            <div className="assessment-page__intro-actions">
              <button
                className="assessment-page__button assessment-page__button--primary"
                onClick={handleStartAssessment}
              >
                Começar avaliação
              </button>
              <button
                className="assessment-page__button assessment-page__button--secondary"
                onClick={onBack}
              >
                Voltar
              </button>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  // ─── Guard: currentQuestion nulo (índice fora de range) ──────────
  if (screen === "questions" && !currentQuestion) {
    return (
      <div className="assessment-page">
        <AppHeader onBack={onBack} />
        <main className="qz-app-container assessment-page__error-container">
          <div className="assessment-page__error-box" role="alert">
            <AlertCircle
              size={40}
              aria-hidden="true"
              className="assessment-page__error-icon"
            />
            <h2 className="assessment-page__error-title">
              Pergunta não encontrada
            </h2>
            <p className="assessment-page__error-text">
              Ocorreu um problema ao carregar esta questão.
            </p>
            <button
              className="assessment-page__button assessment-page__button--primary"
              onClick={handleRefresh}
            >
              Recomeçar
            </button>
            <button
              className="assessment-page__button assessment-page__button--secondary"
              onClick={onBack}
            >
              Voltar ao catálogo
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Tela: Questões ──────────────────────────────────────────────
  if (screen === "questions" && currentQuestion) {
    return (
      <div className="assessment-page">
        <AppHeader onBack={onBack} />

        <main className="qz-app-container assessment-page__questions">
          <AnimatePresence mode="wait">
            <AssessmentQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              onAnswer={handleAnswer}
              currentAnswer={responses[currentQuestion.id]}
              responseScale={currentQuestion.responseScale}
            />
          </AnimatePresence>

          {/* Hint quando nenhuma resposta foi selecionada */}
          <AnimatePresence>
            {!canProceed && (
              <motion.p
                className="assessment-page__answer-hint"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
              >
                Selecione uma resposta para continuar
              </motion.p>
            )}
          </AnimatePresence>

          {/* Navegação */}
          <motion.div
            className="assessment-page__navigation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              className="assessment-page__nav-button assessment-page__nav-button--prev"
              onClick={handlePrevious}
              aria-label={
                currentQuestionIndex === 0
                  ? "Voltar à introdução"
                  : "Voltar à pergunta anterior"
              }
            >
              <ChevronLeft size={20} aria-hidden="true" />
              Anterior
            </button>

            <button
              className={`assessment-page__nav-button assessment-page__nav-button--next${
                !canProceed ? " assessment-page__nav-button--disabled" : ""
              }`}
              onClick={handleNext}
              disabled={!canProceed}
              aria-label={
                !canProceed
                  ? "Selecione uma resposta para continuar"
                  : isLastQuestion
                    ? "Finalizar e ver resultado"
                    : `Ir para pergunta ${currentQuestionIndex + 2}`
              }
            >
              {isLastQuestion ? "Finalizar" : "Próxima"}
              {!isLastQuestion && <ChevronRight size={20} aria-hidden="true" />}
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ─── Tela: Erro de scoring ───────────────────────────────────────
  if (screen === "error") {
    return (
      <div className="assessment-page">
        <AppHeader onBack={onBack} />
        <main className="qz-app-container assessment-page__error-container">
          <div className="assessment-page__error-box" role="alert">
            <AlertCircle
              size={40}
              aria-hidden="true"
              className="assessment-page__error-icon"
            />
            <h2 className="assessment-page__error-title">
              Erro ao calcular resultado
            </h2>
            <p className="assessment-page__error-text">
              Não foi possível processar suas respostas.
              {scoringError && (
                <span className="assessment-page__error-detail">
                  {" "}
                  Detalhe: {scoringError}
                </span>
              )}
            </p>
            <button
              className="assessment-page__button assessment-page__button--primary"
              onClick={handleRefresh}
            >
              Tentar novamente
            </button>
            <button
              className="assessment-page__button assessment-page__button--secondary"
              onClick={onBack}
            >
              Voltar ao catálogo
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Tela: Resultado ─────────────────────────────────────────────
  if (screen === "result" && result) {
    return (
      <div className="assessment-page">
        <AppHeader onBack={onBack} />

        <main className="qz-app-container">
          {/* Heading focável para screen readers ao entrar no resultado */}
          <h1 ref={resultHeadingRef} tabIndex={-1} className="sr-only">
            Resultado do {instrument.publicTitle}
          </h1>

          <AssessmentResultComponent
            instrument={instrument}
            result={result}
            onRefresh={handleRefresh}
            onHome={onBack}
          />
        </main>
      </div>
    );
  }

  return null;
}

import { motion } from "framer-motion";
import { useEffect } from "react";
import { AssessmentQuestion as AssessmentQuestionType } from "../../types";
import { AnswerOption } from "../AnswerOption";
import "./AssessmentQuestion.css";

interface AssessmentQuestionProps {
  question: AssessmentQuestionType;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: string, value: any) => void;
  currentAnswer?: any;
  responseScale: string;
}

export function AssessmentQuestion({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  currentAnswer,
  responseScale,
}: AssessmentQuestionProps) {
  // Determine answer options based on response scale
  const getAnswerOptions = () => {
    switch (responseScale) {
      case "0-3":
        return [
          { value: 0, label: "Nunca" },
          { value: 1, label: "Raramente" },
          { value: 2, label: "Às vezes" },
          { value: 3, label: "Frequentemente" },
        ];
      case "0-4":
        return [
          { value: 0, label: "Nunca" },
          { value: 1, label: "Raramente" },
          { value: 2, label: "Às vezes" },
          { value: 3, label: "Frequentemente" },
          { value: 4, label: "Quase sempre" },
        ];
      case "0-5":
        return [
          { value: 0, label: "Nunca" },
          { value: 1, label: "Raramente" },
          { value: 2, label: "Às vezes" },
          { value: 3, label: "Frequentemente" },
          { value: 4, label: "Quase sempre" },
          { value: 5, label: "Todo o tempo" },
        ];
      case "agree-disagree":
        return [
          { value: 0, label: "Discordo" },
          { value: 1, label: "Concordo" },
        ];
      default:
        return [
          { value: 0, label: "Não" },
          { value: 1, label: "Sim" },
        ];
    }
  };

  const answerOptions = getAnswerOptions();
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  // Keyboard shortcuts: teclas 1–N selecionam a resposta correspondente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se foco está em input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const index = parseInt(e.key) - 1;
      if (index >= 0 && index < answerOptions.length) {
        e.preventDefault();
        onAnswer(question.id, answerOptions[index].value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answerOptions, question.id, onAnswer]);

  return (
    <motion.div
      className="assessment-question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress Bar */}
      <div className="assessment-question__progress-container">
        <div
          className="assessment-question__progress-bar"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-label={`Pergunta ${currentIndex + 1} de ${totalQuestions}`}
        >
          <div
            className="assessment-question__progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {/* Anúncio para screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Pergunta {currentIndex + 1} de {totalQuestions}
        </div>
        <p className="assessment-question__progress-text" aria-hidden="true">
          {currentIndex + 1} de {totalQuestions}
        </p>
      </div>

      {/* Question Content */}
      <div className="assessment-question__content">
        <h2 className="assessment-question__text">{question.demoText}</h2>

        {question.domain && (
          <p className="assessment-question__domain">{question.domain}</p>
        )}
      </div>

      {/* Answer Options */}
      <div
        className="assessment-question__options"
        role="group"
        aria-label={`Opções para: ${question.demoText}`}
      >
        {answerOptions.map((option, idx) => (
          <motion.button
            key={`${question.id}-${option.value}`}
            className={`assessment-question__option ${
              currentAnswer === option.value
                ? "assessment-question__option--selected"
                : ""
            }`}
            onClick={() => onAnswer(question.id, option.value)}
            aria-label={`${option.label} — opção ${idx + 1} de ${answerOptions.length}`}
            aria-pressed={currentAnswer === option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {/* Badge de número (visível apenas em desktop) */}
            <span
              className="assessment-question__option-number"
              aria-hidden="true"
            >
              {idx + 1}
            </span>
            <span className="assessment-question__option-text">
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Hint de teclado — aparece apenas em desktop */}
      <p className="assessment-question__keyboard-hint" aria-hidden="true">
        Dica: use as teclas <strong>1</strong>–
        <strong>{answerOptions.length}</strong> para responder
      </p>
    </motion.div>
  );
}

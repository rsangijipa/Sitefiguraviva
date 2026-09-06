import { useMemo } from "react";
import { Quiz, Screening, Answer } from "../types";
import { QuizEngine } from "../components/QuizEngine";
import { calculateDomainResults } from "../utils/scoring";
import { saveResult } from "../utils/storage";

interface QuizPageProps {
  questionnaire: Quiz | Screening;
  onBack: () => void;
  onResult: (resultId: string) => void;
}

export function QuizPage({ questionnaire, onBack, onResult }: QuizPageProps) {
  const handleComplete = (answers: Answer[]) => {
    const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (questionnaire.type === "screening") {
      const screening = questionnaire as Screening;
      const domains = calculateDomainResults(screening, answers);

      const result = {
        id: resultId,
        questionnaireId: questionnaire.id,
        questionnaireName: questionnaire.title,
        questionnaire,
        timestamp: Date.now(),
        answers,
        results: domains,
      };

      const outcome = saveResult(result);
      if (outcome.ok === false) console.warn("[storage]", outcome.message);
    } else {
      const result = {
        id: resultId,
        questionnaireId: questionnaire.id,
        questionnaireName: questionnaire.title,
        questionnaire,
        timestamp: Date.now(),
        answers,
      };

      const outcome = saveResult(result);
      if (outcome.ok === false) console.warn("[storage]", outcome.message);
    }

    onResult(resultId);
  };

  return (
    <QuizEngine
      questionnaire={questionnaire}
      onComplete={handleComplete}
      onBack={onBack}
    />
  );
}

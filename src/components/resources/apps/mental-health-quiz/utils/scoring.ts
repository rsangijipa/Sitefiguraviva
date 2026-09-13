import { Answer, AnswerValue, Screening, DomainResult } from "../types";

const ANSWER_WEIGHTS: Record<AnswerValue, number> = {
  never: 0,
  rarely: 1,
  sometimes: 2,
  frequently: 3,
  almost_always: 4,
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
};

export const calculateScore = (answers: Answer[]): number => {
  return answers.reduce((total, answer) => {
    return total + (ANSWER_WEIGHTS[answer.value] || 0);
  }, 0);
};

export const calculateMaxScore = (questionCount: number): number => {
  return questionCount * 4;
};

export const getScorePercentage = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

export const calculateDomainResults = (
  screening: Screening,
  answers: Answer[],
): DomainResult[] => {
  if (!screening.domains) return [];

  return screening.domains.map((domain) => {
    const domainAnswers = answers.filter((answer) =>
      domain.questionIds.includes(answer.questionId),
    );

    const domainScore = calculateScore(domainAnswers);
    const maxScore = calculateMaxScore(domainAnswers.length);
    const percentage = getScorePercentage(domainScore, maxScore);

    let label = "Baixa frequência";
    let description = "";

    if (percentage >= 75) {
      label = "Alta frequência";
      description = `Você marcou frequentemente/quase sempre em ${domainAnswers.length} de ${domainAnswers.length} situações relacionadas a ${domain.name.toLowerCase()}.`;
    } else if (percentage >= 50) {
      label = "Moderada frequência";
      description = `Você marcou com frequência moderada em situações relacionadas a ${domain.name.toLowerCase()}.`;
    } else {
      description = `Você marcou com baixa frequência em situações relacionadas a ${domain.name.toLowerCase()}.`;
    }

    return {
      domain: domain.id,
      score: domainScore,
      percentage,
      label,
      description,
    };
  });
};

export const getIntensityBar = (percentage: number): string => {
  const filled = Math.ceil((percentage / 100) * 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
};

export const getIntensityColor = (percentage: number): string => {
  if (percentage >= 75) return "bg-rose-500";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-slate-300";
};

export const getIntensityTextColor = (percentage: number): string => {
  if (percentage >= 75) return "text-rose-600";
  if (percentage >= 50) return "text-amber-600";
  return "text-slate-600";
};

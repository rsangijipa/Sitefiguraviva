import { AssessmentResult, ScreenStatus } from "../types";
import { ScoringHelpers } from "./helpers";

/**
 * ASRS v1.1 6Q: Adult ADHD Self-Report Scale - 6 Questions
 * Rastreio de TDAH em adultos
 * Válido: sim (modo: demo/validated)
 */

export interface ASRSResponse {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
}

export interface ASRSContextualAnswers {
  multipleContexts?: string[];
  childhoodDifficulties?: "yes" | "no" | "unknown";
}

export const calculateASRS = (
  responses: ASRSResponse,
  contextual?: ASRSContextualAnswers,
): AssessmentResult => {
  const values = [
    responses.q1,
    responses.q2,
    responses.q3,
    responses.q4,
    responses.q5,
    responses.q6,
  ];

  // Validar respostas
  const validValues = values.filter((v) => v != null);
  if (validValues.length < 6) {
    return {
      instrumentId: "asrs6",
      completedAt: new Date().toISOString(),
      valid: false,
      answeredItems: validValues.length,
      missingItems: 6 - validValues.length,
      safetyFlags: [],
      interpretation:
        "Respostas incompletas. Por favor, responda todos os itens.",
      disclaimer: "Resultado não calculado devido a respostas ausentes.",
    };
  }

  // Calcular score (0-24)
  const rawScore = ScoringHelpers.sum(validValues);
  const maxScore = 24;
  const normalizedScore = ScoringHelpers.normalize(rawScore, 0, maxScore);

  // Classificar
  let classification = "";
  let screenStatus: ScreenStatus = "negative";

  if (rawScore <= 9) {
    classification = "Faixa negativa baixa";
    screenStatus = "negative";
  } else if (rawScore <= 13) {
    classification = "Faixa negativa alta";
    screenStatus = "negative";
  } else if (rawScore <= 17) {
    classification = "Faixa positiva baixa";
    screenStatus = "positive";
  } else {
    classification = "Faixa positiva alta";
    screenStatus = "positive";
  }

  // Interpretação
  const baseInterpretation =
    screenStatus === "positive"
      ? "Seu escore ficou em uma faixa positiva de rastreio neste instrumento. Isso significa que você relatou maior frequência de dificuldades relacionadas à atenção, organização e impulsividade. Um rastreio positivo não estabelece diagnóstico de TDAH."
      : "Seu escore ficou em uma faixa negativa de rastreio neste instrumento. Isso significa que você relatou menor frequência de dificuldades relacionadas à atenção, organização e impulsividade.";

  const contextualNote =
    contextual?.multipleContexts && contextual.multipleContexts.length > 0
      ? ` Você indicou que essas dificuldades ocorrem em ${contextual.multipleContexts.join(", ")}.`
      : "";

  const childhoodNote =
    contextual?.childhoodDifficulties === "yes"
      ? " Você mencionou que dificuldades semelhantes estavam presentes na sua infância ou adolescência."
      : "";

  const interpretation = baseInterpretation + contextualNote + childhoodNote;

  return {
    instrumentId: "asrs6",
    completedAt: new Date().toISOString(),
    rawScore,
    normalizedScore,
    maxScore,
    classification,
    screenStatus,
    answeredItems: validValues.length,
    missingItems: 0,
    valid: true,
    safetyFlags: [],
    interpretation,
    disclaimer:
      "Um rastreio positivo neste instrumento não estabelece diagnóstico de TDAH. Dificuldades de atenção e organização também podem estar associadas a outras condições, como ansiedade, depressão, privação de sono ou outras condições médicas.",
  };
};

export const ASRS_MIN_SCORE = 0;
export const ASRS_MAX_SCORE = 24;
export const ASRS_SCREENING_THRESHOLD = 14;

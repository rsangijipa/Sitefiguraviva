import { AssessmentResult, ScreenStatus } from "../types";

/**
 * AQ-10: Autism-Spectrum Quotient - 10 items
 * Rastreio de características autistas em adultos
 * Válido: sim (modo: demo/validated)
 * ESPECIAL: item scoring com direção específica por item
 */

export interface AQ10Response {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
}

export interface AQ10ContextualAnswers {
  impactAreas?: string[];
  childhoodCharacteristics?: "yes" | "no" | "unknown";
}

// Itens que pontuam quando resposta = "concordo"
const AGREE_SCORED_ITEMS = [1, 7, 8, 10];

// Itens que pontuam quando resposta = "discordo"
const DISAGREE_SCORED_ITEMS = [2, 3, 4, 5, 6, 9];

/**
 * Mapear respostas para scoring AQ-10
 * 1 = Concordo totalmente
 * 2 = Concordo parcialmente
 * 3 = Discordo parcialmente
 * 4 = Discordo totalmente
 */
const isAgreeResponse = (value: number): boolean => {
  return value === 1 || value === 2;
};

const isDisagreeResponse = (value: number): boolean => {
  return value === 3 || value === 4;
};

export const scoreAQItem = (itemIndex: number, response: number): number => {
  if (AGREE_SCORED_ITEMS.includes(itemIndex)) {
    return isAgreeResponse(response) ? 1 : 0;
  }
  if (DISAGREE_SCORED_ITEMS.includes(itemIndex)) {
    return isDisagreeResponse(response) ? 1 : 0;
  }
  throw new Error(
    `AQ-10 scoring configuration error: invalid item index ${itemIndex}`,
  );
};

export const calculateAQ10 = (
  responses: AQ10Response,
  contextual?: AQ10ContextualAnswers,
): AssessmentResult => {
  const values = [
    responses.q1,
    responses.q2,
    responses.q3,
    responses.q4,
    responses.q5,
    responses.q6,
    responses.q7,
    responses.q8,
    responses.q9,
    responses.q10,
  ];

  // Validar respostas
  const validValues = values.filter((v) => v != null);
  if (validValues.length < 10) {
    return {
      instrumentId: "aq10",
      completedAt: new Date().toISOString(),
      valid: false,
      answeredItems: validValues.length,
      missingItems: 10 - validValues.length,
      safetyFlags: [],
      interpretation:
        "Respostas incompletas. Por favor, responda todos os itens.",
      disclaimer: "Resultado não calculado devido a respostas ausentes.",
    };
  }

  // Calcular score com algoritmo específico do AQ-10
  let rawScore = 0;
  for (let i = 0; i < values.length; i++) {
    // Índices são 0-based, mas AGREE_SCORED_ITEMS usa 1-based
    const itemNumber = i + 1;
    rawScore += scoreAQItem(itemNumber, values[i]);
  }

  const maxScore = 10;

  // Classificar (ponto de corte oficial: >= 6)
  let screenStatus: ScreenStatus = "negative";
  let classification = "";

  if (rawScore >= 6) {
    classification = "Faixa de rastreio positivo";
    screenStatus = "positive";
  } else {
    classification = "Faixa de rastreio negativo";
    screenStatus = "negative";
  }

  // Interpretação
  const baseInterpretation =
    screenStatus === "positive"
      ? "Seu resultado atingiu o ponto de referência utilizado por diretrizes clínicas para considerar uma avaliação mais abrangente de características do espectro autista. O AQ-10 não estabelece diagnóstico isoladamente."
      : "Seu resultado ficou abaixo do ponto de referência deste instrumento. Isso não exclui a possibilidade de autismo quando existem características relevantes, histórico compatível ou preocupação clínica.";

  const contextualNote =
    contextual?.impactAreas && contextual.impactAreas.length > 0
      ? ` Você indicou que essas características provocam dificuldades ou exigem esforço em: ${contextual.impactAreas.join(", ")}.`
      : "";

  const childhoodNote =
    contextual?.childhoodCharacteristics === "yes"
      ? " Você mencionou que características semelhantes estavam presentes na sua infância ou adolescência."
      : "";

  const interpretation = baseInterpretation + contextualNote + childhoodNote;

  return {
    instrumentId: "aq10",
    completedAt: new Date().toISOString(),
    rawScore,
    maxScore,
    classification,
    screenStatus,
    answeredItems: validValues.length,
    missingItems: 0,
    valid: true,
    safetyFlags: [],
    interpretation,
    disclaimer:
      "O AQ-10 é um instrumento de rastreio e não deve ser utilizado isoladamente para confirmar ou excluir autismo. Uma avaliação clínica completa é necessária para diagnóstico. Este instrumento não substitui avaliação profissional.",
  };
};

export const AQ10_MIN_SCORE = 0;
export const AQ10_MAX_SCORE = 10;
export const AQ10_SCREENING_THRESHOLD = 6;

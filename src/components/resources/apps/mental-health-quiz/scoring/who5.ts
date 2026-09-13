import { AssessmentResult, ScreenStatus } from "../types";
import { ScoringHelpers } from "./helpers";

/**
 * WHO-5: World Health Organization Well-Being Index
 * Rastreio de bem-estar
 * Válido: sim (modo: demo/validated)
 * NOTA: pontuação ALTA = MELHOR bem-estar (inverso do PHQ)
 */

export interface WHO5Response {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}

export const calculateWHO5 = (responses: WHO5Response): AssessmentResult => {
  const values = [
    responses.q1,
    responses.q2,
    responses.q3,
    responses.q4,
    responses.q5,
  ];

  // Validar respostas
  const validValues = values.filter((v) => v != null);
  if (validValues.length < 5) {
    return {
      instrumentId: "who5",
      completedAt: new Date().toISOString(),
      valid: false,
      answeredItems: validValues.length,
      missingItems: 5 - validValues.length,
      safetyFlags: [],
      interpretation:
        "Respostas incompletas. Por favor, responda todos os itens.",
      disclaimer: "Resultado não calculado devido a respostas ausentes.",
    };
  }

  // Calcular score
  const rawScore = ScoringHelpers.sum(validValues);
  const maxScore = 25;
  const percentageScore = rawScore * 4; // Converter para 0-100

  // Classificar
  let screenStatus: ScreenStatus = "negative";
  if (rawScore < 13 || percentageScore < 52) {
    screenStatus = "borderline";
  }

  // Interpretação
  const interpretation =
    rawScore < 13
      ? "Sua pontuação ficou abaixo do ponto de referência utilizado para bem-estar. Esse resultado pode indicar que uma avaliação mais aprofundada de seu bem-estar e possíveis dificuldades de saúde mental pode ser pertinente."
      : "Sua pontuação ficou na faixa associada a maior bem-estar relatado. Pontuações maiores neste instrumento indicam maior frequência de experiências positivas de bem-estar.";

  return {
    instrumentId: "who5",
    completedAt: new Date().toISOString(),
    rawScore,
    normalizedScore: percentageScore,
    maxScore,
    classification:
      percentageScore >= 52 ? "Bem-estar adequado" : "Bem-estar reduzido",
    screenStatus,
    answeredItems: validValues.length,
    missingItems: 0,
    valid: true,
    safetyFlags: [],
    interpretation,
    disclaimer:
      "Este questionário tem finalidade de rastreio de bem-estar. O resultado não substitui uma avaliação clínica profissional. Pontuações abaixo do ponto de referência indicam que uma avaliação mais aprofundada pode ser apropriada.",
  };
};

export const WHO5_MIN_SCORE = 0;
export const WHO5_MAX_SCORE = 25;
export const WHO5_THRESHOLD = 13; // raw score
export const WHO5_THRESHOLD_PERCENTAGE = 52; // percentual

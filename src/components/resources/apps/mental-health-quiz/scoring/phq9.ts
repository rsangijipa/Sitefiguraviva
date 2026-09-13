import { AssessmentResult, ScreenStatus } from "../types";
import { ScoringHelpers } from "./helpers";

/**
 * PHQ-9: Patient Health Questionnaire-9
 * Rastreio de sintomas depressivos
 * Válido: sim (modo: demo/validated)
 */

export interface PHQ9Response {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
}

export const calculatePHQ9 = (responses: PHQ9Response): AssessmentResult => {
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
  ];

  // Validar respostas
  const validValues = values.filter((v) => v != null);
  if (validValues.length < 9) {
    return {
      instrumentId: "phq9",
      completedAt: new Date().toISOString(),
      valid: false,
      answeredItems: validValues.length,
      missingItems: 9 - validValues.length,
      safetyFlags: [],
      interpretation:
        "Respostas incompletas. Por favor, responda todos os itens.",
      disclaimer: "Resultado não calculado devido a respostas ausentes.",
    };
  }

  // Calcular score
  const rawScore = ScoringHelpers.sum(validValues);
  const maxScore = 27;
  const normalizedScore = ScoringHelpers.normalize(rawScore, 0, maxScore);

  // Classificar
  let classification = "";
  let screenStatus: ScreenStatus = "negative";

  if (rawScore <= 4) {
    classification = "Mínimo";
    screenStatus = "negative";
  } else if (rawScore <= 9) {
    classification = "Leve";
    screenStatus = "negative";
  } else if (rawScore <= 14) {
    classification = "Moderado";
    screenStatus = "borderline";
  } else if (rawScore <= 19) {
    classification = "Moderadamente grave";
    screenStatus = "positive";
  } else {
    classification = "Grave";
    screenStatus = "positive";
  }

  // Verificar segurança (item 9)
  const safetyFlags: string[] = [];
  if (responses.q9 > 0) {
    safetyFlags.push("self_harm_item_positive");
  }

  // Interpretação
  const interpretationBase =
    rawScore < 10
      ? "Neste instrumento, sua pontuação ficou na faixa associada a menor frequência de sintomas depressivos relatados."
      : rawScore < 15
        ? "Sua pontuação ficou na faixa associada a sintomas depressivos de intensidade leve a moderada."
        : "Sua pontuação ficou na faixa associada a sintomas depressivos de intensidade moderada a grave.";

  const interpretation =
    screenStatus === "positive"
      ? `${interpretationBase} Uma avaliação mais aprofundada com um profissional de saúde mental pode ser pertinente.`
      : interpretationBase;

  return {
    instrumentId: "phq9",
    completedAt: new Date().toISOString(),
    rawScore,
    normalizedScore,
    maxScore,
    classification,
    screenStatus,
    answeredItems: validValues.length,
    missingItems: 0,
    valid: true,
    safetyFlags,
    interpretation,
    disclaimer:
      "Este questionário tem finalidade de rastreio e auto-observação. O resultado não constitui diagnóstico psicológico ou psiquiátrico. Condições como privação de sono, estresse agudo e outras condições médicas também podem produzir sintomas semelhantes.",
  };
};

export const PHQ9_MIN_SCORE = 0;
export const PHQ9_MAX_SCORE = 27;
export const PHQ9_SCREENING_THRESHOLD = 10;

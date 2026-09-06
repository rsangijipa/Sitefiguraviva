import { AssessmentResult, ValidatedInstrument } from "../types";
import { calculatePHQ9 } from "../scoring/phq9";

/**
 * Motor central de cálculo de instrumentos validados
 * Função única que mapeia respostas para o algoritmo correto
 */

export const calculateAssessment = (
  instrumentId: string,
  responses: Record<string, any>,
): AssessmentResult => {
  switch (instrumentId.toLowerCase()) {
    case "phq9":
      return calculatePHQ9({
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
        q5: responses.q5,
        q6: responses.q6,
        q7: responses.q7,
        q8: responses.q8,
        q9: responses.q9,
      });

    case "who5":
      // return calculateWHO5({...});
      throw new Error("WHO-5 ainda não implementado");

    case "cbi":
      // return calculateCBI({...});
      throw new Error("CBI ainda não implementado");

    case "asrs6":
      // return calculateASRS({...});
      throw new Error("ASRS ainda não implementado");

    case "aq10":
      // return calculateAQ10({...});
      throw new Error("AQ-10 ainda não implementado");

    default:
      throw new Error(`Instrumento desconhecido: ${instrumentId}`);
  }
};

/**
 * Validar se um instrumento está completo antes de calcular
 */
export const validateInstrumentResponses = (
  instrument: ValidatedInstrument,
  responses: Record<string, any>,
): { valid: boolean; missingItems: string[] } => {
  const missingItems: string[] = [];

  for (const question of instrument.questions) {
    if (responses[question.id] == null) {
      missingItems.push(question.id);
    }
  }

  return {
    valid: missingItems.length === 0,
    missingItems,
  };
};

/**
 * Recuperar informações de interpretação de um resultado
 */
export const getInterpretation = (
  instrument: ValidatedInstrument,
  score: number,
): string => {
  for (const rule of instrument.interpretation) {
    if (rule.condition(score)) {
      return rule.description;
    }
  }
  return "Resultado não classificado.";
};

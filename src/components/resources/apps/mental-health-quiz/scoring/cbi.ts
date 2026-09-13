import { AssessmentResult } from "../types";
import { ScoringHelpers } from "./helpers";

/**
 * CBI: Copenhagen Burnout Inventory
 * 19 itens em 3 domínios
 * Valido: sim (modo: demo/validated)
 * COMPLEXO: reverse scoring, domínio condicional
 */

export interface CBIResponse {
  // Pessoal (PB1-PB6)
  pb1: number;
  pb2: number;
  pb3: number;
  pb4: number;
  pb5: number;
  pb6: number;

  // Trabalho (WB1-WB7)
  wb1: number;
  wb2: number;
  wb3: number;
  wb4: number;
  wb5: number;
  wb6: number;
  wb7: number; // REVERSE

  // Cliente (CB1-CB6) - CONDICIONAL
  cb1?: number;
  cb2?: number;
  cb3?: number;
  cb4?: number;
  cb5?: number;
  cb6?: number;

  // Contexto
  workWithClients?: boolean; // Define se CB é aplicável
}

export interface CBIDomainResult {
  id: string;
  name: string;
  score: number | null;
  maxScore: number;
  valid: boolean;
  answeredItems: number;
  missingItems: number;
}

export const calculateCBIDomain = (
  values: number[],
  minItems: number = 3,
): CBIDomainResult | null => {
  const validValues = values.filter((v) => v != null);

  if (validValues.length < minItems) {
    return {
      id: "",
      name: "",
      score: null,
      maxScore: 100,
      valid: false,
      answeredItems: validValues.length,
      missingItems: values.length - validValues.length,
    };
  }

  // Escala CBI: 0, 25, 50, 75, 100
  // Média dos itens respondidos
  const mean = ScoringHelpers.mean(validValues);

  if (mean === null) return null;

  return {
    id: "",
    name: "",
    score: Math.round(mean),
    maxScore: 100,
    valid: true,
    answeredItems: validValues.length,
    missingItems: 0,
  };
};

export const calculateCBI = (responses: CBIResponse): AssessmentResult => {
  // Domínio 1: Burnout Pessoal (PB1-PB6)
  const pbValues = [
    responses.pb1,
    responses.pb2,
    responses.pb3,
    responses.pb4,
    responses.pb5,
    responses.pb6,
  ];

  const personalBurnout = calculateCBIDomain(pbValues, 3);
  if (!personalBurnout) {
    return createInvalidCBIResult("Respostas insuficientes no domínio pessoal");
  }
  personalBurnout.id = "personal";
  personalBurnout.name = "Esgotamento pessoal";

  // Domínio 2: Burnout Relacionado ao Trabalho (WB1-WB7)
  // ATENÇÃO: WB7 é item reverse
  const wbValues = [
    responses.wb1,
    responses.wb2,
    responses.wb3,
    responses.wb4,
    responses.wb5,
    responses.wb6,
    responses.wb7 !== null ? ScoringHelpers.reverse(responses.wb7, 100) : null,
  ];

  const workBurnout = calculateCBIDomain(wbValues, 4);
  if (!workBurnout) {
    return createInvalidCBIResult(
      "Respostas insuficientes no domínio trabalho",
    );
  }
  workBurnout.id = "work";
  workBurnout.name = "Esgotamento relacionado ao trabalho";

  // Domínio 3: Burnout Relacionado a Clientes (CB1-CB6)
  // CONDICIONAL: só incluir se user trabalha com clientes
  const domains: CBIDomainResult[] = [personalBurnout, workBurnout];

  let clientBurnout: CBIDomainResult | null = null;

  if (responses.workWithClients === true) {
    const cbValues = [
      responses.cb1,
      responses.cb2,
      responses.cb3,
      responses.cb4,
      responses.cb5,
      responses.cb6,
    ];

    clientBurnout = calculateCBIDomain(cbValues, 3);
    if (clientBurnout) {
      clientBurnout.id = "client";
      clientBurnout.name = "Esgotamento relacionado a clientes/pacientes";
      domains.push(clientBurnout);
    }
  }

  // Todas válidas?
  const allValid = domains.every((d) => d.valid);

  if (!allValid) {
    return createInvalidCBIResult("Domínios com respostas insuficientes");
  }

  // Interpretação
  const highestDomain = domains.reduce((max, current) =>
    current.score && (!max.score || current.score > max.score) ? current : max,
  );

  const interpretation =
    highestDomain.score && highestDomain.score > 70
      ? `Seu resultado indica maiores níveis de esgotamento no domínio "${highestDomain.name}". Uma avaliação mais aprofundada com um profissional de saúde mental pode ser importante.`
      : "Seu resultado indica níveis variáveis de esgotamento. Lembre-se que este instrumento avalia frequência de sintomas, não diagnóstico.";

  // Contar itens respondidos
  const allAnswers = [
    ...pbValues,
    ...wbValues,
    ...(responses.workWithClients
      ? [
          responses.cb1,
          responses.cb2,
          responses.cb3,
          responses.cb4,
          responses.cb5,
          responses.cb6,
        ]
      : []),
  ];
  const answeredCount = allAnswers.filter((v) => v != null).length;

  return {
    instrumentId: "cbi",
    completedAt: new Date().toISOString(),
    valid: true,
    answeredItems: answeredCount,
    missingItems: 0,
    safetyFlags: [],
    domains: domains.map((d) => ({
      id: d.id,
      label: d.name,
      score: d.score || 0,
      max: 100,
    })),
    interpretation,
    disclaimer:
      "Este questionário tem finalidade de rastreio de esgotamento profissional (burnout). O resultado não constitui diagnóstico médico ou psicológico. Esgotamento pode estar associado a múltiplos fatores e requer avaliação profissional abrangente.",
  };
};

function createInvalidCBIResult(message: string): AssessmentResult {
  return {
    instrumentId: "cbi",
    completedAt: new Date().toISOString(),
    valid: false,
    answeredItems: 0,
    missingItems: 19,
    safetyFlags: [],
    interpretation: `Respostas incompletas. ${message}`,
    disclaimer: "Resultado não calculado.",
  };
}

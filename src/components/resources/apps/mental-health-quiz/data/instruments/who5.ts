import { ValidatedInstrument } from "../../types";
import { calculateWHO5 } from "../../scoring/who5";

/**
 * WHO-5: World Health Organization Well-Being Index
 * Instrumento validado de rastreio para bem-estar geral e possíveis indicadores de depressão
 */

export const WHO5: ValidatedInstrument = {
  id: "who5",
  slug: "who-5-bem-estar",
  name: "World Health Organization Well-Being Index",
  publicTitle: "Bem-estar e qualidade de vida",
  acronym: "WHO-5",
  type: "validated_instrument",
  mode: "demo",
  category: "mental-health",
  purpose: "Rastreio de bem-estar geral e indicador de possível depressão",
  population: "Adolescentes e adultos (13+)",
  timeframe: "Últimas duas semanas",

  questions: [
    {
      id: "q1",
      order: 1,
      officialText: undefined,
      demoText:
        "Nas últimas duas semanas, com que frequência você se sentiu alegre e de bom humor?",
      domain: "bem-estar",
      responseScale: "0-5",
    },
    {
      id: "q2",
      order: 2,
      officialText: undefined,
      demoText: "Com que frequência você se sentiu calmo e relaxado?",
      domain: "tranquilidade",
      responseScale: "0-5",
    },
    {
      id: "q3",
      order: 3,
      officialText: undefined,
      demoText:
        "Com que frequência você se sentiu ativo e com energia para realizar suas atividades?",
      domain: "energia",
      responseScale: "0-5",
    },
    {
      id: "q4",
      order: 4,
      officialText: undefined,
      demoText: "Acordava sentindo-se descansado e revigorado?",
      domain: "descanso",
      responseScale: "0-5",
    },
    {
      id: "q5",
      order: 5,
      officialText: undefined,
      demoText:
        "Com que frequência sua vida diária foi preenchida com atividades interessantes?",
      domain: "interesse",
      responseScale: "0-5",
    },
  ],

  scoring: {
    type: "percentage",
    algorithm: (responses: Record<string, any>) => {
      return calculateWHO5({
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
        q5: responses.q5,
      });
    },
  },

  interpretation: [
    {
      condition: (score) => score < 52,
      classification: "Bem-estar reduzido",
      screenStatus: "positive",
      description:
        "Sua pontuação indica bem-estar reduzido. Um bem-estar baixo pode estar associado a sintomas depressivos.",
    },
    {
      condition: (score) => score >= 52,
      classification: "Bem-estar adequado",
      screenStatus: "negative",
      description:
        "Sua pontuação indica bem-estar adequado. Você relata satisfação e energia em suas atividades diárias.",
    },
  ],

  safetyRules: [
    {
      questionId: "q1",
      trigger: (answer) => answer <= 1,
      level: "attention",
      message:
        "Você indicou baixa frequência de humor positivo. Se isso persiste, considere conversar com um profissional.",
    },
  ],

  evidence: {
    authors: "World Health Organization (WHO)",
    year: 1998,
    reference:
      "The World Health Organization Quality of Life Assessment (WHOQOL): Development and general psychometric properties",
    licensingNote:
      "O WHO-5 é de domínio público para uso em pesquisa e prática clínica.",
  },

  disclaimer:
    "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico psicológico ou psiquiátrico.",

  licensing: {
    status: "open",
    note: "Disponível para uso educacional e clínico por órgãos públicos e profissionais de saúde.",
  },
};

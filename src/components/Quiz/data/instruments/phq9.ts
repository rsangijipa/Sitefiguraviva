import { ValidatedInstrument } from "../../types";
import { calculatePHQ9 } from "../../scoring/phq9";

/**
 * PHQ-9: Patient Health Questionnaire-9
 * Instrumento validado de rastreio para sintomas depressivos
 */

export const PHQ9: ValidatedInstrument = {
  id: "phq9",
  slug: "phq-9-depressao",
  name: "Patient Health Questionnaire-9",
  publicTitle: "Humor e sintomas depressivos",
  acronym: "PHQ-9",
  type: "validated_instrument",
  mode: "demo",
  category: "mental-health",
  purpose: "Rastreio de sintomas depressivos",
  population: "Adolescentes e adultos (12+)",
  timeframe: "Últimas duas semanas",

  questions: [
    {
      id: "q1",
      order: 1,
      officialText: undefined,
      demoText:
        "Nas últimas duas semanas, com que frequência você percebeu pouco interesse ou prazer nas atividades?",
      domain: "interesse/prazer",
      responseScale: "0-3",
    },
    {
      id: "q2",
      order: 2,
      officialText: undefined,
      demoText:
        "Com que frequência você se percebeu triste, desanimado ou com sensação de desesperança?",
      domain: "humor",
      responseScale: "0-3",
    },
    {
      id: "q3",
      order: 3,
      officialText: undefined,
      demoText:
        "Com que frequência você teve dificuldades relacionadas ao sono, como dormir pouco, dormir demais ou não descansar adequadamente?",
      domain: "sono",
      responseScale: "0-3",
    },
    {
      id: "q4",
      order: 4,
      officialText: undefined,
      demoText:
        "Com que frequência você percebeu pouca energia ou cansaço excessivo?",
      domain: "energia",
      responseScale: "0-3",
    },
    {
      id: "q5",
      order: 5,
      officialText: undefined,
      demoText:
        "Com que frequência percebeu mudanças importantes no apetite, comendo muito menos ou muito mais que o habitual?",
      domain: "apetite",
      responseScale: "0-3",
    },
    {
      id: "q6",
      order: 6,
      officialText: undefined,
      demoText:
        "Com que frequência você teve pensamentos muito negativos sobre si, sentindo-se inadequado ou decepcionado consigo?",
      domain: "autoavaliação",
      responseScale: "0-3",
    },
    {
      id: "q7",
      order: 7,
      officialText: undefined,
      demoText:
        "Com que frequência teve dificuldade para manter a concentração em atividades como leitura, trabalho ou televisão?",
      domain: "concentração",
      responseScale: "0-3",
    },
    {
      id: "q8",
      order: 8,
      officialText: undefined,
      demoText:
        "Com que frequência percebeu lentificação importante ou, ao contrário, inquietação maior que o habitual?",
      domain: "psicomotor",
      responseScale: "0-3",
    },
    {
      id: "q9",
      order: 9,
      officialText: undefined,
      demoText:
        "Com que frequência surgiram pensamentos relacionados a não querer estar vivo ou a causar algum dano a si mesmo?",
      domain: "segurança",
      responseScale: "0-3",
      safetyCritical: true,
    },
  ],

  scoring: {
    type: "sum",
    algorithm: (responses: Record<string, any>) => {
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
    },
  },

  interpretation: [
    {
      condition: (score) => score <= 4,
      classification: "Mínimo",
      screenStatus: "negative",
      description:
        "Sua pontuação indica mínima frequência de sintomas depressivos relatados.",
    },
    {
      condition: (score) => score <= 9,
      classification: "Leve",
      screenStatus: "negative",
      description:
        "Sua pontuação indica leve frequência de sintomas depressivos relatados.",
    },
    {
      condition: (score) => score <= 14,
      classification: "Moderado",
      screenStatus: "borderline",
      description:
        "Sua pontuação indica moderada frequência de sintomas depressivos relatados.",
    },
    {
      condition: (score) => score <= 19,
      classification: "Moderadamente grave",
      screenStatus: "positive",
      description:
        "Sua pontuação indica moderadamente grave frequência de sintomas depressivos relatados.",
    },
    {
      condition: () => true,
      classification: "Grave",
      screenStatus: "positive",
      description:
        "Sua pontuação indica grave frequência de sintomas depressivos relatados.",
    },
  ],

  safetyRules: [
    {
      questionId: "q9",
      trigger: (answer) => answer > 0,
      level: "urgent",
      message:
        "Você indicou a presença de pensamentos relacionados à morte ou autoagressão.",
    },
  ],

  evidence: {
    authors: "Kroenke K, Spitzer RL, Williams JB",
    year: 2001,
    reference: "The PHQ-9: validity of a brief depression severity measure",
    licensingNote:
      "O PHQ-9 é domínio público. Informação para referência educativa apenas.",
  },

  disclaimer:
    "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico psicológico ou psiquiátrico.",

  licensing: {
    status: "open",
    note: "Disponível para uso educacional e clínico.",
  },
};

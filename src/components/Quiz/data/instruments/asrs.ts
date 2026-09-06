import { ValidatedInstrument } from "../../types";
import { calculateASRS } from "../../scoring/asrs";

/**
 * ASRS v1.1: Adult ADHD Self-Report Scale (6-item version)
 * Instrumento validado de rastreio para sintomas de TDAH em adultos
 * Versão reduzida da escala original de 18 itens
 */

export const ASRS: ValidatedInstrument = {
  id: "asrs6",
  slug: "asrs-tdah",
  name: "Adult ADHD Self-Report Scale (6-item version)",
  publicTitle: "Características relacionadas à atenção",
  acronym: "ASRS v1.1",
  type: "validated_instrument",
  mode: "demo",
  category: "neurodiversity",
  purpose: "Rastreio de sintomas relacionados a TDAH em adultos",
  population: "Adultos (18+)",
  timeframe: "Últimos 6 meses",

  questions: [
    {
      id: "q1",
      order: 1,
      officialText: undefined,
      demoText:
        "Com que frequência você comete erros por falta de atenção quando trabalha em uma tarefa chata ou desafiadora?",
      domain: "atenção",
      responseScale: "0-4",
    },
    {
      id: "q2",
      order: 2,
      officialText: undefined,
      demoText:
        "Com que frequência você tem dificuldade para manter a atenção quando está fazendo algo chato ou repetitivo?",
      domain: "sustentação",
      responseScale: "0-4",
    },
    {
      id: "q3",
      order: 3,
      officialText: undefined,
      demoText:
        "Com que frequência você tem dificuldade para organizar tarefas e atividades?",
      domain: "organização",
      responseScale: "0-4",
    },
    {
      id: "q4",
      order: 4,
      officialText: undefined,
      demoText:
        "Quando precisa fazer algo que exige muita atenção, com que frequência você evita ou adia iniciar?",
      domain: "iniciativa",
      responseScale: "0-4",
    },
    {
      id: "q5",
      order: 5,
      officialText: undefined,
      demoText:
        "Com que frequência você se sente agitado ou inquieto quando precisa ficar parado por um tempo?",
      domain: "inquietação",
      responseScale: "0-4",
    },
    {
      id: "q6",
      order: 6,
      officialText: undefined,
      demoText:
        "Com que frequência você tem dificuldade para permanecer calmo ou tranquilo quando está esperando?",
      domain: "paciência",
      responseScale: "0-4",
    },
  ],

  scoring: {
    type: "sum",
    algorithm: (responses: Record<string, any>) => {
      return calculateASRS({
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
        q5: responses.q5,
        q6: responses.q6,
      });
    },
  },

  interpretation: [
    {
      condition: (score) => score <= 9,
      classification: "Baixo",
      screenStatus: "negative",
      description:
        "Sua pontuação indica baixa frequência de características relacionadas a TDAH.",
    },
    {
      condition: (score) => score <= 13,
      classification: "Moderado-baixo",
      screenStatus: "borderline",
      description:
        "Sua pontuação indica moderada-baixa frequência de características relacionadas a TDAH.",
    },
    {
      condition: (score) => score <= 17,
      classification: "Moderado-alto",
      screenStatus: "borderline",
      description:
        "Sua pontuação indica moderada-alta frequência de características relacionadas a TDAH.",
    },
    {
      condition: () => true,
      classification: "Alto",
      screenStatus: "positive",
      description:
        "Sua pontuação indica alta frequência de características relacionadas a TDAH. Se essas dificuldades interferem em seu trabalho ou relacionamentos, considere uma avaliação profissional.",
    },
  ],

  safetyRules: [],

  evidence: {
    authors: "Kessler RC, Adler L, Ames M, et al.",
    year: 2005,
    reference:
      "The World Health Organization Adult ADHD Self-Report Scale (ASRS): A short screening scale for use in the general population. Psychological Medicine, 35(2), 245-256.",
    licensingNote:
      "O ASRS é uma ferramenta de domínio público para uso em pesquisa e prática clínica.",
  },

  disclaimer:
    "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico de TDAH ou qualquer transtorno. Uma avaliação diagnóstica requer avaliação profissional completa.",

  licensing: {
    status: "open",
    note: "Disponível para uso educacional e clínico.",
  },
};

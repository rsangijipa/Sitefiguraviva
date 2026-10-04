import { ValidatedInstrument } from "../../types";
import { calculateAQ10 } from "../../scoring/aq10";

/**
 * AQ-10: Autism Spectrum Quotient (10-item screening version)
 * Instrumento de rastreio para características autísticas
 * Versão reduzida do AQ-50 original
 */

export const AQ10: ValidatedInstrument = {
  id: "aq10",
  slug: "aq-10-autismo",
  name: "Autism Spectrum Quotient (10-item)",
  publicTitle: "Características de comunicação e interação social",
  acronym: "AQ-10",
  type: "validated_instrument",
  mode: "demo",
  category: "neurodiversity",
  purpose: "Rastreio de características relacionadas ao espectro autista",
  population: "Adolescentes e adultos (16+)",
  timeframe: "Sem período específico",

  questions: [
    {
      id: "q1",
      order: 1,
      officialText: undefined,
      demoText: "Eu prefiro fazer coisas com outras pessoas do que sozinho.",
      domain: "sociabilidade",
      responseScale: "agree-disagree",
      scoringNote: "Concordo = 1 ponto",
    },
    {
      id: "q2",
      order: 2,
      officialText: undefined,
      demoText: "Eu prefiro fazer coisas da mesma maneira repetidamente.",
      domain: "rotina",
      responseScale: "agree-disagree",
      scoringNote: "Discordo = 1 ponto",
    },
    {
      id: "q3",
      order: 3,
      officialText: undefined,
      demoText:
        "Se tentasse imaginar algo, frequentemente surgiria uma imagem na minha mente.",
      domain: "imaginação",
      responseScale: "agree-disagree",
      scoringNote: "Discordo = 1 ponto",
    },
    {
      id: "q4",
      order: 4,
      officialText: undefined,
      demoText:
        "Frequentemente noto pequenos sons quando outras pessoas não percebem.",
      domain: "sensibilidade-auditiva",
      responseScale: "agree-disagree",
      scoringNote: "Concordo = 1 ponto",
    },
    {
      id: "q5",
      order: 5,
      officialText: undefined,
      demoText:
        "Eu notaria geralmente se havia uma mudança no meu ambiente diário.",
      domain: "detecção-mudança",
      responseScale: "agree-disagree",
      scoringNote: "Discordo = 1 ponto",
    },
    {
      id: "q6",
      order: 6,
      officialText: undefined,
      demoText:
        "Geralmente, eu acho que as pessoas estão observando-me ou falando sobre mim.",
      domain: "percepção-social",
      responseScale: "agree-disagree",
      scoringNote: "Discordo = 1 ponto",
    },
    {
      id: "q7",
      order: 7,
      officialText: undefined,
      demoText: "Eu acho difícil fazer novas amizades.",
      domain: "relacionamentos",
      responseScale: "agree-disagree",
      scoringNote: "Concordo = 1 ponto",
    },
    {
      id: "q8",
      order: 8,
      officialText: undefined,
      demoText: "Eu tenho mais de um interesse intenso e profundo.",
      domain: "interesses-restritos",
      responseScale: "agree-disagree",
      scoringNote: "Concordo = 1 ponto",
    },
    {
      id: "q9",
      order: 9,
      officialText: undefined,
      demoText:
        "Eu não gosto de conversar muito durante interações sociais e prefiro deixar os outros fazerem a maioria do diálogo.",
      domain: "comunicação",
      responseScale: "agree-disagree",
      scoringNote: "Discordo = 1 ponto",
    },
    {
      id: "q10",
      order: 10,
      officialText: undefined,
      demoText:
        "Quando eu era criança, eu costumava gostar mais de brincar sozinho do que com outras crianças.",
      domain: "história-social",
      responseScale: "agree-disagree",
      scoringNote: "Concordo = 1 ponto",
    },
  ],

  scoring: {
    type: "sum",
    algorithm: (responses: Record<string, any>) => {
      return calculateAQ10({
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
        q5: responses.q5,
        q6: responses.q6,
        q7: responses.q7,
        q8: responses.q8,
        q9: responses.q9,
        q10: responses.q10,
      });
    },
  },

  interpretation: [
    {
      condition: (score) => score < 6,
      classification: "Baixa probabilidade",
      screenStatus: "negative",
      description:
        "Sua pontuação indica baixa probabilidade de características associadas ao espectro autista.",
    },
    {
      condition: () => true,
      classification: "Probabilidade aumentada",
      screenStatus: "positive",
      description:
        "Sua pontuação sugere presença de características associadas ao espectro autista. Se deseja explorar isso mais, uma avaliação profissional completa é recomendada.",
    },
  ],

  safetyRules: [],

  evidence: {
    authors: "Baron-Cohen S, Wheelwright S, Skinner R, Martin J, Clubley E",
    year: 2001,
    reference:
      "The autism-spectrum quotient (AQ): Evidence from Asperger syndrome/high-functioning autism, males and females, scientists and mathematicians. Journal of Autism and Developmental Disorders, 31(1), 5-17.",
    licensingNote: "O AQ-10 é uma versão de rastreio de domínio público.",
  },

  disclaimer:
    "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico de autismo ou qualquer transtorno. Uma avaliação diagnóstica requer avaliação profissional completa e multidisciplinar.",

  licensing: {
    status: "open",
    note: "Disponível para uso educacional e clínico.",
  },
};

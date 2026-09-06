import { ValidatedInstrument } from "../../types";
import { calculateCBI } from "../../scoring/cbi";

/**
 * CBI: Copenhagen Burnout Inventory
 * Instrumento validado para avaliação de síndrome de burnout em contextos profissionais
 * Composto por 3 domínios: pessoal, trabalho e cliente
 */

export const CBI: ValidatedInstrument = {
  id: "cbi",
  slug: "cbi-burnout",
  name: "Copenhagen Burnout Inventory",
  publicTitle: "Bem-estar e carga profissional",
  acronym: "CBI",
  type: "validated_instrument",
  mode: "demo",
  category: "career",
  purpose: "Avaliação de síndrome de burnout e bem-estar no trabalho",
  population: "Profissionais em atividade (18+)",
  timeframe: "Nos últimos meses",

  questions: [
    // DOMÍNIO PESSOAL (6 itens)
    {
      id: "q1",
      order: 1,
      domain: "pessoal",
      officialText: undefined,
      demoText:
        "Você se sente cansado quando acorda e precisa encarar mais um dia de trabalho?",
      responseScale: "0-4",
    },
    {
      id: "q2",
      order: 2,
      domain: "pessoal",
      officialText: undefined,
      demoText:
        "Você se sente desgastado fisicamente ao final do dia de trabalho?",
      responseScale: "0-4",
    },
    {
      id: "q3",
      order: 3,
      domain: "pessoal",
      officialText: undefined,
      demoText: "Você se sente cansado mentalmente quando termina o trabalho?",
      responseScale: "0-4",
    },
    {
      id: "q4",
      order: 4,
      domain: "pessoal",
      officialText: undefined,
      demoText:
        "Você tem dificuldade em se recuperar após um dia de trabalho particularmente exigente?",
      responseScale: "0-4",
    },
    {
      id: "q5",
      order: 5,
      domain: "pessoal",
      officialText: undefined,
      demoText: "Você se sente esgotado pelo seu trabalho?",
      responseScale: "0-4",
    },
    {
      id: "q6",
      order: 6,
      domain: "pessoal",
      officialText: undefined,
      demoText:
        "Você costuma chegar em casa depois do trabalho completamente exausto?",
      responseScale: "0-4",
    },

    // DOMÍNIO TRABALHO (7 itens, com WB7 reverso)
    {
      id: "wb1",
      order: 7,
      domain: "trabalho",
      officialText: undefined,
      demoText: "É frustrante trabalhar com as mesmas pessoas todos os dias?",
      responseScale: "0-4",
    },
    {
      id: "wb2",
      order: 8,
      domain: "trabalho",
      officialText: undefined,
      demoText: "Você acha que realiza trabalho importante e significativo?",
      responseScale: "0-4",
      scoringNote: "Item reverso na pontuação",
    },
    {
      id: "wb3",
      order: 9,
      domain: "trabalho",
      officialText: undefined,
      demoText:
        "Você sente que as pessoas com quem trabalha o reconhecem e valorizam?",
      responseScale: "0-4",
      scoringNote: "Item reverso na pontuação",
    },
    {
      id: "wb4",
      order: 10,
      domain: "trabalho",
      officialText: undefined,
      demoText:
        "Você acha que sua carga de trabalho é apropriada para o tempo disponível?",
      responseScale: "0-4",
      scoringNote: "Item reverso na pontuação",
    },
    {
      id: "wb5",
      order: 11,
      domain: "trabalho",
      officialText: undefined,
      demoText:
        "Você tem dificuldade em manter o equilibrio entre trabalho e vida pessoal?",
      responseScale: "0-4",
    },
    {
      id: "wb6",
      order: 12,
      domain: "trabalho",
      officialText: undefined,
      demoText:
        "Você se sente infeliz com o progresso profissional e perspectivas de carreira?",
      responseScale: "0-4",
    },
    {
      id: "wb7",
      order: 13,
      domain: "trabalho",
      officialText: undefined,
      demoText: "Você sente que trabalha bem com seus colegas?",
      responseScale: "0-4",
      scoringNote: "Item reverso na pontuação",
    },

    // DOMÍNIO CLIENTE (6 itens, CONDICIONAL)
    {
      id: "cli1",
      order: 14,
      domain: "cliente",
      officialText: undefined,
      demoText:
        "É fácil manter distância emocional apropriada com seus clientes/pacientes/alunos?",
      responseScale: "0-4",
      scoringNote:
        "Item reverso na pontuação. Apenas se trabalha com clientes.",
      conditional: true,
    },
    {
      id: "cli2",
      order: 15,
      domain: "cliente",
      officialText: undefined,
      demoText:
        "Você sente que trabalha demais diretamente com clientes/pacientes/alunos?",
      responseScale: "0-4",
      conditional: true,
    },
    {
      id: "cli3",
      order: 16,
      domain: "cliente",
      officialText: undefined,
      demoText:
        "É fácil para você entender o que seus clientes/pacientes/alunos precisam?",
      responseScale: "0-4",
      scoringNote:
        "Item reverso na pontuação. Apenas se trabalha com clientes.",
      conditional: true,
    },
    {
      id: "cli4",
      order: 17,
      domain: "cliente",
      officialText: undefined,
      demoText:
        "Você sente frustração por falta de resultados visíveis com seus clientes/pacientes/alunos?",
      responseScale: "0-4",
      conditional: true,
    },
    {
      id: "cli5",
      order: 18,
      domain: "cliente",
      officialText: undefined,
      demoText:
        "Você sente que trabalha com os clientes/pacientes/alunos de forma rotineira?",
      responseScale: "0-4",
      conditional: true,
    },
    {
      id: "cli6",
      order: 19,
      domain: "cliente",
      officialText: undefined,
      demoText:
        "Você sente que seus clientes/pacientes/alunos culpam você por seus problemas?",
      responseScale: "0-4",
      conditional: true,
    },
  ],

  scoring: {
    type: "multi_domain",
    algorithm: (responses: Record<string, any>) => {
      return calculateCBI({
        // Domínio Pessoal
        pb1: responses.q1,
        pb2: responses.q2,
        pb3: responses.q3,
        pb4: responses.q4,
        pb5: responses.q5,
        pb6: responses.q6,
        // Domínio Trabalho
        wb1: responses.wb1,
        wb2: responses.wb2,
        wb3: responses.wb3,
        wb4: responses.wb4,
        wb5: responses.wb5,
        wb6: responses.wb6,
        wb7: responses.wb7,
        // Domínio Cliente (condicional)
        cb1: responses.cli1,
        cb2: responses.cli2,
        cb3: responses.cli3,
        cb4: responses.cli4,
        cb5: responses.cli5,
        cb6: responses.cli6,
        workWithClients: true,
      });
    },
  },

  interpretation: [
    {
      condition: (score) => score <= 25,
      classification: "Baixo",
      screenStatus: "negative",
      description:
        "Sua pontuação indica baixo nível de burnout. Você relata bom bem-estar profissional.",
    },
    {
      condition: (score) => score <= 50,
      classification: "Moderado",
      screenStatus: "borderline",
      description:
        "Sua pontuação indica nível moderado de burnout. Considere avaliar fontes de estresse e autocuidado.",
    },
    {
      condition: (score) => score <= 75,
      classification: "Elevado",
      screenStatus: "positive",
      description:
        "Sua pontuação indica elevado nível de burnout. Recomenda-se conversar com um profissional de saúde mental.",
    },
    {
      condition: () => true,
      classification: "Muito elevado",
      screenStatus: "positive",
      description:
        "Sua pontuação indica muito elevado nível de burnout. Busque suporte profissional urgentemente.",
    },
  ],

  safetyRules: [
    {
      questionId: "q5",
      trigger: (answer) => answer >= 3,
      level: "attention",
      message:
        "Você indicou alto nível de esgotamento. Isso pode afetar sua saúde. Considere buscar apoio profissional.",
    },
  ],

  evidence: {
    authors: "Kristensen TS, Borritz M, Villadsen E, Christensen KB",
    year: 2005,
    reference:
      "The Copenhagen Burnout Inventory: A new tool for the assessment of burnout. Work & Stress, 19(3), 192-207.",
    licensingNote:
      "O CBI é de domínio público para uso em pesquisa e prática clínica.",
  },

  disclaimer:
    "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico médico ou psicológico. Se você estiver experimentando sintomas significativos de burnout, recomenda-se buscar apoio de um profissional de saúde mental.",

  licensing: {
    status: "open",
    note: "Disponível para uso educacional e clínico.",
  },
};

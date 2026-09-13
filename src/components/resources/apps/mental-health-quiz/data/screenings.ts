import { Screening } from "../types";

export const SCREENINGS: Screening[] = [
  {
    id: "anxiety-screening",
    type: "screening",
    title: "Sinais de ansiedade",
    subtitle: "Auto-observação das últimas duas semanas",
    description:
      "Questionário autoral de auto-observação sobre sinais e sintomas de ansiedade",
    category: "mental-health",
    estimatedTime: 180,
    disclaimer:
      "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico psicológico ou psiquiátrico. Condições como privação de sono, estresse agudo e outras condições médicas também podem produzir sintomas semelhantes.",
    answerOptions: [
      "Nunca",
      "Raramente",
      "Às vezes",
      "Frequentemente",
      "Quase sempre",
    ],
    domains: [
      {
        id: "preocupacao",
        name: "Preocupação",
        description: "Preocupações persistentes e dificuldade de controle",
        questionIds: ["q1", "q2"],
      },
      {
        id: "tensao-fisica",
        name: "Tensão Física",
        description: "Manifestações físicas da ansiedade",
        questionIds: ["q3", "q4"],
      },
      {
        id: "concentracao",
        name: "Concentração",
        description: "Dificuldades cognitivas associadas",
        questionIds: ["q5", "q6"],
      },
      {
        id: "interferencia",
        name: "Interferência na Rotina",
        description: "Impacto no funcionamento diário",
        questionIds: ["q7", "q8"],
      },
    ],
    questions: [
      {
        id: "q1",
        text: "Tive dificuldade para controlar minhas preocupações",
      },
      {
        id: "q2",
        text: "Passei muito tempo preocupado com diferentes áreas da minha vida",
      },
      {
        id: "q3",
        text: "Senti-me inquieto ou incapaz de relaxar",
      },
      {
        id: "q4",
        text: "Percebi tensão física durante períodos de preocupação",
      },
      {
        id: "q5",
        text: "Tive dificuldade para me concentrar por estar preocupado",
      },
      {
        id: "q6",
        text: "Fiquei mais irritável quando estava ansioso",
      },
      {
        id: "q7",
        text: "Minha ansiedade atrapalhou meu sono",
      },
      {
        id: "q8",
        text: "Minhas preocupações interferiram na minha rotina",
      },
    ],
  },
];

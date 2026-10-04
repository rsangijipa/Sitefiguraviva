import { Quiz } from "../types";

export const QUIZZES: Quiz[] = [
  {
    id: "mental-health-today",
    type: "quiz",
    title: "Como anda sua saúde mental?",
    subtitle: "Uma reflexão rápida sobre seu bem-estar",
    description:
      "Avalie como você está se sentindo hoje em relação ao seu bem-estar geral",
    category: "mental-health",
    estimatedTime: 120,
    disclaimer:
      "Este é um questionário de autoconhecimento. Não substitui uma avaliação clínica profissional.",
    answerOptions: [
      "Nunca",
      "Raramente",
      "Às vezes",
      "Frequentemente",
      "Quase sempre",
    ],
    questions: [
      {
        id: "q1",
        text: "Tenho interesse e prazer nas atividades do dia a dia",
        description: "Ou na maioria delas",
      },
      {
        id: "q2",
        text: "Minha energia está adequada para as minhas atividades",
      },
      {
        id: "q3",
        text: "Sinto-me bem comigo mesmo",
      },
      {
        id: "q4",
        text: "Minhas relações pessoais estão satisfatórias",
      },
      {
        id: "q5",
        text: "Consigo lidar bem com as dificuldades que enfrenço",
      },
      {
        id: "q6",
        text: "Meu sono é reparador",
      },
      {
        id: "q7",
        text: "Tenho capacidade de concentração adequada",
      },
      {
        id: "q8",
        text: "Sinto-me motivado para as coisas que faço",
      },
    ],
  },
];

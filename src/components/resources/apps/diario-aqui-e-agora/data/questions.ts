import { QuestionConfig } from "../types";

export const QUESTIONS: QuestionConfig[] = [
  {
    id: "attention",
    stepNumber: 1,
    question: "O que chama sua atenção agora?",
    subtext:
      "Um som, a luz na sala, o ar entrando, um pensamento recorrente ou o silêncio.",
    tags: [
      "Sons ao redor",
      "Luz e sombras",
      "Minha respiração",
      "Um pensamento insistente",
      "Temperatura da sala",
      "Silêncio presente",
      "Toque dos pés no chão",
      "Tensão visual",
    ],
    themeColor: {
      primary: "#5d6d7e",
      blobColor1: "rgba(180, 198, 204, 0.45)",
      blobColor2: "rgba(215, 227, 222, 0.40)",
      accentNode: "#738a9c",
    },
  },
  {
    id: "body",
    stepNumber: 2,
    question: "O que você percebe no corpo?",
    subtext:
      "Sem pressa para mudar nada. Apenas notando o peso, a postura ou os pontos de contato.",
    tags: [
      "Ombros tensos",
      "Mandíbula destravada",
      "Peito espaçoso",
      "Aperto no estômago",
      "Pés firmes",
      "Calor nas mãos",
      "Peso nas pálpebras",
      "Coluna suave",
    ],
    themeColor: {
      primary: "#7d6b5c",
      blobColor1: "rgba(218, 198, 182, 0.45)",
      blobColor2: "rgba(235, 222, 211, 0.40)",
      accentNode: "#9e8470",
    },
  },
  {
    id: "feeling",
    stepNumber: 3,
    question: "Que sentimento ou sensação aparece?",
    subtext:
      "Pode ser claro ou difuso. Dê um nome simples ou sinta apenas a tonalidade.",
    tags: [
      "Tranquilidade",
      "Inquietação",
      "Acolhimento",
      "Apressamento",
      "Vazio sereno",
      "Curiosidade",
      "Cansaço gentil",
      "Gratidão discreta",
    ],
    themeColor: {
      primary: "#5f7970",
      blobColor1: "rgba(188, 212, 202, 0.45)",
      blobColor2: "rgba(210, 226, 218, 0.40)",
      accentNode: "#6e8f84",
    },
  },
  {
    id: "need",
    stepNumber: 4,
    question: "Existe alguma necessidade que se torna figura?",
    subtext:
      "Na Gestalt, aquilo que pede presença se destaca do fundo. O que se faz evidente agora?",
    tags: [
      "Pausar e silenciar",
      "Respirar fundo",
      "Água e hidratação",
      "Espaço e solitude",
      "Movimento suave",
      "Expressar algo",
      "Apenas descansar",
      "Sentir segurança",
    ],
    themeColor: {
      primary: "#856a5d",
      blobColor1: "rgba(224, 201, 187, 0.45)",
      blobColor2: "rgba(240, 220, 200, 0.38)",
      accentNode: "#a88675",
    },
  },
  {
    id: "reflection",
    stepNumber: 5,
    question: "O que acontece quando você permanece alguns instantes com isso?",
    subtext:
      "Sem julgar ou resolver. Veja o que se suaviza, se transforma ou continua com você.",
    tags: [
      "Mais espaço interno",
      "A urgência diminui",
      "A tensão amolece",
      "Permanece igual, e tudo bem",
      "Respiração mais profunda",
      "Uma leveza discreta",
      "Clareza serena",
    ],
    themeColor: {
      primary: "#6b6e82",
      blobColor1: "rgba(196, 201, 220, 0.45)",
      blobColor2: "rgba(223, 216, 227, 0.40)",
      accentNode: "#7f839d",
    },
  },
];

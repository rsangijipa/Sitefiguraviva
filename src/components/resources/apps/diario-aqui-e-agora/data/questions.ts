import { QuestionConfig } from "../types";

export const QUESTIONS: QuestionConfig[] = [
  {
    id: "attention",
    stepNumber: 1,
    question: "Como você chega a este momento?",
    subtext:
      "Faça um check-in: o que está presente, o que ficou de antes ou o que você espera? Tudo é opcional; você também pode apenas continuar.",
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
      primary: "#6B6B63",
      blobColor1: "rgb(216 207 190 / 0.45)",
      blobColor2: "rgb(241 233 219 / 0.40)",
      accentNode: "#6B6B63",
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
      primary: "#6B6B63",
      blobColor1: "rgb(216 207 190 / 0.45)",
      blobColor2: "rgb(241 233 219 / 0.40)",
      accentNode: "#6B6B63",
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
      primary: "#6B6B63",
      blobColor1: "rgb(216 207 190 / 0.45)",
      blobColor2: "rgb(241 233 219 / 0.40)",
      accentNode: "#6B6B63",
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
      primary: "#6B6B63",
      blobColor1: "rgb(216 207 190 / 0.45)",
      blobColor2: "rgb(241 233 219 / 0.38)",
      accentNode: "#6B6B63",
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
      primary: "#6B6B63",
      blobColor1: "rgb(216 207 190 / 0.45)",
      blobColor2: "rgb(241 233 219 / 0.40)",
      accentNode: "#6B6B63",
    },
  },
];

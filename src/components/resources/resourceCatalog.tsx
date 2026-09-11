import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Activity,
  BookOpen,
  Brain,
  Circle,
  Eye,
  Fingerprint,
  Flower2,
  Gauge,
  Headphones,
  HeartPulse,
  Landmark,
  Leaf,
  Lightbulb,
  Mountain,
  PenLine,
  Scale,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react";

export type ResourceCategory =
  | "PERCEBER"
  | "REGULAR"
  | "EXPERIMENTAR"
  | "APRENDER";
export type ResourceStatus = "available" | "coming-soon";

export interface ResourceSection {
  id: string;
  label: string;
  icon?: ComponentType<LucideProps>;
}

export interface ResourceDefinition {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  duration?: string;
  icon: ComponentType<LucideProps>;
  status: ResourceStatus;
  privacy: "none" | "private";
  persistence: "none" | "optional";
  sections?: ResourceSection[];
}

export const resourceCatalog: ResourceDefinition[] = [
  {
    slug: "roda-das-emocoes",
    title: "Roda das Emoções",
    description: "Encontre palavras para o que você percebe agora.",
    category: "PERCEBER",
    duration: "2–5 min",
    icon: Sparkles,
    status: "available",
    privacy: "private",
    persistence: "optional",
  },
  {
    slug: "breathing",
    title: "Guia de Respiração",
    description: "Uma pausa guiada para cultivar presença.",
    category: "REGULAR",
    duration: "2–10 min",
    icon: Wind,
    status: "available",
    privacy: "none",
    persistence: "none",
  },
  {
    slug: "grounding-54321",
    title: "5 · 4 · 3 · 2 · 1",
    description: "Oriente sua atenção para o ambiente presente.",
    category: "REGULAR",
    duration: "livre",
    icon: Eye,
    status: "available",
    privacy: "none",
    persistence: "none",
  },
  {
    slug: "emotion-tree",
    title: "Árvore das Emoções",
    description:
      "Percorra uma árvore 3D e receba mensagens para acompanhar o que emerge.",
    category: "PERCEBER",
    duration: "3–8 min",
    icon: Flower2,
    status: "available",
    privacy: "private",
    persistence: "optional",
  },
  {
    slug: "body-map",
    title: "Mapa Corporal",
    description: "Localize e descreva sensações no corpo.",
    category: "PERCEBER",
    duration: "livre",
    icon: Fingerprint,
    status: "available",
    privacy: "private",
    persistence: "none",
  },
  {
    slug: "intensidade-agora",
    title: "Intensidade Agora",
    description: "Perceba a intensidade de uma experiência sem julgá-la.",
    category: "PERCEBER",
    duration: "1–3 min",
    icon: Gauge,
    status: "available",
    privacy: "private",
    persistence: "none",
  },
  {
    slug: "diario-aqui-e-agora",
    title: "Diário do Aqui e Agora",
    description: "Um espaço privado para registrar o que se apresenta.",
    category: "PERCEBER",
    duration: "livre",
    icon: PenLine,
    status: "available",
    privacy: "private",
    persistence: "optional",
  },
  {
    slug: "somascan",
    title: "SomaScan",
    description: "Mapeamento corporal consciente.",
    category: "PERCEBER",
    icon: HeartPulse,
    status: "available",
    privacy: "private",
    persistence: "none",
  },
  {
    slug: "quiz",
    title: "Banco de Quizzes",
    description: "Perguntas e estudos para formação.",
    category: "APRENDER",
    icon: Brain,
    status: "available",
    privacy: "private",
    persistence: "optional",
  },
  {
    slug: "lago",
    title: "Lago",
    description: "Um espaço contemplativo para tocar a água.",
    category: "REGULAR",
    icon: Waves,
    status: "available",
    privacy: "none",
    persistence: "none",
  },
  {
    slug: "banco-de-microcasos",
    title: "Banco de Microcasos",
    description: "Explore situações curtas para estudo.",
    category: "APRENDER",
    icon: BookOpen,
    status: "available",
    privacy: "private",
    persistence: "optional",
    sections: [
      { id: "home", label: "Início" },
      { id: "history", label: "Minha exploração" },
    ],
  },
  {
    slug: "cartas-gestalticas",
    title: "Cartas Gestálticas",
    description: "Explore conceitos, autores e perguntas.",
    category: "APRENDER",
    icon: BookOpen,
    status: "available",
    privacy: "private",
    persistence: "optional",
    sections: [
      { id: "home", label: "Início" },
      { id: "explore", label: "Explorar" },
      { id: "review", label: "Revisão" },
      { id: "random", label: "Aleatório" },
      { id: "favorites", label: "Favoritos" },
      { id: "history", label: "Histórico" },
    ],
  },
  {
    slug: "ciclo-do-contato",
    title: "Ciclo do Contato",
    description: "Estude processos de contato.",
    category: "APRENDER",
    icon: BookOpen,
    status: "available",
    privacy: "private",
    persistence: "optional",
    sections: [
      { id: "opening", label: "Início" },
      { id: "guided", label: "Guiado" },
      { id: "free", label: "Explorar" },
      { id: "practice", label: "Aplicar" },
      { id: "review", label: "Rever" },
    ],
  },
  {
    slug: "fronteiras-de-contato",
    title: "Fronteiras de Contato",
    description: "Reflita sobre aproximação e limites.",
    category: "APRENDER",
    icon: Scale,
    status: "available",
    privacy: "private",
    persistence: "optional",
    sections: [
      { id: "experiment", label: "Experiência" },
      { id: "catalog", label: "Vinhetas" },
      { id: "diary", label: "Diário" },
      { id: "theory", label: "Teoria" },
    ],
  },
  ...[
    [
      "figura-e-fundo",
      "Figura e Fundo",
      "Observe como algo emerge dentro de um campo.",
      "EXPERIMENTAR",
      Circle,
    ],
    [
      "polaridades",
      "Polaridades",
      "Explore tendências distintas que coexistem.",
      "EXPERIMENTAR",
      Scale,
    ],
    [
      "duas-cadeiras",
      "Duas Cadeiras",
      "Escreva por perspectivas alternadas.",
      "EXPERIMENTAR",
      Landmark,
    ],
    [
      "necessidades-agora",
      "Necessidades Agora",
      "Dê espaço ao que se torna figura.",
      "PERCEBER",
      Lightbulb,
    ],
    [
      "check-in",
      "Check-in",
      "Perceba como você chega agora.",
      "PERCEBER",
      Activity,
    ],
    [
      "respiracao-livre",
      "Respiração Livre",
      "Acompanhe um ritmo confortável.",
      "REGULAR",
      Wind,
    ],
    [
      "campo-de-composicao",
      "Campo de Composição",
      "Organize elementos livremente no espaço.",
      "EXPERIMENTAR",
      Sparkles,
    ],
    [
      "jardim-de-pensamentos",
      "Jardim de Pensamentos",
      "Observe pensamentos sem precisar afastá-los.",
      "REGULAR",
      Leaf,
    ],
    [
      "rio-dos-pensamentos",
      "Rio dos Pensamentos",
      "Deixe pensamentos seguirem seu curso.",
      "REGULAR",
      Waves,
    ],
    [
      "escuta",
      "Escuta",
      "Aproxime-se da experiência auditiva.",
      "PERCEBER",
      Headphones,
    ],
    [
      "respiracao-sonora",
      "Respiração Sonora",
      "Explore respiração acompanhada por som.",
      "REGULAR",
      Wind,
    ],
    [
      "sala-de-pausa",
      "Sala de Pausa",
      "Escolha uma experiência curta para este momento.",
      "REGULAR",
      Mountain,
    ],
    [
      "caso-clinico",
      "Caso Clínico Interativo",
      "Explore casos fictícios para formação.",
      "APRENDER",
      BookOpen,
    ],
    [
      "laboratorio-fenomenologico",
      "Laboratório Fenomenológico",
      "Diferencie observação e interpretação.",
      "APRENDER",
      Eye,
    ],
    [
      "pergunta-ou-interpretacao",
      "Pergunta ou Interpretação?",
      "Estude diferentes intervenções.",
      "APRENDER",
      Brain,
    ],
    [
      "treinador-awareness",
      "Treinador de Awareness",
      "Pratique atenção a pistas explicitamente descritas.",
      "APRENDER",
      Eye,
    ],
    [
      "construtor-experimentos",
      "Construtor de Experimentos",
      "Estruture uma possibilidade de experimento.",
      "APRENDER",
      PenLine,
    ],
    [
      "supervisao-express",
      "Supervisão Express",
      "Reflita sobre microcasos educacionais.",
      "APRENDER",
      Lightbulb,
    ],
    [
      "mapa-de-campo",
      "Mapa de Campo",
      "Organize elementos de uma situação fictícia.",
      "APRENDER",
      Circle,
    ],
    [
      "linha-do-processo",
      "Linha do Processo",
      "Construa uma cronologia didática.",
      "APRENDER",
      Activity,
    ],
  ].map(([slug, title, description, category, icon]) => ({
    slug: slug as string,
    title: title as string,
    description: description as string,
    category: category as ResourceCategory,
    icon: icon as ResourceDefinition["icon"],
    status: new Set([
      "figura-e-fundo",
      "necessidades-agora",
      "check-in",
      "polaridades",
      "duas-cadeiras",
      "jardim-de-pensamentos",
      "sala-de-pausa",
      "banco-de-microcasos",
      "caso-clinico",
    ]).has(slug as string)
      ? ("available" as const)
      : ("coming-soon" as const),
    privacy: "private" as const,
    persistence: "optional" as const,
  })),
];

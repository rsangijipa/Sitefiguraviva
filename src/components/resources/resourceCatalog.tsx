import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { BookOpen, Circle, Fingerprint, Flower2, Lightbulb, Mountain, PenLine, Sparkles, Waves } from "lucide-react";

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
  { slug: "roda-das-emocoes", title: "Roda das Emoções", description: "Encontre palavras para o que você percebe agora.", category: "PERCEBER", duration: "2–5 min", icon: Sparkles, status: "available", privacy: "private", persistence: "optional" },
  { slug: "emotion-tree", title: "Árvore das Emoções", description: "Encontre mensagens de acolhimento entre as folhas.", category: "PERCEBER", duration: "3–8 min", icon: Flower2, status: "available", privacy: "private", persistence: "optional" },
  { slug: "body-map", title: "Mapa Corporal", description: "Localize sensações e perceba sua intensidade.", category: "PERCEBER", duration: "2–5 min", icon: Fingerprint, status: "available", privacy: "private", persistence: "none" },
  { slug: "diario-aqui-e-agora", title: "Diário do Aqui e Agora", description: "Faça um check-in e registre o que se apresenta.", category: "PERCEBER", duration: "3–8 min", icon: PenLine, status: "available", privacy: "private", persistence: "optional" },
  { slug: "necessidades-agora", title: "Necessidades Agora", description: "Reconheça necessidades presentes, no seu tempo.", category: "PERCEBER", duration: "3–5 min", icon: Lightbulb, status: "available", privacy: "private", persistence: "optional" },
  { slug: "sala-de-pausa", title: "Sala de Pausa", description: "Escolha respirar, observar, escutar ou ancorar os sentidos.", category: "REGULAR", duration: "2–10 min", icon: Mountain, status: "available", privacy: "none", persistence: "none", sections: [
    { id: "pause", label: "Pausa livre" }, { id: "breathing", label: "Respiração" }, { id: "grounding", label: "5 · 4 · 3 · 2 · 1" }, { id: "sounds", label: "Escuta" },
  ] },
  { slug: "lago", title: "Lago", description: "Toque a água e acompanhe o movimento das ondas.", category: "REGULAR", duration: "livre", icon: Waves, status: "available", privacy: "none", persistence: "none" },
  { slug: "rio-dos-pensamentos", title: "Rio dos Pensamentos", description: "Observe pensamentos passando, sem precisar afastá-los.", category: "REGULAR", duration: "2–5 min", icon: Waves, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "experience", label: "Experiência" }, { id: "history", label: "Histórico" },
  ] },
  { slug: "figura-e-fundo", title: "Figura e Fundo", description: "Observe como uma figura emerge dentro de um campo.", category: "EXPERIMENTAR", duration: "3–5 min", icon: Circle, status: "available", privacy: "none", persistence: "none" },
  { slug: "banco-de-microcasos", title: "Banco de Microcasos", description: "Explore situações fictícias curtas para estudo.", category: "APRENDER", duration: "5–10 min", icon: BookOpen, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "home", label: "Início" }, { id: "history", label: "Minha exploração" },
  ] },
  { slug: "cartas-gestalticas", title: "Cartas Gestálticas", description: "Estude conceitos, autores e perguntas para reflexão.", category: "APRENDER", duration: "5–10 min", icon: BookOpen, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "home", label: "Início" }, { id: "explore", label: "Explorar" }, { id: "review", label: "Revisão" }, { id: "random", label: "Aleatório" }, { id: "favorites", label: "Favoritos" }, { id: "history", label: "Histórico" },
  ] },
  { slug: "ciclo-do-contato", title: "Ciclo do Contato", description: "Explore etapas do contato e aplique-as a uma situação.", category: "APRENDER", duration: "5–10 min", icon: BookOpen, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "opening", label: "Início" }, { id: "guided", label: "Guiado" }, { id: "free", label: "Explorar" }, { id: "practice", label: "Aplicar" }, { id: "review", label: "Rever" },
  ] },
];

// Old shared URLs lead to the consolidated experience, never to a duplicate card.
export const resourceAliases: Record<string, string> = {
  "intensidade-agora": "body-map",
  "check-in": "diario-aqui-e-agora",
  breathing: "sala-de-pausa",
  "grounding-54321": "sala-de-pausa",
  "sons-para-awareness": "sala-de-pausa",
  "jardim-de-pensamentos": "rio-dos-pensamentos",
  "arvore-das-emocoes": "emotion-tree",
  "mapa-corporal": "body-map",
  respiracao: "sala-de-pausa",
};

export function resolveResourceSlug(slug: string): string {
  return Object.prototype.hasOwnProperty.call(resourceAliases, slug) ? resourceAliases[slug] : slug;
}

import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { BookOpen, Circle, Fingerprint, Leaf, Lightbulb, MessageCircle, PenLine, Waves, Wind } from "lucide-react";

export type ResourceCategory = "APRENDER" | "EXPERIMENTAR" | "PERCEBER" | "PAUSAR";
export type ResourceStatus = "available" | "coming-soon";
export type ResourceVisibility = "published" | "hidden" | "draft";
export interface ResourceSection { id: string; label: string; icon?: ComponentType<LucideProps> }
export interface ResourceDefinition {
  slug: string; title: string; description: string; category: ResourceCategory;
  register: "institucional" | "confluencia"; access: "public" | "formation";
  visibility: ResourceVisibility; duration: string; icon: ComponentType<LucideProps>;
  status: ResourceStatus; privacy: "none" | "private"; persistence: "none" | "optional";
  modes: readonly string[]; concepts: readonly string[]; sections?: ResourceSection[];
}
type Entry = Omit<ResourceDefinition, "register" | "status" | "privacy" | "persistence" | "concepts"> & { saves?: boolean };
const entry = ({ saves = false, ...resource }: Entry): ResourceDefinition => ({
  ...resource, register: resource.category === "APRENDER" ? "institucional" : "confluencia",
  status: resource.visibility === "hidden" ? "coming-soon" : "available",
  privacy: saves ? "private" : "none", persistence: saves ? "optional" : "none", concepts: [],
});
// Resource visibility does not approve content. Only signed published editorial
// versions are loaded by the server; no legacy default content is published.
export const resourceCatalog: ResourceDefinition[] = [
  entry({ slug: "cartas-gestalticas", title: "Cartas Gestálticas", description: "Explore conceitos e relações do acervo revisado.", category: "APRENDER", access: "public", visibility: "published", duration: "5–10 min", icon: BookOpen, modes: ["explorar", "revisar", "copa", "relacoes"], saves: true }),
  entry({ slug: "figura-e-fundo", title: "Figura e Fundo", description: "Observe o que aparece como figura para você.", category: "APRENDER", access: "public", visibility: "published", duration: "3–8 min", icon: Circle, modes: ["perceptivo", "clinico", "sessao"] }),
  entry({ slug: "ciclo-do-contato", title: "Ciclo do Contato", description: "Percorra modelos e situações de estudo.", category: "APRENDER", access: "formation", visibility: "published", duration: "5–10 min", icon: BookOpen, modes: ["guiado", "explorar", "aplicar"], saves: true }),
  entry({ slug: "fronteiras-de-contato", title: "Fronteiras de Contato", description: "Explore vinhetas e hipóteses de leitura.", category: "APRENDER", access: "formation", visibility: "published", duration: "5–10 min", icon: BookOpen, modes: ["vinhetas"], saves: true }),
  entry({ slug: "casoteca", title: "Casoteca", description: "Estude situações fictícias e compare leituras.", category: "APRENDER", access: "formation", visibility: "published", duration: "3–15 min", icon: BookOpen, modes: ["microcaso", "caso-longo"], saves: true }),
  entry({ slug: "instrumentos-em-estudo", title: "Instrumentos em Estudo", description: "Acervo reservado à decisão da coordenação.", category: "APRENDER", access: "formation", visibility: "hidden", duration: "livre", icon: BookOpen, modes: [] }),
  entry({ slug: "polaridades-e-cadeiras", title: "Polaridades e Cadeiras", description: "Nomeie dois lados e experimente escutá-los.", category: "EXPERIMENTAR", access: "formation", visibility: "published", duration: "5–10 min", icon: MessageCircle, modes: ["escala", "dialogo"], saves: true }),
  entry({ slug: "chegada", title: "Chegada", description: "Escolha como perceber sua chegada agora.", category: "PERCEBER", access: "public", visibility: "published", duration: "1–6 min", icon: PenLine, modes: ["breve", "completa"], saves: true }),
  entry({ slug: "mapa-do-corpo", title: "Mapa do Corpo", description: "Localize sensações, sem precisar interpretá-las.", category: "PERCEBER", access: "public", visibility: "published", duration: "2–8 min", icon: Fingerprint, modes: ["mapear", "percorrer"], saves: true }),
  entry({ slug: "roda-das-emocoes", title: "Roda das Emoções", description: "Encontre palavras para o que você percebe.", category: "PERCEBER", access: "public", visibility: "published", duration: "2–5 min", icon: Circle, modes: ["roda", "lista"], saves: true }),
  entry({ slug: "necessidades-agora", title: "Necessidades Agora", description: "Reconheça necessidades presentes no seu tempo.", category: "PERCEBER", access: "public", visibility: "published", duration: "3–5 min", icon: Lightbulb, modes: ["perceber"], saves: true }),
  entry({ slug: "paisagem-de-pensamentos", title: "Paisagem de Pensamentos", description: "Pouse uma escrita ou acompanhe sua passagem.", category: "PERCEBER", access: "public", visibility: "published", duration: "2–5 min", icon: Leaf, modes: ["jardim", "rio"], saves: true }),
  entry({ slug: "sons-para-awareness", title: "Sons para Awareness", description: "Explore o entorno com ou sem áudio.", category: "PERCEBER", access: "public", visibility: "published", duration: "2–5 min", icon: Wind, modes: ["escutar", "texto"], saves: true }),
  entry({ slug: "sala-de-pausa", title: "Sala de Pausa", description: "Escolha uma pausa que caiba neste momento.", category: "PAUSAR", access: "public", visibility: "published", duration: "livre", icon: Wind, modes: ["respirar", "observar", "pelos-sentidos", "ouvir", "movimentar", "desacelerar"], saves: true }),
  entry({ slug: "igarape", title: "Igarapé", description: "Toque a água e acompanhe suas ondulações.", category: "PAUSAR", access: "public", visibility: "published", duration: "livre", icon: Waves, modes: ["agua", "estatico"] }),
  entry({ slug: "laboratorio-fenomenologico", title: "Laboratório Fenomenológico", description: "Explore descrição e leitura de trechos revisados.", category: "APRENDER", access: "formation", visibility: "draft", duration: "8–12 min", icon: BookOpen, modes: ["laboratorio"], saves: true }),
  entry({ slug: "atelie-do-experimento", title: "Ateliê do Experimento", description: "Construa uma proposta a partir de um microcaso.", category: "APRENDER", access: "formation", visibility: "draft", duration: "10–15 min", icon: BookOpen, modes: ["atelie"], saves: true }),
  entry({ slug: "escuta-dialogica", title: "Escuta Dialógica", description: "Escreva uma resposta e compare possibilidades.", category: "APRENDER", access: "formation", visibility: "draft", duration: "5–10 min", icon: MessageCircle, modes: ["escuta"], saves: true }),
];
export interface ResourceDestination { slug: string; mode?: string }
export const resourceAliases: Record<string, ResourceDestination> = {
  "intensidade-agora": { slug: "chegada", mode: "breve" }, "check-in": { slug: "chegada", mode: "completa" },
  "diario-aqui-e-agora": { slug: "chegada", mode: "completa" },
  "body-map": { slug: "mapa-do-corpo", mode: "mapear" }, "mapa-corporal": { slug: "mapa-do-corpo", mode: "mapear" },
  somascan: { slug: "mapa-do-corpo", mode: "percorrer" }, "soma-scan": { slug: "mapa-do-corpo", mode: "percorrer" },
  "duas-cadeiras": { slug: "polaridades-e-cadeiras", mode: "dialogo" }, polaridades: { slug: "polaridades-e-cadeiras", mode: "escala" },
  "banco-de-microcasos": { slug: "casoteca", mode: "microcaso" }, "caso-clinico": { slug: "casoteca", mode: "caso-longo" },
  casoclinicointerativo: { slug: "casoteca", mode: "caso-longo" },
  breathing: { slug: "sala-de-pausa", mode: "respirar" }, respiracao: { slug: "sala-de-pausa", mode: "respirar" },
  "grounding-54321": { slug: "sala-de-pausa", mode: "pelos-sentidos" },
  "rio-dos-pensamentos": { slug: "paisagem-de-pensamentos", mode: "rio" }, "rios-dos-pensamentos": { slug: "paisagem-de-pensamentos", mode: "rio" },
  "jardim-de-pensamentos": { slug: "paisagem-de-pensamentos", mode: "jardim" },
  "emotion-tree": { slug: "cartas-gestalticas", mode: "copa" }, "arvore-das-emocoes": { slug: "cartas-gestalticas", mode: "copa" },
  "arvore-da-awareness": { slug: "cartas-gestalticas", mode: "copa" }, lago: { slug: "igarape", mode: "agua" },
  EmotionWheel: { slug: "roda-das-emocoes" }, ciclodocontato: { slug: "ciclo-do-contato" },
};
export function resolveResourceDestination(slug: string, mode?: string): ResourceDestination {
  const alias = Object.prototype.hasOwnProperty.call(resourceAliases, slug) ? resourceAliases[slug] : { slug };
  const resource = resourceCatalog.find(item => item.slug === alias.slug);
  const selected = mode ?? alias.mode;
  return { slug: alias.slug, ...(selected && resource?.modes.includes(selected) ? { mode: selected } : {}) };
}
export function resolveResourceSlug(slug: string): string { return resolveResourceDestination(slug).slug; }
export function resourceHref(resource: ResourceDefinition, mode?: string): string {
  const path = `${resource.access === "public" ? "/recursos" : "/portal/recursos"}/${resource.slug}`;
  return mode && resource.modes.includes(mode) ? `${path}?modo=${encodeURIComponent(mode)}` : path;
}
const modeLabels: Record<string, string> = {
  clinico: "Clínico", sessao: "Sessão", relacoes: "Relações", dialogo: "Diálogo", agua: "Água",
  estatico: "Estático", laboratorio: "Laboratório", atelie: "Ateliê",
};
/** Rótulo legível de um modo: os slugs não carregam acentos nem espaços. */
export function modeLabel(mode: string): string {
  const label = modeLabels[mode] ?? mode.replaceAll("-", " ");
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}
export function isPublicResource(resource: ResourceDefinition): boolean { return resource.access === "public" && resource.visibility === "published"; }

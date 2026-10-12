import { resourceCatalog, resolveResourceSlug, resourceHref } from "@/components/resources/resourceCatalog";
export interface ClinicalTool {
  slug: string;
  name: string;
  category: "awareness" | "experiment" | "expression" | "assessment";
  description: string;
  path: string;
  estimatedMinutes: number;
  pilotPending?: boolean;
}
export const CLINICAL_TOOLS_REGISTRY: ClinicalTool[] = resourceCatalog.filter(resource => resource.visibility === "published" || resource.visibility === "draft").map(resource => ({
  slug: resource.slug,
  name: resource.title,
  category: resource.category === "APRENDER" || resource.category === "EXPERIMENTAR" ? "experiment" : "awareness",
  description: resource.description,
  path: resourceHref(resource),
  estimatedMinutes: Number(resource.duration?.match(/\d+/)?.[0] ?? 5),
  ...(resource.visibility === "draft" ? { pilotPending: true } : {}),
}));
export function getClinicalTool(slug: string): ClinicalTool | undefined {
  const legacy: Record<string, string> = { EmotionWheel: "roda-das-emocoes", "rios-dos-pensamentos": "rio-dos-pensamentos", ciclodocontato: "ciclo-do-contato" };
  const canonical = resolveResourceSlug(legacy[slug] ?? slug);
  return CLINICAL_TOOLS_REGISTRY.find(tool => tool.slug === canonical);
}

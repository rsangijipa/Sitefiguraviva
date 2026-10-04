import { resourceCatalog, resourceAliases } from "@/components/resources/resourceCatalog";
export interface ClinicalTool {
  slug: string;
  name: string;
  category: "awareness" | "experiment" | "expression" | "assessment";
  description: string;
  path: string;
  estimatedMinutes: number;
}
export const CLINICAL_TOOLS_REGISTRY: ClinicalTool[] = resourceCatalog.map(resource => ({
  slug: resource.slug,
  name: resource.title,
  category: resource.category === "APRENDER" || resource.category === "EXPERIMENTAR" ? "experiment" : "awareness",
  description: resource.description,
  path: `/recursos/${resource.slug}`,
  estimatedMinutes: Number(resource.duration?.match(/\d+/)?.[0] ?? 5),
}));
export function getClinicalTool(slug: string): ClinicalTool | undefined {
  const legacy: Record<string, string> = { EmotionWheel: "roda-das-emocoes", "rios-dos-pensamentos": "rio-dos-pensamentos", ciclodocontato: "ciclo-do-contato" };
  const canonical = resourceAliases[slug] ?? legacy[slug] ?? slug;
  return CLINICAL_TOOLS_REGISTRY.find(tool => tool.slug === canonical);
}

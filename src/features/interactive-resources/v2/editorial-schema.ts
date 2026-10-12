import { z } from "zod";
import { ResourceKeySchema } from "./contracts";

export const DECKS = [
  { id: "fundamentos", title: "Fundamentos", target: 8 },
  { id: "fenomenologia", title: "Fenomenologia", target: 6 },
  { id: "relacao-dialogica", title: "Relação dialógica", target: 6 },
  { id: "ajustamentos", title: "Ajustamentos e interrupções", target: 10 },
  { id: "self", title: "Teoria do self", target: 6 },
  { id: "campo", title: "Campo", target: 8 },
  { id: "autoras-autores", title: "Autoras e autores", target: 10 },
  { id: "territorio", title: "Território e pensamento decolonial", target: 6 },
] as const;
export const ReferenceSchema = z.strictObject({
  author: z.string().max(200), work: z.string().max(300),
  year: z.number().int().min(-5000).max(3000).nullable(), edition: z.string().max(120), pages: z.string().max(120),
});
export const EditorialItemSchema = z.strictObject({
  id: z.string().min(1).max(80), title: z.string().max(160),
  kind: z.enum(["card", "case", "vignette", "situation", "exercise", "emotion", "need", "sound", "guidance"]),
  deck: z.string().max(80), format: z.string().max(80), text: z.string().max(12000),
  prompt: z.string().max(1000), teacherResponse: z.string().max(8000),
  segments: z.array(z.strictObject({ id: z.string().min(1).max(80), text: z.string().max(500) })).max(40),
  alternatives: z.array(z.strictObject({ id: z.string().min(1).max(80), text: z.string().max(1000), comment: z.string().max(2000) })).max(12),
  relatedConcepts: z.array(z.string().min(1).max(80)).max(12),
  references: z.array(ReferenceSchema).max(20),
  // Paths to real assets; no external URL or guessed provenance is accepted.
  asset: z.string().refine(path => !path || isBrandAsset(path, "image")),
  license: z.string().max(300),
});
export const EditorialConfigSchema = z.strictObject({
  schemaVersion: z.literal(1), resourceKey: ResourceKeySchema,
  items: z.array(EditorialItemSchema).max(80),
  audio: z.array(z.strictObject({ id: z.string().min(1).max(80), title: z.string().min(1).max(160), path: z.string().refine(path => isBrandAsset(path, "audio")), credit: z.string().min(1).max(300), license: z.string().min(1).max(300) })).max(20),
  artApprovalId: z.uuid().nullable(),
});
export type EditorialItem = z.infer<typeof EditorialItemSchema>;
export type EditorialConfig = z.infer<typeof EditorialConfigSchema>;
export interface EditorialVersion {
  id: string; resourceKey: string; version: number;
  status: "draft" | "submitted" | "reviewed" | "published" | "archived";
  configuration: EditorialConfig; authoredBy: string | null;
  reviewerName: string | null; reviewerCrp: string | null; reviewedAt: string | null; updatedAt: string;
}
export function emptyEditorialConfig(resourceKey: z.infer<typeof ResourceKeySchema>): EditorialConfig {
  return { schemaVersion: 1, resourceKey, items: [], audio: [], artApprovalId: null };
}
export function assertPublishable(configuration: EditorialConfig) {
  if(configuration.items.filter(item=>item.kind==="card").length>60)throw new Error("O acervo desta versão comporta até 60 cartas.");
  if (!configuration.items.length) throw new Error("Preencha o acervo antes de submeter à revisão.");
  const ids = new Set<string>();
  for (const item of configuration.items) {
    if (ids.has(item.id)) throw new Error("Identificadores repetidos no acervo.");
    ids.add(item.id);
    if (!item.title.trim() || !item.text.trim()) throw new Error("Todo item precisa de título e texto docente.");
    if (item.kind !== "guidance" && !item.references.length) throw new Error("Todo item teórico precisa de referência estruturada.");
    if (item.references.some(reference => !reference.author.trim() || !reference.work.trim() || reference.year === null)) throw new Error("Complete e confira as referências antes da revisão.");
    if (item.asset && (!item.license.trim() || !configuration.artApprovalId)) throw new Error("Arte sem licença e curadoria registrada.");
  }
  if (new TextEncoder().encode(JSON.stringify(configuration)).byteLength > 512 * 1024) throw new Error("Versão editorial maior que o limite permitido.");
}

export function isBrandAsset(path: string, type: "image" | "audio") {
  return path.startsWith(type === "audio" ? "/brand/audio/" : "/brand/") &&
    !path.includes("//") && !path.split("/").some(part => part === "." || part === "..") &&
    /^\/brand\/[a-zA-Z0-9/_\-.]+$/.test(path) &&
    (type === "audio" ? /\.(mp3|ogg|wav)$/i : /\.(png|jpg|jpeg|webp|svg)$/i).test(path);
}
export const ArtManifestSchema = z.array(z.strictObject({ path: z.string().min(1).max(300), license: z.string().min(1).max(300), author: z.string().min(1).max(160), sha256: z.string().regex(/^[a-f0-9]{64}$/), role: z.enum(["copa", "rubin", "card", "body", "glyph", "texture", "audio"]) })).max(200);
export function assertArtCovered(configuration: EditorialConfig, assets: unknown) {
  const manifest = ArtManifestSchema.parse(assets);
  for (const item of configuration.items.filter(item => item.asset)) {
    if (!manifest.some(asset => asset.path === item.asset && asset.license === item.license)) throw new Error("A curadoria não cobre esta arte e licença.");
  }
  for (const sound of configuration.audio) {
    if (!manifest.some(asset => asset.path === sound.path && asset.license === sound.license && asset.role === "audio")) throw new Error("Áudio sem curadoria e licença.");
  }
}
export function emptyEditorialItem(kind: EditorialItem["kind"], id: string, deck = ""): EditorialItem {
  return { id, kind, deck, title: "", format: "", text: "", prompt: "", teacherResponse: "", segments: [], alternatives: [], relatedConcepts: [], references: [], asset: "", license: "" };
}

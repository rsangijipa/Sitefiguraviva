import { z } from "zod";

export const RESOURCE_KEYS = [
  "cartas-gestalticas", "figura-e-fundo", "ciclo-do-contato", "fronteiras-de-contato",
  "casoteca", "polaridades-e-cadeiras", "chegada", "mapa-do-corpo", "roda-das-emocoes",
  "necessidades-agora", "paisagem-de-pensamentos", "sons-para-awareness", "sala-de-pausa",
  "igarape", "laboratorio-fenomenologico", "atelie-do-experimento", "escuta-dialogica",
] as const;
export type ResourceKey = typeof RESOURCE_KEYS[number];
export const ResourceKeySchema = z.enum(RESOURCE_KEYS);
export const MAX_RECORD_BYTES = 16 * 1024;
const shortText = z.string().max(500);
const itemId = z.string().min(1).max(80);
export const BODY_REGIONS = ["cabeça", "pescoço", "ombros", "peito", "abdômen", "braços", "mãos", "quadril", "pernas", "pés"] as const;
export const SENSATIONS = ["tensão", "calor", "frio", "peso", "leveza", "formigamento", "pulsação", "pouca percepção", "não sei", "outra"] as const;
export const BodyPointSchema = z.strictObject({
  region: z.enum(BODY_REGIONS), view: z.enum(["frente", "costas"]),
  sensation: z.enum(SENSATIONS), intensity: z.number().int().min(1).max(5), note: z.string().max(120),
});
export type BodyPoint = z.infer<typeof BodyPointSchema>;
export const EXPERIMENT_STEPS = ["preparar", "consenso", "graduacao", "energia", "execucao", "fechamento"] as const;
export const recordSchemas = {
  "chegada": z.strictObject({ word: z.string().max(120), body: z.array(BodyPointSchema).max(20), emotion: z.string().max(80), intensity: z.number().int().min(0).max(10).nullable(), needs: z.array(itemId).max(3), reflection: shortText }),
  "mapa-do-corpo": z.strictObject({ regions: z.array(BodyPointSchema).max(20), mode: z.enum(["mapear", "percorrer"]) }),
  "roda-das-emocoes": z.strictObject({ emotionId: itemId, intensity: z.number().int().min(1).max(5), reflection: shortText }),
  "necessidades-agora": z.strictObject({ ids: z.array(itemId).max(3), reflection: shortText }),
  "paisagem-de-pensamentos": z.strictObject({ mode: z.enum(["jardim", "rio"]), thoughts: z.array(shortText).max(20), reflection: shortText }).refine(value => value.mode !== "rio" || value.thoughts.length === 0, "As folhas do Rio são efêmeras."),
  "polaridades-e-cadeiras": z.strictObject({ names: z.tuple([z.string().max(60), z.string().max(60)]), position: z.number().int().min(0).max(10), turns: z.array(z.strictObject({ side: z.union([z.literal(0), z.literal(1)]), text: shortText })).max(12), reflection: shortText }),
  "sala-de-pausa": z.strictObject({ practice: z.enum(["respirar", "observar", "pelos-sentidos", "ouvir", "movimentar", "desacelerar"]), seconds: z.number().int().min(0).max(86400), reflection: shortText }),
  "sons-para-awareness": z.strictObject({ sceneId: z.string().max(80), observations: z.array(shortText).max(10), reflection: shortText }),
  "cartas-gestalticas": z.strictObject({ favorites: z.array(itemId).max(60), review: z.array(itemId).max(60), known: z.array(itemId).max(60), reflection: shortText }),
  "ciclo-do-contato": z.strictObject({ itemId, model: z.enum(["zinker", "phg", "ribeiro"]), sequence: z.array(itemId).max(12), reflection: shortText }),
  "fronteiras-de-contato": z.strictObject({ itemId, hypotheses: z.array(itemId).max(12), reflection: shortText }),
  "casoteca": z.strictObject({ itemId, observable: shortText, question: shortText, experiment: shortText, field: shortText }),
  "laboratorio-fenomenologico": z.strictObject({ itemId, classification: z.array(z.strictObject({ phraseId: itemId, kind: z.enum(["observacao", "interpretacao", "julgamento"]) })).max(40), rewrite: z.string().max(2000) }),
  "atelie-do-experimento": z.strictObject({ caseId: itemId, support: z.number().int().min(0).max(10), steps: z.array(z.strictObject({ id: z.enum(EXPERIMENT_STEPS), text: shortText })).max(6) }),
  "escuta-dialogica": z.strictObject({ itemId, response: z.string().max(1000) }),
} satisfies Partial<Record<ResourceKey, z.ZodType>>;
export type RecordResourceKey = keyof typeof recordSchemas;
export const RecordEnvelopeSchema = z.strictObject({
  resourceKey: ResourceKeySchema, schemaVersion: z.literal(1), formationId: z.string().min(1).max(120),
  clientRequestId: z.uuid(), contentVersion: z.uuid().nullable(), payload: z.unknown(),
});
export function validateRecord(input: unknown) {
  const envelope = RecordEnvelopeSchema.parse(input);
  if (!Object.prototype.hasOwnProperty.call(recordSchemas, envelope.resourceKey)) throw new Error("Este recurso não guarda registros.");
  const schema = recordSchemas[envelope.resourceKey as RecordResourceKey];
  const payload = schema.parse(envelope.payload);
  if (new TextEncoder().encode(JSON.stringify(payload)).byteLength > MAX_RECORD_BYTES) throw new Error("Registro maior que o limite permitido.");
  return { ...envelope, payload };
}
export type RecordInput = z.infer<typeof RecordEnvelopeSchema>;
export interface PrivateRecord {
  id: string; resourceKey: ResourceKey; schemaVersion: number; formationId: string | null;
  payload: unknown; createdAt: string; expiresAt: string; legacy: boolean;
}
export interface FormationOption { id: string; title: string; endDate: string; expiresAt: string }
export type ResourceResult<T> = { ok: true; data: T } | { ok: false; code: "unauthenticated" | "forbidden" | "invalid" | "unavailable" | "release_pending" | "expired"; error: string };

export function retentionExpiry(endDate: string, departureDate?: string | null): string {
  const end = new Date(endDate);
  const departure = departureDate ? new Date(departureDate) : null;
  if (!Number.isFinite(end.getTime()) || (departure && !Number.isFinite(departure.getTime()))) throw new Error("Data de formação inválida.");
  const anchor = departure && departure < end ? departure : end;
  const result = new Date(anchor);
  // Calendar months, clamped at month end (31 August -> 28/29 February).
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 6);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, last));
  return result.toISOString();
}

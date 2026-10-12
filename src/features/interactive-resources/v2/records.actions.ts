"use server";

import type { Json } from "@/infrastructure/supabase/database.types";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import { ResourceKeySchema, validateRecord, type PrivateRecord, type ResourceResult, type FormationOption } from "./contracts";
import { resourceDatabase, recordTable, RECORD_TABLES, type RecordRow } from "./database.server";
import { resourceSession, hasFormationAccess, historyReleased, availableFormations } from "./access.server";
import { appendDeletionReceipt } from "./deletion-ledger.server";
import { publishedEditorial } from "./editorial.server";

const failure = <T>(code: Extract<ResourceResult<T>, { ok: false }>["code"], error: string): ResourceResult<T> => ({ ok: false, code, error });
function toRecord(row: RecordRow): PrivateRecord {
  return { id: row.id, resourceKey: row.resource_key, schemaVersion: row.schema_version, formationId: row.formation_id, payload: row.payload, createdAt: row.created_at, expiresAt: row.expires_at, legacy: row.legacy_record };
}
export async function getSavingOptions(): Promise<ResourceResult<{ formations: FormationOption[]; enabled: boolean }>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre para consultar seu histórico privado.");
  if (session.isStaff) return failure("forbidden", "A prévia docente não acessa registros pessoais.");
  try {
    const [formations, enabled] = await Promise.all([availableFormations(session.uid), historyReleased()]);
    return { ok: true, data: { formations, enabled } };
  } catch { return failure("unavailable", "O histórico está indisponível. Sua experiência pode continuar sem guardar."); }
}
export async function savePrivateResourceRecord(input: unknown): Promise<ResourceResult<PrivateRecord>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre antes de guardar um registro.");
  if (session.isStaff) return failure("forbidden", "A prévia docente não guarda registros pessoais.");
  let parsed: ReturnType<typeof validateRecord>;
  try { parsed = validateRecord(input); } catch { return failure("invalid", "Confira os campos e os limites deste registro."); }
  try {
    const resource = resourceCatalog.find(item => item.slug === parsed.resourceKey);
    if (!resource || resource.visibility !== "published" || !await hasFormationAccess(session.uid)) return failure("forbidden", "É necessário vínculo com uma formação disponível.");
    const [formations, released] = await Promise.all([availableFormations(session.uid), historyReleased()]);
    if (!released) return failure("release_pending", "O histórico aguarda a validação de retenção e recuperação. Você pode encerrar sem guardar.");
    const formation = formations.find(item => item.id === parsed.formationId);
    if (!formation) return failure("expired", "Não há formação com prazo válido para este registro.");
    if (parsed.contentVersion) {
      const published = await publishedEditorial(parsed.resourceKey);
      if (!published || published.id !== parsed.contentVersion) return failure("invalid", "O acervo mudou. Reabra o recurso antes de guardar.");
    }
    const db = resourceDatabase();
    const table = recordTable(parsed.resourceKey, "mode" in parsed.payload ? String(parsed.payload.mode) : undefined);
    const values = {
      user_id: session.uid, resource_key: parsed.resourceKey, schema_version: 1,
      formation_id: formation.id, client_request_id: parsed.clientRequestId,
      content_version: parsed.contentVersion, payload: parsed.payload as Json,
      expires_at: formation.expiresAt, legacy_record: false,
    };
    const { data, error } = await db.from(table).insert(values).select("*").single();
    if (!error && data) return { ok: true, data: toRecord(data) };
    if (error?.code === "23505") {
      const existing = await db.from(table).select("*").eq("user_id", session.uid).eq("client_request_id", parsed.clientRequestId).eq("resource_key", parsed.resourceKey).gt("expires_at", new Date().toISOString()).maybeSingle();
      if (!existing.error && existing.data) return { ok: true, data: toRecord(existing.data) };
    }
    return failure("unavailable", "Não foi possível guardar. Seu texto continua nesta tela.");
  } catch { return failure("unavailable", "Não foi possível guardar. Seu texto continua nesta tela."); }
}
export async function listPrivateResourceRecords(): Promise<ResourceResult<PrivateRecord[]>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre para consultar seu histórico.");
  if (session.isStaff) return failure("forbidden", "A prévia docente não acessa registros pessoais.");
  try {
    if (!await historyReleased()) return failure("release_pending", "O histórico aguarda a validação operacional.");
    const db = resourceDatabase();
    const results = await Promise.all(RECORD_TABLES.map(table => db.from(table).select("*").eq("user_id", session.uid).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(50)));
    if (results.some(result => result.error)) return failure("unavailable", "Não foi possível consultar o histórico.");
    return { ok: true, data: results.flatMap(result => result.data ?? []).map(toRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  } catch { return failure("unavailable", "Não foi possível consultar o histórico."); }
}
export async function deletePrivateResourceRecord(key: unknown, id: string): Promise<ResourceResult<null>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre para excluir um registro.");
  if (session.isStaff) return failure("forbidden", "A prévia docente não acessa registros pessoais.");
  const resource = ResourceKeySchema.safeParse(key);
  if (!resource.success || !/^[0-9a-f-]{36}$/i.test(id)) return failure("invalid", "Registro inválido.");
  try {
    const db = resourceDatabase();
    const table = recordTable(resource.data);
    const own = await db.from(table).select("id").eq("id", id).eq("resource_key", resource.data).eq("user_id", session.uid).maybeSingle();
    if (own.error || !own.data) return failure("forbidden", "Registro indisponível.");
    await appendDeletionReceipt([{ table, id }], `delete:${table}:${id}`);
    const removed = await db.from(table).delete().eq("id", id).eq("resource_key", resource.data).eq("user_id", session.uid);
    if (removed.error) return failure("unavailable", "Não foi possível confirmar a exclusão.");
    return { ok: true, data: null };
  } catch { return failure("unavailable", "Não foi possível confirmar a exclusão. Tente novamente."); }
}
export async function exportPrivateResourceRecords(): Promise<ResourceResult<string>> {
  const result = await listPrivateResourceRecords();
  if (result.ok === false) return result;
  return { ok: true, data: JSON.stringify({ schemaVersion: 1, records: result.data }, null, 2) };
}

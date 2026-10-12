"use server";

import type { Json } from "@/infrastructure/supabase/database.types";
import { z } from "zod";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import { ResourceKeySchema, validateRecord,stableRecordJson, type PrivateRecord, type ResourceResult, type FormationOption } from "./contracts";
import { resourceDatabase, recordTable, RECORD_TABLES, type RecordRow } from "./database.server";
import { resourceSession, editorialPermissions, hasFormationAccess, historyReleased, availableFormations } from "./access.server";
import { appendDeletionReceipt } from "./deletion-ledger.server";
import { publishedEditorial } from "./editorial.server";
import { releasedLearningResources } from "./releases.server";

const failure = <T>(code: Extract<ResourceResult<T>, { ok: false }>["code"], error: string): ResourceResult<T> => ({ ok: false, code, error });
async function canAccessOwnRecords(uid:string,isStaff:boolean){try{return !isStaff && !(await editorialPermissions(uid)).length;}catch{return false;}}
function toRecord(row: RecordRow): PrivateRecord {
  return { id: row.id, resourceKey: row.resource_key, schemaVersion: row.schema_version, formationId: row.formation_id, payload: row.payload, createdAt: row.created_at, expiresAt: row.expires_at, legacy: row.legacy_record,labels:z.array(z.strictObject({id:z.string().max(80),title:z.string().max(160)})).max(80).catch([]).parse(row.display_labels) };
}
function referencedIds(payload:unknown){const values=payload as Record<string,unknown>;return new Set([...["emotion","emotionId","itemId","caseId","sceneId"].map(key=>values[key]),...["needs","ids","favorites","review","known","hypotheses","sequence"].flatMap(key=>Array.isArray(values[key])?values[key]:[])].filter((value):value is string=>typeof value==="string"));}
export async function getSavingOptions(): Promise<ResourceResult<{ formations: FormationOption[]; enabled: boolean }>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre para consultar seu histórico privado.");
  if (!await canAccessOwnRecords(session.uid,session.isStaff)) return failure("forbidden", "Este acesso não está habilitado para registros pessoais.");
  try {
    const [formations, enabled] = await Promise.all([availableFormations(session.uid), historyReleased()]);
    return { ok: true, data: { formations, enabled } };
  } catch { return failure("unavailable", "O histórico está indisponível. Sua experiência pode continuar sem guardar."); }
}
export async function savePrivateResourceRecord(input: unknown): Promise<ResourceResult<PrivateRecord>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre antes de guardar um registro.");
  if (!await canAccessOwnRecords(session.uid,session.isStaff)) return failure("forbidden", "Este acesso não está habilitado para registros pessoais.");
  let parsed: ReturnType<typeof validateRecord>;
  try { parsed = validateRecord(input); } catch { return failure("invalid", "Confira os campos e os limites deste registro."); }
  try {
    const resource = resourceCatalog.find(item => item.slug === parsed.resourceKey);
    if (!resource || !(resource.visibility === "published" || (await releasedLearningResources()).includes(parsed.resourceKey)) || !await hasFormationAccess(session.uid)) return failure("forbidden", "É necessário vínculo com uma formação disponível.");
    const [formations, released] = await Promise.all([availableFormations(session.uid), historyReleased()]);
    if (!released) return failure("release_pending", "O histórico aguarda a validação de retenção e recuperação. Você pode encerrar sem guardar.");
    const formation = formations.find(item => item.id === parsed.formationId);
    if (!formation) return failure("expired", "Não há formação com prazo válido para este registro.");
    if (parsed.contentVersion) {
      const published = await publishedEditorial(parsed.resourceKey);
      if (!published || published.id !== parsed.contentVersion) return failure("invalid", "O acervo mudou. Reabra o recurso antes de guardar.");
    }
    if (resource.category === "APRENDER" && !parsed.contentVersion) return failure("invalid", "É necessário um acervo docente publicado para guardar este estudo.");
    const acervos=await Promise.all([publishedEditorial(parsed.resourceKey),...(parsed.resourceKey==="chegada"?[publishedEditorial("roda-das-emocoes"),publishedEditorial("necessidades-agora")]:[])]);
    const references=referencedIds(parsed.payload);
    const labels=acervos.flatMap(version=>version?.configuration.items??[]).filter(item=>references.has(item.id)).map(item=>({id:item.id,title:item.title}));
    const db = resourceDatabase();
    const table = recordTable(parsed.resourceKey, "mode" in parsed.payload ? String(parsed.payload.mode) : undefined);
    const values = {
      user_id: session.uid, resource_key: parsed.resourceKey, schema_version: 1,
      formation_id: formation.id, client_request_id: parsed.clientRequestId,
      content_version: parsed.contentVersion, payload: parsed.payload as Json,
      expires_at: formation.expiresAt, legacy_record: false,
      display_labels: labels,
    };
    const { data, error } = await db.from(table).insert(values).select("*").single();
    if (!error && data) return { ok: true, data: toRecord(data) };
    if (error?.code === "23505") {
      const existing = await db.from(table).select("*").eq("user_id", session.uid).eq("client_request_id", parsed.clientRequestId).eq("resource_key", parsed.resourceKey).gt("expires_at", new Date().toISOString()).maybeSingle();
      if (!existing.error && existing.data) {
        const row = existing.data;
        const expectedVersion=parsed.contentVersion ?? (["need_records","listening_sessions","pause_sessions","river_sessions"].includes(table)?"v2":null);
        const same = row.formation_id === formation.id && row.content_version === expectedVersion && stableRecordJson(row.payload) === stableRecordJson(parsed.payload);
        return same ? { ok: true, data: toRecord(row) } : failure("invalid", "Esta tentativa já foi usada em outro registro. Inicie uma nova gravação.");
      }
    }
    return failure("unavailable", "Não foi possível guardar. Seu texto continua nesta tela.");
  } catch { return failure("unavailable", "Não foi possível guardar. Seu texto continua nesta tela."); }
}
const HistoryCursor=z.strictObject({createdAt:z.iso.datetime({offset:true}),id:z.uuid()});
export async function listPrivateResourceRecords(cursor?:unknown): Promise<ResourceResult<PrivateRecord[]>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre para consultar seu histórico.");
  if (!await canAccessOwnRecords(session.uid,session.isStaff)) return failure("forbidden", "Este acesso não está habilitado para registros pessoais.");
  try {
    if (!await historyReleased()) return failure("release_pending", "O histórico aguarda a validação operacional.");
    const db = resourceDatabase();
    const parsed=cursor===undefined ? null : HistoryCursor.parse(cursor);
    const results = await Promise.all(RECORD_TABLES.map(async table => {
      let query=db.from(table).select("*").eq("user_id", session.uid).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).order("id",{ascending:false}).limit(50);
      if(parsed)query=query.or(`created_at.lt.${parsed.createdAt},and(created_at.eq.${parsed.createdAt},id.lt.${parsed.id})`);
      const result=await query;if(result.error)throw new Error("history unavailable");return result.data??[];
    }));
    const rows=results.flat().sort((a,b)=>b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id)).slice(0,50);
    return { ok: true, data: rows.map(toRecord) };
  } catch { return failure("unavailable", "Não foi possível consultar o histórico."); }
}
export async function deletePrivateResourceRecord(key: unknown, id: string): Promise<ResourceResult<null>> {
  const session = await resourceSession();
  if (!session) return failure("unauthenticated", "Entre para excluir um registro.");
  if (!await canAccessOwnRecords(session.uid,session.isStaff)) return failure("forbidden", "Este acesso não está habilitado para registros pessoais.");
  const resource = ResourceKeySchema.safeParse(key);
  if (!resource.success || !/^[0-9a-f-]{36}$/i.test(id)) return failure("invalid", "Registro inválido.");
  try {
    const db = resourceDatabase();
    const tables = resource.data === "paisagem-de-pensamentos" ? [recordTable(resource.data), recordTable(resource.data, "rio")] : [recordTable(resource.data)];
    const found = await Promise.all(tables.map(async table => ({ table, result: await db.from(table).select("id").eq("id", id).eq("resource_key", resource.data).eq("user_id", session.uid).maybeSingle() })));
    const own = found.find(item => !item.result.error && item.result.data);
    if (!own) return failure("forbidden", "Registro indisponível.");
    const table = own.table;
    await appendDeletionReceipt([{ table, id }], `delete:${table}:${id}`);
    const removed = await db.from(table).delete().eq("id", id).eq("resource_key", resource.data).eq("user_id", session.uid);
    if (removed.error) return failure("unavailable", "Não foi possível confirmar a exclusão.");
    return { ok: true, data: null };
  } catch { return failure("unavailable", "Não foi possível confirmar a exclusão. Tente novamente."); }
}
export async function exportPrivateResourceRecords(): Promise<ResourceResult<string>> {
  const records:PrivateRecord[]=[];let cursor:unknown=undefined;
  for(;;){const result=await listPrivateResourceRecords(cursor);if(result.ok===false)return result;records.push(...result.data);if(result.data.length<50)break;const last=result.data.at(-1)!;cursor={createdAt:last.createdAt,id:last.id};}
  return { ok: true, data: JSON.stringify({ schemaVersion: 1, records }, null, 2) };
}

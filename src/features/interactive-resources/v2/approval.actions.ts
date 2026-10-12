"use server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import { resourceSession } from "./access.server";
import { resourceDatabase, type ContentRow } from "./database.server";
import { contentVersion } from "./editorial.server";
import { registerResourceGovernance } from "./governance.actions";
import { ResourceKeySchema, type ResourceResult } from "./contracts";
import { editorialIssues, type EditorialVersion } from "./editorial-schema";

export type EditorialStatus = EditorialVersion["status"];
export interface ApprovalVersionSummary {
  id: string; version: number; status: EditorialStatus; updatedAt: string; itemCount: number; issues: string[];
  authorName: string | null; reviewerName: string | null; reviewerCrp: string | null; reviewedAt: string | null;
  reviewNote: string | null; returnedAt: string | null; demo: boolean;
}
export interface ApprovalResourceSummary {
  key: string; title: string; category: string; access: "public" | "formation"; visibility: string;
  published: ApprovalVersionSummary | null; inProgress: ApprovalVersionSummary[];
}
export interface EditorialTeamMember { userId: string; email: string; displayName: string | null; role: "docente_autor" | "docente_revisor"; name: string; crp: string }
export interface EditorialOverview { resources: ApprovalResourceSummary[]; team: EditorialTeamMember[] }
export type ApprovalVersionDetail = EditorialVersion & { authorName: string | null; issues: string[] };

const UNAVAILABLE = "O acervo editorial está indisponível. Confira se a migração dos Recursos Interativos v2 foi aplicada.";

async function requireAdminSession() {
  const session = await resourceSession();
  return session?.isAdmin ? session : null;
}
async function profileNames(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map<string, { email: string; displayName: string | null }>();
  const { data } = await createSupabaseServiceClient().from("profiles").select("id,email,display_name").in("id", unique);
  return new Map((data ?? []).map(row => [row.id, { email: row.email, displayName: row.display_name }]));
}
function summarize(version: EditorialVersion, authors: Map<string, { email: string; displayName: string | null }>): ApprovalVersionSummary {
  const author = version.authoredBy ? authors.get(version.authoredBy) : undefined;
  return {
    id: version.id, version: version.version, status: version.status, updatedAt: version.updatedAt,
    itemCount: version.configuration.items.length, issues: editorialIssues(version.configuration),
    authorName: author ? author.displayName || author.email : null,
    reviewerName: version.reviewerName, reviewerCrp: version.reviewerCrp, reviewedAt: version.reviewedAt,
    reviewNote: version.reviewNote, returnedAt: version.returnedAt, demo: version.demo,
  };
}

export async function getEditorialOverview(): Promise<ResourceResult<EditorialOverview>> {
  if (!(await requireAdminSession())) return { ok: false, code: "forbidden", error: "Administração necessária." };
  try {
    const db = resourceDatabase();
    const [versions, roles] = await Promise.all([
      db.from("resource_content_versions").select("*").neq("status", "archived").order("version", { ascending: false }).limit(500),
      db.from("resource_editorial_roles").select("user_id,role,name,crp"),
    ]);
    if (versions.error || roles.error) return { ok: false, code: "unavailable", error: UNAVAILABLE };
    const parsed = (versions.data ?? []).flatMap(row => { try { return [contentVersion(row as ContentRow)]; } catch { return []; } });
    const people = await profileNames([...parsed.map(item => item.authoredBy ?? ""), ...(roles.data ?? []).map(item => item.user_id)]);
    const resources = resourceCatalog.filter(item => item.visibility !== "hidden").map(item => {
      const own = parsed.filter(version => version.resourceKey === item.slug);
      const published = own.find(version => version.status === "published");
      return {
        key: item.slug, title: item.title, category: item.category, access: item.access, visibility: item.visibility,
        published: published ? summarize(published, people) : null,
        inProgress: own.filter(version => version.status !== "published").map(version => summarize(version, people)),
      };
    });
    const team = (roles.data ?? []).map(row => ({
      userId: row.user_id, role: row.role, name: row.name, crp: row.crp,
      email: people.get(row.user_id)?.email ?? "", displayName: people.get(row.user_id)?.displayName ?? null,
    })).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return { ok: true, data: { resources, team } };
  } catch { return { ok: false, code: "unavailable", error: UNAVAILABLE }; }
}

export async function getEditorialVersion(id: unknown): Promise<ResourceResult<ApprovalVersionDetail>> {
  if (!(await requireAdminSession())) return { ok: false, code: "forbidden", error: "Administração necessária." };
  const versionId = z.uuid().safeParse(id);
  if (!versionId.success) return { ok: false, code: "invalid", error: "Versão inválida." };
  try {
    const { data, error } = await resourceDatabase().from("resource_content_versions").select("*").eq("id", versionId.data).maybeSingle();
    if (error || !data) return { ok: false, code: "unavailable", error: "Versão indisponível." };
    const version = contentVersion(data as ContentRow);
    const people = await profileNames([version.authoredBy ?? ""]);
    const author = version.authoredBy ? people.get(version.authoredBy) : undefined;
    return { ok: true, data: { ...version, authorName: author ? author.displayName || author.email : null, issues: editorialIssues(version.configuration) } };
  } catch { return { ok: false, code: "unavailable", error: UNAVAILABLE }; }
}

const ReturnSchema = z.strictObject({
  resourceKey: ResourceKeySchema, versionId: z.uuid(), expectedUpdatedAt: z.iso.datetime({ offset: true }),
  note: z.string().trim().min(10, "Escreva ao menos 10 caracteres explicando o ajuste.").max(2000),
});
export async function returnEditorialVersion(input: unknown): Promise<ResourceResult<EditorialVersion>> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, code: "forbidden", error: "Administração necessária." };
  const parsed = ReturnSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid", error: parsed.error.issues[0]?.message ?? "Confira a observação." };
  try {
    const { data, error } = await resourceDatabase().rpc("fv_resource_transition", {
      p_actor: session.uid, p_action: "return", p_resource_key: parsed.data.resourceKey, p_version_id: parsed.data.versionId,
      p_configuration: null, p_expected_updated_at: parsed.data.expectedUpdatedAt, p_note: parsed.data.note,
    });
    if (error || !data) return { ok: false, code: "invalid", error: "A versão mudou ou não está mais em revisão. Recarregue a fila." };
    return { ok: true, data: contentVersion(data as unknown as ContentRow) };
  } catch { return { ok: false, code: "invalid", error: "Não foi possível devolver esta versão." }; }
}

// E-mails podem ter "_", que no ILIKE casaria com qualquer caractere.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, match => "\\" + match);
const RoleSchema = z.strictObject({
  email: z.email("Informe um e-mail válido.").transform(value => value.trim().toLowerCase()),
  role: z.enum(["docente_autor", "docente_revisor"]),
  name: z.string().trim().min(3, "Informe o nome como deve aparecer na assinatura.").max(160),
  crp: z.string().trim().regex(/^[0-9]{2}\/[0-9]{3,8}$/, "Use o formato do CRP, por exemplo 06/123456."),
});
export async function saveEditorialRole(input: unknown): Promise<ResourceResult<string>> {
  if (!(await requireAdminSession())) return { ok: false, code: "forbidden", error: "Administração necessária." };
  const parsed = RoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid", error: parsed.error.issues[0]?.message ?? "Confira os campos." };
  const { data, error } = await createSupabaseServiceClient().from("profiles").select("id,is_active").ilike("email", escapeLike(parsed.data.email)).maybeSingle();
  if (error || !data) return { ok: false, code: "invalid", error: "Nenhum cadastro encontrado com este e-mail. A pessoa precisa ter conta no site." };
  if (!data.is_active) return { ok: false, code: "invalid", error: "Este cadastro está inativo." };
  return registerResourceGovernance({ kind: "role", userId: data.id, role: parsed.data.role, name: parsed.data.name, crp: parsed.data.crp, remove: false });
}

export async function removeEditorialRole(input: unknown): Promise<ResourceResult<string>> {
  if (!(await requireAdminSession())) return { ok: false, code: "forbidden", error: "Administração necessária." };
  const parsed = z.strictObject({ userId: z.uuid(), role: z.enum(["docente_autor", "docente_revisor"]) }).safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid", error: "Permissão inválida." };
  const { data, error } = await resourceDatabase().from("resource_editorial_roles").select("name,crp").eq("user_id", parsed.data.userId).eq("role", parsed.data.role).maybeSingle();
  if (error || !data) return { ok: false, code: "invalid", error: "Esta permissão já foi removida." };
  return registerResourceGovernance({ kind: "role", ...parsed.data, name: data.name, crp: data.crp, remove: true });
}

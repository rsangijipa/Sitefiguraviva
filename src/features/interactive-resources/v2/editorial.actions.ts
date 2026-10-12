"use server";
import { z } from "zod";
import type { Json } from "@/infrastructure/supabase/database.types";
import { resourceSession, editorialPermissions } from "./access.server";
import { resourceDatabase, type ContentRow } from "./database.server";
import { contentVersion } from "./editorial.server";
import { ResourceKeySchema, type ResourceResult } from "./contracts";
import { EditorialConfigSchema, assertPublishable, emptyEditorialConfig, type EditorialVersion } from "./editorial-schema";
import {verifyApprovedAssets} from "./art.server";

export async function listEditorialVersions(key: unknown): Promise<ResourceResult<EditorialVersion[]>> {
  const session = await resourceSession();
  if (!session) return { ok: false, code: "unauthenticated", error: "Entre para acessar o trabalho editorial." };
  try {
    if (!session.isAdmin && !(await editorialPermissions(session.uid)).length) return { ok: false, code: "forbidden", error: "Permissão editorial necessária." };
    const resource = ResourceKeySchema.parse(key);
    const { data, error } = await resourceDatabase().from("resource_content_versions").select("*").eq("resource_key", resource).order("version", { ascending: false }).limit(30);
    if (error) return { ok: false, code: "unavailable", error: "O acervo editorial está indisponível." };
    return { ok: true, data: (data ?? []).map(contentVersion) };
  } catch { return { ok: false, code: "invalid", error: "Não foi possível consultar as versões." }; }
}
const TransitionSchema = z.strictObject({
  resourceKey: ResourceKeySchema, versionId: z.uuid().nullable(),
  action: z.enum(["create", "save", "submit", "review", "publish", "publish_demo", "clone"]),
  expectedUpdatedAt: z.iso.datetime({ offset: true }).nullable(), configuration: EditorialConfigSchema.nullable(),
});
export async function transitionEditorialVersion(input: unknown): Promise<ResourceResult<EditorialVersion>> {
  const session = await resourceSession();
  if (!session) return { ok: false, code: "unauthenticated", error: "Entre para acessar o trabalho editorial." };
  const request = TransitionSchema.safeParse(input);
  if (!request.success) return { ok: false, code: "invalid", error: "Confira os campos desta versão." };
  const params = request.data;
  try {
    const roles = await editorialPermissions(session.uid);
    const author = roles.some(item => item.role === "docente_autor");
    const reviewer = roles.some(item => item.role === "docente_revisor");
    const allowed = params.action === "publish" || params.action === "publish_demo" ? session.isAdmin :
      params.action === "review" ? reviewer :
      author || session.isAdmin; // Administração também escreve (20261013100000); assinatura segue exclusiva de revisor.
    if (!allowed) return { ok: false, code: "forbidden", error: "Esta ação exige a permissão editorial correspondente." };
    const db = resourceDatabase();
    let configuration = params.action === "create" ? emptyEditorialConfig(params.resourceKey) : params.configuration;
    if (params.action === "save" && (!configuration || configuration.resourceKey !== params.resourceKey)) return { ok: false, code: "invalid", error: "A configuração não corresponde ao recurso." };
    if (["submit", "review", "publish", "publish_demo"].includes(params.action)) {
      const current = await db.from("resource_content_versions").select("*").eq("id", params.versionId ?? "").eq("resource_key", params.resourceKey).maybeSingle();
      if (current.error || !current.data) return { ok: false, code: "unavailable", error: "Versão indisponível." };
      configuration = EditorialConfigSchema.parse(current.data.configuration);
      assertPublishable(configuration);
      if (configuration.artApprovalId) {
        const approval = await db.from("resource_art_approvals").select("assets").eq("id", configuration.artApprovalId).maybeSingle();
        if (approval.error || !approval.data) return { ok: false, code: "invalid", error: "Curadoria da arte ainda não registrada." };
        await verifyApprovedAssets(configuration, approval.data.assets);
      }
      if (configuration.audio.length && !configuration.artApprovalId) return { ok: false, code: "invalid", error: "Registre a curadoria dos arquivos de áudio." };
    }
    const { data, error } = await db.rpc("fv_resource_transition", {
      p_actor: session.uid, p_action: params.action, p_resource_key: params.resourceKey,
      p_version_id: params.versionId, p_configuration: configuration as Json | null,
      p_expected_updated_at: params.expectedUpdatedAt,
    });
    if (error || !data) return { ok: false, code: "invalid", error: "A versão mudou ou não está pronta para esta ação. Recarregue as versões." };
    return { ok: true, data: contentVersion(data as unknown as ContentRow) };
  } catch { return { ok: false, code: "invalid", error: "Preencha título, texto docente, referências e licença antes de submeter." }; }
}

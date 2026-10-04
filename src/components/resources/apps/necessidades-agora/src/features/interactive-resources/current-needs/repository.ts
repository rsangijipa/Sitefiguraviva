/**
 * Repositório Canônico para Necessidades Agora
 * Integração Supabase / PostgreSQL com RLS rigorosa
 * e fallback isolado autenticado por usuário.
 */
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { Json } from "@/infrastructure/supabase/database.types";
import { INITIAL_CATALOG_VERSION } from "./catalog";
import { validateRecordPayload } from "./schema";
import {
  CatalogVersion,
  NeedCatalogItem,
  NeedRecord,
  NeedRecordState,
  NeedSelectionEntry,
} from "./types";

const CATALOG_STORAGE_KEY = "figura_viva_catalog_versions_v1";

async function requireAuthenticatedUserId(
  expectedUserId?: string,
): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Faça login para salvar e consultar seus registros.");
  }
  if (expectedUserId && expectedUserId !== data.user.id) {
    throw new Error("A sessão atual não corresponde ao histórico solicitado.");
  }
  return data.user.id;
}

function mapRecord(data: {
  id: string;
  user_id: string;
  client_request_id: string;
  schema_version: number;
  content_version: string;
  state: NeedRecordState;
  entries: unknown;
  ordered: boolean;
  focus_entry_id: string | null;
  small_step: string | null;
  created_at: string;
  updated_at: string;
}): NeedRecord {
  return {
    id: data.id,
    userId: data.user_id,
    clientRequestId: data.client_request_id,
    schemaVersion: data.schema_version,
    contentVersion: data.content_version,
    state: data.state,
    entries: data.entries as NeedSelectionEntry[],
    ordered: data.ordered,
    focusEntryId: data.focus_entry_id,
    smallStep: data.small_step,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export class CurrentNeedsRepository {
  /**
   * Criação idempotente de registro privado
   */
  static async createRecord(params: {
    userId: string;
    clientRequestId: string;
    contentVersion: string;
    state: NeedRecordState;
    entries: NeedSelectionEntry[];
    ordered: boolean;
    focusEntryId: string | null;
    smallStep: string | null;
  }): Promise<{ record: NeedRecord; error?: string }> {
    // 1. Validação de contrato canônico
    const validation = validateRecordPayload({
      state: params.state,
      entries: params.entries,
      focusEntryId: params.focusEntryId,
      smallStep: params.smallStep,
    });

    if (!validation.valid) {
      throw new Error(
        validation.error || "Erro de validação nos dados do registro.",
      );
    }

    const userId = await requireAuthenticatedUserId(params.userId);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("need_records")
      .upsert(
        {
          user_id: userId,
          client_request_id: params.clientRequestId,
          schema_version: 1,
          content_version: params.contentVersion,
          state: params.state,
          entries: params.entries as unknown as Json,
          ordered: params.ordered,
          focus_entry_id: params.focusEntryId,
          small_step: params.smallStep,
        },
        { onConflict: "user_id,client_request_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { record: mapRecord(data) };
  }

  /**
   * Listagem de histórico privado (RLS: apenas auth.uid() == user_id)
   */
  static async listRecords(userId: string): Promise<NeedRecord[]> {
    const authenticatedUserId = await requireAuthenticatedUserId(userId);
    const { data, error } = await createSupabaseBrowserClient()
      .from("need_records")
      .select("*")
      .eq("user_id", authenticatedUserId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRecord);
  }

  /**
   * Exclusão de registro privado com confirmação (RLS: apenas dono pode deletar)
   */
  static async deleteRecord(
    userId: string,
    recordId: string,
  ): Promise<boolean> {
    const authenticatedUserId = await requireAuthenticatedUserId(userId);
    const { error } = await createSupabaseBrowserClient()
      .from("need_records")
      .delete()
      .eq("id", recordId)
      .eq("user_id", authenticatedUserId);
    if (error) throw new Error(error.message);
    return true;
  }

  /**
   * Exportação dos próprios registros em formato seguro JSON
   */
  static async exportOwnData(userId: string): Promise<string> {
    const records = await this.listRecords(userId);
    return JSON.stringify(
      {
        institution: "Instituto Figura Viva",
        exportDate: new Date().toISOString(),
        userId: userId,
        recordsCount: records.length,
        privacyNotice:
          "Este arquivo contém o seu histórico privado de necessidades e pequenos gestos observados.",
        records: records,
      },
      null,
      2,
    );
  }

  /* =========================================================
   * GESTÃO EDITORIAL DO CATÁLOGO (ADMIN)
   * Administradores NUNCA têm acesso aos registros pessoais dos alunos.
   * ========================================================= */

  static getCatalogVersions(): CatalogVersion[] {
    try {
      const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      //
    }
    return [INITIAL_CATALOG_VERSION];
  }

  static getPublishedCatalog(): CatalogVersion {
    const versions = this.getCatalogVersions();
    const published = versions.find((v) => v.status === "published");
    return published || INITIAL_CATALOG_VERSION;
  }

  static saveCatalogVersion(version: CatalogVersion) {
    const versions = this.getCatalogVersions();
    const existingIndex = versions.findIndex(
      (v) => v.version === version.version,
    );
    if (existingIndex >= 0) {
      versions[existingIndex] = version;
    } else {
      versions.push(version);
    }
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(versions));
    } catch {
      //
    }
  }

  static publishNewCatalogVersion(
    items: NeedCatalogItem[],
    adminName: string,
    intro: CatalogVersion["editorialIntro"],
  ): CatalogVersion {
    const current = this.getPublishedCatalog();
    const parts = current.version.split(".").map(Number);
    const newVer = `${parts[0]}.${(parts[1] || 0) + 1}.0`;

    const newCatalog: CatalogVersion = {
      version: newVer,
      publishedAt: new Date().toISOString(),
      publishedBy: adminName,
      status: "published",
      editorialIntro: intro,
      items: items.map((item, idx) => ({ ...item, orderIndex: idx })),
    };

    // Marcar as anteriores como arquivadas
    const all = this.getCatalogVersions().map((v) =>
      v.status === "published" ? { ...v, status: "archived" as const } : v,
    );
    all.unshift(newCatalog);

    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(all));
    } catch {
      //
    }

    return newCatalog;
  }
}

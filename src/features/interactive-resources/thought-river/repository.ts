import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { validateRiverSession } from "./schema";
import type {
  RiverSessionInput,
  RiverSessionRecord,
  RiverSessionResult,
} from "./types";

const RIVER_SESSIONS_TABLE = "river_sessions";
const HISTORY_LIMIT_MAX = 50;

interface RiverSessionRow {
  id: string;
  user_id: string;
  client_request_id: string;
  schema_version: number;
  content_version: string;
  mode: RiverSessionRecord["mode"];
  planned_duration_seconds: RiverSessionRecord["plannedDurationSeconds"];
  active_duration_seconds: number;
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

function toRecord(row: RiverSessionRow): RiverSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    clientRequestId: row.client_request_id,
    schemaVersion: row.schema_version,
    contentVersion: row.content_version,
    mode: row.mode,
    plannedDurationSeconds: row.planned_duration_seconds,
    activeDurationSeconds: row.active_duration_seconds,
    reflection: row.reflection,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getClientAndUser(): Promise<{
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  userId: string;
} | null> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { supabase, userId: user.id };
}

function validationFailure(error: string): RiverSessionResult<never> {
  return { ok: false, code: "validation_error", error };
}

function unavailable(error: string): RiverSessionResult<never> {
  return { ok: false, code: "unavailable", error };
}

export async function saveRiverSession(
  input: RiverSessionInput,
): Promise<RiverSessionResult<RiverSessionRecord>> {
  const parsed = validateRiverSession(input);
  if (parsed.success === false) return validationFailure(parsed.error);

  const context = await getClientAndUser();
  if (!context) {
    return {
      ok: false,
      code: "unauthenticated",
      error: "Faça login para guardar este registro.",
    };
  }

  const { supabase, userId } = context;
  const values = {
    user_id: userId,
    client_request_id: parsed.data.clientRequestId,
    content_version: parsed.data.contentVersion,
    mode: parsed.data.mode,
    planned_duration_seconds: parsed.data.plannedDurationSeconds,
    active_duration_seconds: parsed.data.activeDurationSeconds,
    reflection: parsed.data.reflection,
  };
  const { data, error } = await supabase
    .from(RIVER_SESSIONS_TABLE as never)
    .insert(values as never)
    .select()
    .single();

  if (!error && data)
    return { ok: true, data: toRecord(data as unknown as RiverSessionRow) };

  if (error?.code !== "23505") {
    return unavailable(error?.message || "Não foi possível salvar o registro.");
  }

  const { data: existing, error: existingError } = await supabase
    .from(RIVER_SESSIONS_TABLE as never)
    .select("*")
    .eq("user_id", userId)
    .eq("client_request_id", parsed.data.clientRequestId)
    .maybeSingle();

  if (existingError || !existing) {
    return unavailable(
      existingError?.message || "Não foi possível confirmar o registro salvo.",
    );
  }

  return { ok: true, data: toRecord(existing as unknown as RiverSessionRow) };
}

export async function listRiverSessions(
  cursor?: string,
  limit = 20,
): Promise<
  RiverSessionResult<{ items: RiverSessionRecord[]; nextCursor?: string }>
> {
  const context = await getClientAndUser();
  if (!context)
    return {
      ok: false,
      code: "unauthenticated",
      error: "Faça login para ver seu histórico.",
    };

  const cappedLimit = Math.min(Math.max(1, limit), HISTORY_LIMIT_MAX);
  let query = context.supabase
    .from(RIVER_SESSIONS_TABLE as never)
    .select("*")
    .eq("user_id", context.userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(cappedLimit + 1);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error)
    return unavailable(
      error.message || "Não foi possível carregar o histórico.",
    );

  const rows = (data || []) as unknown as RiverSessionRow[];
  const hasMore = rows.length > cappedLimit;
  const items = rows.slice(0, cappedLimit).map(toRecord);
  return {
    ok: true,
    data: {
      items,
      nextCursor: hasMore ? items.at(-1)?.createdAt : undefined,
    },
  };
}

export async function getRiverSession(
  id: string,
): Promise<RiverSessionResult<RiverSessionRecord>> {
  const context = await getClientAndUser();
  if (!context)
    return {
      ok: false,
      code: "unauthenticated",
      error: "Faça login para ver seu registro.",
    };

  const { data, error } = await context.supabase
    .from(RIVER_SESSIONS_TABLE as never)
    .select("*")
    .eq("id", id)
    .eq("user_id", context.userId)
    .maybeSingle();
  if (error)
    return unavailable(
      error.message || "Não foi possível carregar o registro.",
    );
  if (!data)
    return { ok: false, code: "not_found", error: "Registro não encontrado." };
  return { ok: true, data: toRecord(data as unknown as RiverSessionRow) };
}

export async function deleteRiverSession(
  id: string,
): Promise<RiverSessionResult<void>> {
  const context = await getClientAndUser();
  if (!context)
    return {
      ok: false,
      code: "unauthenticated",
      error: "Faça login para excluir seu registro.",
    };

  const { error } = await context.supabase
    .from(RIVER_SESSIONS_TABLE as never)
    .delete()
    .eq("id", id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();
  if (error)
    return unavailable(error.message || "Não foi possível excluir o registro.");
  return { ok: true, data: undefined };
}

export async function exportOwnRiverData(): Promise<
  RiverSessionResult<RiverSessionRecord[]>
> {
  const context = await getClientAndUser();
  if (!context)
    return {
      ok: false,
      code: "unauthenticated",
      error: "Faça login para exportar seus registros.",
    };

  const { data, error } = await context.supabase
    .from(RIVER_SESSIONS_TABLE as never)
    .select("*")
    .eq("user_id", context.userId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error)
    return unavailable(
      error.message || "Não foi possível exportar os registros.",
    );
  return {
    ok: true,
    data: ((data || []) as unknown as RiverSessionRow[]).map(toRecord),
  };
}

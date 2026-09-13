import type { PauseSessionRecord } from "./types";

const PAUSE_SESSIONS_TABLE = "pause_sessions";
const LOCAL_STORAGE_KEY = "fv_pause_sessions";

export interface SaveSessionOptions {
  /**
   * Reflections are personal content. They may only be retained locally after
   * an explicit choice in the interface.
   */
  allowLocalStorage?: boolean;
}

interface PauseSessionRow {
  id: string;
  user_id: string;
  practice_id: string;
  planned_duration_seconds: number;
  active_duration_seconds: number;
  ended_by: string;
  reflection: string | null;
  content_version: string;
  created_at: string;
  updated_at: string;
  client_request_id: string;
}

function rowToRecord(row: PauseSessionRow): PauseSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    practiceId: row.practice_id as PauseSessionRecord["practiceId"],
    plannedDurationSeconds: row.planned_duration_seconds,
    activeDurationSeconds: row.active_duration_seconds,
    endedBy: row.ended_by as PauseSessionRecord["endedBy"],
    reflection: row.reflection,
    contentVersion: row.content_version,
    createdAt: row.created_at,
    clientRequestId: row.client_request_id,
  };
}

function loadLocal(): PauseSessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(items: PauseSessionRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

function validateReflection(reflection: string | null): void {
  if (reflection !== null && reflection.length > 500) {
    throw new Error(
      `validation_error: Reflection must be 500 characters or fewer (got ${reflection.length}).`,
    );
  }
}

async function getSupabaseClientAndUser() {
  const { createSupabaseBrowserClient } =
    await import("@/infrastructure/supabase/client");
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, user };
}

export async function saveSession(
  record: PauseSessionRecord,
  options: SaveSessionOptions = {},
): Promise<PauseSessionRecord> {
  validateReflection(record.reflection);

  const ctx = await getSupabaseClientAndUser();

  if (!ctx) {
    // Unauthenticated: preserve the in-memory result unless the person opted
    // in to retain this personal reflection on the current device.
    if (!options.allowLocalStorage) {
      return record;
    }

    const items = loadLocal();
    const existingIndex = items.findIndex(
      (r) => r.clientRequestId === record.clientRequestId,
    );
    if (existingIndex >= 0) {
      items[existingIndex] = record;
    } else {
      items.unshift(record);
    }
    saveLocal(items);
    return record;
  }

  const { supabase, user } = ctx;

  const { data, error } = await (supabase as any)
    .from(PAUSE_SESSIONS_TABLE)
    .insert({
      user_id: user.id,
      practice_id: record.practiceId,
      planned_duration_seconds: record.plannedDurationSeconds,
      active_duration_seconds: record.activeDurationSeconds,
      ended_by: record.endedBy,
      reflection: record.reflection,
      content_version: record.contentVersion,
      client_request_id: record.clientRequestId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("conflict");
    }
    throw new Error(error.message || "Falha ao salvar sessao de pausa.");
  }

  if (!data) {
    throw new Error("unauthenticated");
  }

  return rowToRecord(data as PauseSessionRow);
}

export async function getHistory(
  userId: string,
  cursor?: string,
  limit: number = 20,
): Promise<{ items: PauseSessionRecord[]; nextCursor?: string }> {
  const cappedLimit = Math.min(limit, 50);

  const ctx = await getSupabaseClientAndUser();

  if (!ctx) {
    const items = loadLocal()
      .map((r) => ({ ...r }))
      .slice(0, cappedLimit);
    let nextCursor: string | undefined;
    if (items.length >= cappedLimit) {
      nextCursor = items[items.length - 1].createdAt;
    }
    return { items, nextCursor };
  }

  const { supabase } = ctx;

  // Only allow reading own history
  if (userId !== ctx.user.id) {
    throw new Error("forbidden");
  }

  let query = supabase
    .from(PAUSE_SESSIONS_TABLE)
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message || "Falha ao carregar historico de pausas.");
  }

  const items = (data || []).map((row) => rowToRecord(row as PauseSessionRow));

  let nextCursor: string | undefined;
  if (items.length > 0 && count !== null && count > cappedLimit) {
    nextCursor = items[items.length - 1].createdAt;
  }

  return { items, nextCursor };
}

export async function getSession(id: string): Promise<PauseSessionRecord> {
  const ctx = await getSupabaseClientAndUser();

  if (!ctx) {
    const localItems = loadLocal();
    const found = localItems.find((r) => r.id === id);
    if (found) return found;
    throw new Error("not_found");
  }

  const { supabase, user } = ctx;

  const { data, error } = await supabase
    .from(PAUSE_SESSIONS_TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "PGRST301") {
      throw new Error("not_found");
    }
    throw new Error(error.message || "Falha ao carregar sessao de pausa.");
  }

  if (!data) {
    throw new Error("not_found");
  }

  return rowToRecord(data as PauseSessionRow);
}

export async function deleteSession(id: string): Promise<void> {
  const ctx = await getSupabaseClientAndUser();

  if (!ctx) {
    const items = loadLocal().filter((r) => r.id !== id);
    saveLocal(items);
    return;
  }

  const { supabase, user } = ctx;

  const { error } = await supabase
    .from(PAUSE_SESSIONS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "PGRST116" || error.code === "PGRST301") {
      throw new Error("not_found");
    }
    throw new Error(error.message || "Falha ao excluir sessao de pausa.");
  }
}

export async function exportOwnData(): Promise<PauseSessionRecord[]> {
  const ctx = await getSupabaseClientAndUser();

  if (!ctx) {
    return loadLocal().map((r) => ({ ...r }));
  }

  const { supabase, user } = ctx;

  const { data, error } = await supabase
    .from(PAUSE_SESSIONS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message || "Falha ao exportar dados pessoais.");
  }

  return (data || []).map((row) => rowToRecord(row as PauseSessionRow));
}

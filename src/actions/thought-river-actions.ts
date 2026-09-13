"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { validateRiverSession } from "@/features/interactive-resources/thought-river/schema";
import type {
  RiverSessionInput,
  RiverSessionRecord,
  RiverSessionResult,
} from "@/features/interactive-resources/thought-river/types";

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

export async function saveRiverSessionServer(
  input: RiverSessionInput,
): Promise<RiverSessionResult<RiverSessionRecord>> {
  const parsed = validateRiverSession(input);
  if (parsed.success === false) {
    return { ok: false, code: "validation_error", error: parsed.error };
  }

  const claims = await verifySession();
  if (!claims) {
    return {
      ok: false,
      code: "unauthenticated",
      error: "Faça login para guardar este registro.",
    };
  }

  try {
    const supabase = createSupabaseServiceClient();
    const values = {
      user_id: claims.uid,
      client_request_id: parsed.data.clientRequestId,
      content_version: parsed.data.contentVersion,
      mode: parsed.data.mode,
      planned_duration_seconds: parsed.data.plannedDurationSeconds,
      active_duration_seconds: parsed.data.activeDurationSeconds,
      reflection: parsed.data.reflection,
    };
    const { data, error } = await supabase
      .from("river_sessions" as never)
      .insert(values as never)
      .select()
      .single();

    if (!error && data) {
      revalidatePath("/portal/recursos/rio-dos-pensamentos");
      revalidatePath("/portal/recursos/rio-dos-pensamentos/historico");
      return { ok: true, data: toRecord(data as unknown as RiverSessionRow) };
    }

    if (error?.code !== "23505") {
      return {
        ok: false,
        code: "unavailable",
        error: error?.message || "Não foi possível salvar o registro.",
      };
    }

    const { data: existing, error: existingError } = await supabase
      .from("river_sessions" as never)
      .select("*")
      .eq("user_id", claims.uid)
      .eq("client_request_id", parsed.data.clientRequestId)
      .maybeSingle();
    if (existingError || !existing) {
      return {
        ok: false,
        code: "unavailable",
        error:
          existingError?.message ||
          "Não foi possível confirmar o registro salvo.",
      };
    }

    return { ok: true, data: toRecord(existing as unknown as RiverSessionRow) };
  } catch {
    return {
      ok: false,
      code: "unavailable",
      error: "Não foi possível salvar o registro.",
    };
  }
}

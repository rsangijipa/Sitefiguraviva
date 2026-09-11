import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { EmotionRecord, EmotionRecordPayload } from "./types";

const RESOURCE_SLUG = "roda-das-emocoes";

export async function saveEmotionRecord(
  payload: EmotionRecordPayload,
  sessionId?: string,
): Promise<EmotionRecord> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Ephemeral in-memory or localStorage fallback if unauthenticated
    const localRecord: EmotionRecord = {
      id: "local-" + Date.now(),
      user_id: "anonymous",
      resource_slug: RESOURCE_SLUG,
      session_id: sessionId || null,
      payload,
      is_private: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(
        localStorage.getItem("fv_emotion_records") || "[]",
      );
      localStorage.setItem(
        "fv_emotion_records",
        JSON.stringify([localRecord, ...existing]),
      );
    } catch {
      // ignore storage error
    }
    return localRecord;
  }

  const { data, error } = await supabase
    .from("interactive_resource_entries" as never)
    .insert({
      user_id: user.id,
      resource_slug: RESOURCE_SLUG,
      session_id: sessionId || null,
      payload,
      is_private: true,
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao salvar registro no histórico.");
  }

  return data as unknown as EmotionRecord;
}

export async function listEmotionRecords(): Promise<EmotionRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    try {
      return JSON.parse(localStorage.getItem("fv_emotion_records") || "[]");
    } catch {
      return [];
    }
  }

  const { data, error } = await supabase
    .from("interactive_resource_entries" as never)
    .select("*")
    .eq("resource_slug", RESOURCE_SLUG)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Falha ao carregar histórico.");
  }

  return (data || []) as unknown as EmotionRecord[];
}

export async function deleteEmotionRecord(id: string): Promise<void> {
  if (id.startsWith("local-")) {
    try {
      const existing = JSON.parse(
        localStorage.getItem("fv_emotion_records") || "[]",
      );
      const filtered = existing.filter((r: EmotionRecord) => r.id !== id);
      localStorage.setItem("fv_emotion_records", JSON.stringify(filtered));
    } catch {
      // ignore
    }
    return;
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("interactive_resource_entries" as never)
    .update({ archived_at: new Date().toISOString() } as never)
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Falha ao excluir registro.");
  }
}

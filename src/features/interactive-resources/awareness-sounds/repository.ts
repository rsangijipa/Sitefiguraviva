import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { validateListeningSession } from "./schema";
import type { ListeningSession, ListeningSessionInput } from "./types";

const map = (row: any): ListeningSession => ({
  id: row.id,
  mode: row.mode,
  durationSeconds: row.duration_seconds,
  observations: row.observations,
  reflection: row.reflection,
  clientRequestId: row.client_request_id,
  contentVersion: row.content_version,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  version: row.version,
});
async function clientAndUser() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");
  return { supabase, user };
}
export async function saveListeningSession(input: ListeningSessionInput) {
  const invalid = validateListeningSession(input);
  if (invalid) throw new Error(invalid);
  const { supabase, user } = await clientAndUser();
  const { data, error } = await (supabase as any)
    .from("listening_sessions")
    .upsert(
      {
        user_id: user.id,
        mode: input.mode,
        duration_seconds: input.durationSeconds,
        observations: input.observations,
        reflection: input.reflection ?? null,
        client_request_id: input.clientRequestId,
        content_version: input.contentVersion,
      },
      { onConflict: "user_id,client_request_id" },
    )
    .select()
    .single();
  if (error) throw new Error(error.message || "unavailable");
  return map(data);
}
export async function listListeningSessions() {
  const { supabase, user } = await clientAndUser();
  const { data, error } = await (supabase as any)
    .from("listening_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message || "unavailable");
  return (data || []).map(map);
}
export async function deleteListeningSession(id: string) {
  const { supabase, user } = await clientAndUser();
  const { error } = await (supabase as any)
    .from("listening_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message || "unavailable");
}
export async function exportOwnListeningData() {
  return listListeningSessions();
}

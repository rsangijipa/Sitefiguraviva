import type { InteractiveResourceEntry } from "../../../types";

const KEY = "figura_viva_diary_entries_v1";
function allEntries(): InteractiveResourceEntry[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Histórico local inválido");
  return parsed.filter((entry): entry is InteractiveResourceEntry =>
    entry && typeof entry.id === "string" && typeof entry.user_id === "string" &&
    typeof entry.resource_slug === "string" && entry.payload && typeof entry.payload === "object",
  );
}

export function readDiary(ownerId: string) {
  return allEntries().filter(entry => entry.user_id === ownerId && entry.resource_slug === "roda-das-emocoes");
}
export function saveDiary(ownerId: string, sessionId: string, payload: InteractiveResourceEntry["payload"]) {
  const now = new Date().toISOString();
  const entry: InteractiveResourceEntry = {
    id: crypto.randomUUID(), user_id: ownerId, resource_slug: "roda-das-emocoes",
    session_id: sessionId, payload, is_private: true, created_at: now, updated_at: now,
  };
  // The write must succeed before the UI announces that anything was saved.
  localStorage.setItem(KEY, JSON.stringify([entry, ...allEntries()]));
  return entry;
}
export function deleteDiary(ownerId: string, id: string) {
  localStorage.setItem(KEY, JSON.stringify(allEntries().filter(entry => entry.user_id !== ownerId || entry.resource_slug !== "roda-das-emocoes" || entry.id !== id)));
}

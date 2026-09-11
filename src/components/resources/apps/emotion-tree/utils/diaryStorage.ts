import { DiaryEntry } from "../types";

const STORAGE_KEY = "roda_emocoes_diario_v1";

export function getSavedDiaryEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erro ao ler diário do localStorage:", error);
    return [];
  }
}

export function saveDiaryEntry(
  entry: Omit<DiaryEntry, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): DiaryEntry {
  const current = getSavedDiaryEntries();
  const newEntry: DiaryEntry = {
    ...entry,
    id:
      entry.id ||
      `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    created_at: entry.created_at || new Date().toISOString(),
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Erro ao salvar no diário:", error);
  }
  return newEntry;
}

export function deleteDiaryEntry(id: string): DiaryEntry[] {
  const current = getSavedDiaryEntries();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Erro ao remover do diário:", error);
  }
  return updated;
}

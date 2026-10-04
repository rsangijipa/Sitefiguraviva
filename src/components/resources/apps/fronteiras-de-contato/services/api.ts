import { Vignette, DiaryEntry } from "../types";
import { DEFAULT_VIGNETTES } from "../data/defaultVignettes";

const STORAGE_VIGNETTES_KEY = "fronteiras_vignettes_backup";
const STORAGE_DIARY_KEY = "fronteiras_diary_entries";

// Helper for safe localStorage access
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("LocalStorage error:", err);
  }
}

export async function getVignettes(): Promise<Vignette[]> {
  return getLocal<Vignette[]>(STORAGE_VIGNETTES_KEY, DEFAULT_VIGNETTES);
}

export async function createVignette(
  vignette: Partial<Vignette>,
): Promise<Vignette> {
  const payload: Vignette = {
    id: "vig-" + Date.now(),
    title: vignette.title || "Nova Vinheta Relacional",
    category: vignette.category || "Autonomia & Limites",
    context: vignette.context || "",
    situation: vignette.situation || "",
    responses: vignette.responses || [],
    reflectiveQuestion:
      vignette.reflectiveQuestion ||
      "O que esta situação desperta em seu corpo?",
    instituteCoreLesson: vignette.instituteCoreLesson || "",
    isDefault: false,
    createdAt: new Date().toISOString(),
  };

  const current = getLocal<Vignette[]>(
    STORAGE_VIGNETTES_KEY,
    DEFAULT_VIGNETTES,
  );
  setLocal(STORAGE_VIGNETTES_KEY, [payload, ...current]);
  return payload;
}

export async function updateVignette(
  id: string,
  updates: Partial<Vignette>,
): Promise<Vignette | null> {
  const current = getLocal<Vignette[]>(
    STORAGE_VIGNETTES_KEY,
    DEFAULT_VIGNETTES,
  );
  const index = current.findIndex((v) => v.id === id);
  if (index === -1) return null;
  current[index] = { ...current[index], ...updates };
  setLocal(STORAGE_VIGNETTES_KEY, current);
  return current[index];
}

export async function deleteVignette(id: string): Promise<boolean> {
  const current = getLocal<Vignette[]>(
    STORAGE_VIGNETTES_KEY,
    DEFAULT_VIGNETTES,
  );
  setLocal(
    STORAGE_VIGNETTES_KEY,
    current.filter((v) => v.id !== id),
  );
  return true;
}

export async function resetVignettes(): Promise<Vignette[]> {
  setLocal(STORAGE_VIGNETTES_KEY, DEFAULT_VIGNETTES);
  return DEFAULT_VIGNETTES;
}

// Diary Services
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  return getLocal<DiaryEntry[]>(STORAGE_DIARY_KEY, []);
}

export async function saveDiaryEntry(
  entry: Omit<DiaryEntry, "id" | "createdAt">,
): Promise<DiaryEntry> {
  const newEntry: DiaryEntry = {
    ...entry,
    id: "diary-" + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const current = getLocal<DiaryEntry[]>(STORAGE_DIARY_KEY, []);
  const updated = [newEntry, ...current];
  setLocal(STORAGE_DIARY_KEY, updated);
  return newEntry;
}

export async function deleteDiaryEntry(id: string): Promise<boolean> {
  const current = getLocal<DiaryEntry[]>(STORAGE_DIARY_KEY, []);
  setLocal(
    STORAGE_DIARY_KEY,
    current.filter((e) => e.id !== id),
  );
  return true;
}

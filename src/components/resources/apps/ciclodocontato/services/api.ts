import {
  ContactStage,
  ScenarioItem,
  ContactCycleConfig,
  UserSessionRecord,
} from "../types";
import {
  DEFAULT_STAGES,
  DEFAULT_SCENARIOS,
  DEFAULT_CONFIG,
} from "../data/defaultData";

const STORAGE_KEYS = {
  STAGES: "figura_viva_cycle_stages_v1",
  SCENARIOS: "figura_viva_cycle_scenarios_v1",
  CONFIG: "figura_viva_cycle_config_v1",
  SESSIONS: "figura_viva_cycle_sessions_v1",
  SAVED_STAGES: "figura_viva_cycle_saved_v1",
  REFLECTIONS: "figura_viva_cycle_reflections_v1",
};

export async function getContactCycleConfig(): Promise<ContactCycleConfig> {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading config", e);
  }
  return DEFAULT_CONFIG;
}

export async function saveContactCycleConfig(
  config: ContactCycleConfig,
): Promise<ContactCycleConfig> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
  return config;
}

export async function getContactStages(): Promise<ContactStage[]> {
  if (typeof window === "undefined") return DEFAULT_STAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error loading stages", e);
  }
  return DEFAULT_STAGES;
}

export async function saveContactStages(
  stages: ContactStage[],
): Promise<ContactStage[]> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(stages));
  }
  return stages;
}

export async function updateContactStage(
  id: string,
  updates: Partial<ContactStage>,
): Promise<ContactStage[]> {
  const stages = await getContactStages();
  const next = stages.map((s) => (s.id === id ? { ...s, ...updates } : s));
  await saveContactStages(next);
  return next;
}

export async function getScenarios(): Promise<ScenarioItem[]> {
  if (typeof window === "undefined") return DEFAULT_SCENARIOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error loading scenarios", e);
  }
  return DEFAULT_SCENARIOS;
}

export async function saveScenarios(
  scenarios: ScenarioItem[],
): Promise<ScenarioItem[]> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
  }
  return scenarios;
}

export async function getSavedStages(): Promise<string[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_STAGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading saved stages", e);
  }
  return [];
}

export async function toggleSaveStage(slug: string): Promise<string[]> {
  const saved = await getSavedStages();
  let next: string[];
  if (saved.includes(slug)) {
    next = saved.filter((s) => s !== slug);
  } else {
    next = [...saved, slug];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SAVED_STAGES, JSON.stringify(next));
  }
  return next;
}

export async function saveReflection(
  key: string,
  content: string,
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    const refMap = raw ? JSON.parse(raw) : {};
    refMap[key] = content;
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(refMap));
  } catch (e) {
    console.error("Error saving reflection", e);
  }
}

export async function getReflections(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading reflections", e);
  }
  return {};
}

export async function recordSession(record: UserSessionRecord): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(
      STORAGE_KEYS.SESSIONS,
      JSON.stringify(list.slice(0, 20)),
    );
  } catch (e) {
    console.error("Error recording session", e);
  }
}

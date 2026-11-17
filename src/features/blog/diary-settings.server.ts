import "server-only";

import { createSupabaseAnonServerClient } from "@/infrastructure/supabase/server";
import {
  DEFAULT_DIARY_SETTINGS,
  DIARY_SETTINGS_KEY,
  LEGACY_THEME_KEY,
  parseDiarySettings,
  type DiarySettings,
} from "./diary-blocks";

/** Fundo e ordem do diário visual; se a leitura falhar, usa o padrão. */
export async function getDiarySettings(): Promise<DiarySettings> {
  try {
    const { data, error } = await createSupabaseAnonServerClient()
      .from("public_pages")
      .select("key, content")
      .in("key", [DIARY_SETTINGS_KEY, LEGACY_THEME_KEY])
      .eq("is_published", true);
    if (error) throw error;
    const current = data?.find(
      (row) => row.key === DIARY_SETTINGS_KEY,
    )?.content;
    const legacy = data?.find((row) => row.key === LEGACY_THEME_KEY)?.content;
    return parseDiarySettings(current, legacy);
  } catch (error) {
    console.error("Error loading diary settings:", error);
    return DEFAULT_DIARY_SETTINGS;
  }
}

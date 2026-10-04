import "server-only";

import { QUOTES } from "@/features/awareness-tree/data/quotes";
import { THEMES } from "@/features/awareness-tree/data/themes";
import type {
  FavoritePayload,
  InteractionPayload,
  Quote,
  ThemeFilter,
  ThemeOption,
  ThemeSlug,
} from "@/features/awareness-tree/types/quote";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

function activeQuotes(): Quote[] {
  return QUOTES.filter((quote) => quote.active);
}

function byTheme(theme: ThemeFilter): Quote[] {
  return theme === "all"
    ? activeQuotes()
    : activeQuotes().filter((quote) => quote.theme === theme);
}

function randomFromList(quotes: Quote[], excludeId?: string): Quote | null {
  const eligible = excludeId
    ? quotes.filter((quote) => quote.id !== excludeId)
    : quotes;
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)] ?? null;
}

export async function listThemes(): Promise<ThemeOption[]> {
  return THEMES;
}

/** O catálogo é editorial e versionado no repositório; dados pessoais ficam no Supabase. */
export async function listQuotes(theme: ThemeFilter): Promise<Quote[]> {
  return byTheme(theme);
}

export async function randomQuote(
  theme: ThemeFilter,
  excludeId?: string,
): Promise<Quote | null> {
  return randomFromList(await listQuotes(theme), excludeId);
}

export async function registerInteractions(
  payloads: InteractionPayload[],
): Promise<void> {
  if (payloads.length === 0) return;

  const { error } = await createSupabaseServiceClient()
    .from("awareness_interactions")
    .insert(
      payloads.map((payload) => ({
        user_id: payload.sessionId,
        action_type: payload.actionType,
        quote_id: payload.quoteId ?? null,
        theme: payload.theme ?? "all",
      })),
    );

  if (error) throw new Error("Nao foi possivel registrar as interacoes.");
}

export async function listFavorites(userId: string): Promise<string[]> {
  const { data, error } = await createSupabaseServiceClient()
    .from("awareness_favorites")
    .select("quote_id")
    .eq("user_id", userId);

  if (error) throw new Error("Nao foi possivel carregar as favoritas.");
  return data.map((favorite) => favorite.quote_id);
}

export async function saveFavorite(
  payload: FavoritePayload,
): Promise<string[]> {
  const supabase = createSupabaseServiceClient();
  const mutation = payload.isFavorite
    ? supabase.from("awareness_favorites").upsert(
        {
          user_id: payload.sessionId,
          quote_id: payload.quoteId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,quote_id" },
      )
    : supabase
        .from("awareness_favorites")
        .delete()
        .eq("user_id", payload.sessionId)
        .eq("quote_id", payload.quoteId);

  const { error } = await mutation;
  if (error) throw new Error("Nao foi possivel salvar a favorita.");
  return listFavorites(payload.sessionId);
}

export async function hasTheme(theme: string): Promise<boolean> {
  return (
    theme === "all" || THEMES.some((item) => item.slug === (theme as ThemeSlug))
  );
}

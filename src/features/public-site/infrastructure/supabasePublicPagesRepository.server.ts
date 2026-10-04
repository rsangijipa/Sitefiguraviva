import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Json } from "@/infrastructure/supabase/database.types";

export type PublicPageKey =
  | "founder"
  | "institute"
  | "seo"
  | "team"
  | "legal"
  | "config"
  | "home";

export async function getPublicPage<T extends object>(
  key: PublicPageKey,
  fallback: T,
): Promise<T> {
  const { data, error } = await createSupabaseServiceClient()
    .from("public_pages")
    .select("content,is_published")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data?.is_published && data.content && typeof data.content === "object"
    ? ({ ...fallback, ...(data.content as object) } as T)
    : fallback;
}

export async function upsertPublicPage(
  key: PublicPageKey,
  content: Record<string, unknown>,
  published = true,
): Promise<string> {
  const now = new Date().toISOString();
  const { data, error } = await createSupabaseServiceClient()
    .from("public_pages")
    .upsert({
      key,
      content: content as Json,
      is_published: published,
      published_at: published ? now : null,
      updated_at: now,
    })
    .select("updated_at")
    .single();
  if (error) throw error;
  return data.updated_at;
}

/** Preserve fields owned by other editors, including concurrent saves. */
export async function patchPublicConfig(
  patch: Record<string, unknown>,
): Promise<string> {
  const client = createSupabaseServiceClient();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: current, error: readError } = await client
      .from("public_pages")
      .select("content,updated_at")
      .eq("key", "config")
      .maybeSingle();
    if (readError) throw readError;
    const previous = current?.content;
    if (
      current &&
      (!previous || typeof previous !== "object" || Array.isArray(previous))
    )
      throw new Error(
        "Configuração inválida. Revise o registro antes de salvar.",
      );
    const now = new Date().toISOString();
    const values = {
      content: { ...((previous as object) || {}), ...patch } as Json,
      is_published: true,
      published_at: now,
      updated_at: now,
    };
    const result = current
      ? await client
          .from("public_pages")
          .update(values)
          .eq("key", "config")
          .eq("updated_at", current.updated_at)
          .select("updated_at")
          .maybeSingle()
      : await client
          .from("public_pages")
          .insert({ key: "config", ...values })
          .select("updated_at")
          .maybeSingle();
    if (result.error) {
      if (!current && result.error.code === "23505") continue;
      throw result.error;
    }
    if (result.data) return result.data.updated_at;
  }
  throw new Error(
    "As configurações foram alteradas durante o salvamento. Tente novamente.",
  );
}

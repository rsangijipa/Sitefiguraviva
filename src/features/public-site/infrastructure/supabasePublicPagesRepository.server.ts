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

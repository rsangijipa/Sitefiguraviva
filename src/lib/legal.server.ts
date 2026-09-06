import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { DEFAULT_LEGAL, type LegalSettings } from "./legal";

/**
 * Server-side read of the legal copy edited in Admin → Settings.
 * Falls back to DEFAULT_LEGAL so the public pages always render something
 * valid, even before an admin has saved anything or if Firestore is down.
 */
export async function getLegalSettings(): Promise<LegalSettings> {
  try {
    const { data: row, error } = await createSupabaseServiceClient()
      .from("public_pages")
      .select("content")
      .eq("key", "legal")
      .maybeSingle();
    if (error) throw error;
    if (!row?.content) return DEFAULT_LEGAL;
    const data = row.content as Partial<LegalSettings>;

    return {
      privacy: data.privacy?.content?.length
        ? data.privacy
        : DEFAULT_LEGAL.privacy,
      terms: data.terms?.content?.length ? data.terms : DEFAULT_LEGAL.terms,
    };
  } catch (error) {
    console.error("getLegalSettings failed, using defaults:", error);
    return DEFAULT_LEGAL;
  }
}

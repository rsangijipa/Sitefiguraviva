"use client";

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

/** Access token da sessão principal do portal, usado pelas APIs da árvore. */
export async function getSupabaseSessionToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await createSupabaseBrowserClient().auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

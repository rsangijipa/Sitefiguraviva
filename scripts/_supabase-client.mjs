import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for the maintenance scripts.
 *
 * These scripts previously hard-coded a service_role key, which was committed
 * and pushed. A service_role key bypasses row level security entirely, so it
 * must never live in the repository — it is read from the environment here and
 * the script fails loudly when it is missing.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Set them in .env.local (they are git-ignored) before running this script.",
    );
    process.exit(1);
  }

  return createClient(url, key);
}

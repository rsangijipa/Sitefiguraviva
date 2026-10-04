import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { validateSupabaseKey, validateSupabaseUrl } from "./environment";

let serviceClient: SupabaseClient<Database> | null = null;
let anonServerClient: SupabaseClient<Database> | null = null;

function requireSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to use Supabase.");
  }
  return validateSupabaseUrl(url).url;
}

export function createSupabaseServiceClient() {
  if (serviceClient) return serviceClient;

  // Deliberately no anon-key fallback. This client is trusted to bypass RLS
  // for session verification, role lookups and admin writes; silently
  // downgrading it to the anon key would make those reads subject to RLS and
  // lock admins out (or, with a permissive policy, expose roles publicly)
  // with no error to explain why.
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required for server-side Supabase access. " +
        "Use createSupabaseAnonServerClient() for requests that should honour RLS.",
    );
  }

  const url = requireSupabaseUrl();
  validateSupabaseKey(url, key, "service");
  serviceClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "figura-viva-platform/server",
      },
    },
  });

  return serviceClient;
}

export function createSupabaseAnonServerClient() {
  if (anonServerClient) return anonServerClient;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is required to use Supabase.",
    );
  }

  const url = requireSupabaseUrl();
  validateSupabaseKey(url, anonKey, "public");
  anonServerClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return anonServerClient;
}

// Auth mutations need a request-local client rather than sharing a user session.
export function createSupabaseAuthServerClient() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("Supabase public key is required for Auth.");
  const url = requireSupabaseUrl();
  validateSupabaseKey(url, key, "public");
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

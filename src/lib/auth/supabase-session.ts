import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export type SupabaseSessionClaims = {
  uid: string;
  email?: string;
  role: string;
  admin: boolean;
  tutor: boolean;
  isActive: boolean;
};

function normalizeRole(role: unknown): string {
  return String(role || "")
    .trim()
    .toLowerCase();
}

/**
 * Verifies a Supabase access token and maps its profile into the claims used
 * by server-side authorization. The token is always verified by Supabase; its
 * decoded payload is never trusted on its own.
 */
export async function getSupabaseSessionClaims(
  accessToken: string | null | undefined,
): Promise<SupabaseSessionClaims | null> {
  if (!accessToken || typeof accessToken !== "string") return null;

  try {
    const supabase = createSupabaseServiceClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) return null;

    const role = normalizeRole(profile?.role);
    const isActive = profile?.is_active !== false;
    const admin = isActive && (role === "admin" || role === "administrador");

    return {
      uid: user.id,
      email: user.email,
      role,
      admin,
      tutor: isActive && role === "tutor",
      isActive,
    };
  } catch {
    // Authentication must fail closed if Supabase is unavailable or misconfigured.
    return null;
  }
}

export async function getBearerSupabaseSessionClaims(
  request: Request,
): Promise<SupabaseSessionClaims | null> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return getSupabaseSessionClaims(match?.[1]);
}

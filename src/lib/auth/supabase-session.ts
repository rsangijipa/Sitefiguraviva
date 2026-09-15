import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { isAdminEmail } from "@/lib/auth/authService";

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

    const emailIsAdmin = isAdminEmail(user.email);
    const role = emailIsAdmin ? "admin" : normalizeRole(profile?.role);
    const isActive = profile?.is_active !== false;
    const admin =
      isActive &&
      (role === "admin" || role === "administrador" || emailIsAdmin);

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

/** Valida um bearer token Supabase sem exigir perfil ou papel na aplicação. */
export async function getBearerSupabaseUserId(
  request: Request,
): Promise<string | null> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) return null;

  try {
    const supabase = createSupabaseServiceClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(match[1]);
    return error || !user ? null : user.id;
  } catch {
    return null;
  }
}

/**
 * Reads the `exp` claim without trusting it for authorization — the token is
 * verified separately by Supabase. This only decides how long to keep the
 * cookie, so it never outlives the token it holds.
 */
export function readTokenExpirySeconds(accessToken: string): number | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString("utf8"),
    );

    if (typeof decoded?.exp !== "number") return null;

    const seconds = decoded.exp - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : null;
  } catch {
    return null;
  }
}

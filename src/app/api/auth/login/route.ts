import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/auth/request-origin";
import { cookies } from "next/headers";
import {
  rateLimit,
  RateLimitPresets,
  getClientIdentifier,
} from "@/lib/rateLimit";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { ensureUserDoc } from "@/lib/auth/user-service";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";

/** Fallback lifetime when the token carries no readable `exp` claim. */
const DEFAULT_SESSION_SECONDS = 60 * 60;

/**
 * Reads the `exp` claim without trusting it for authorization — the token is
 * verified separately by Supabase. This only decides how long to keep the
 * cookie, so it never outlives the token it holds.
 */
function readTokenExpirySeconds(accessToken: string): number | null {
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

export async function POST(request: Request) {
  // Browsers can send cross-site text/plain POSTs without a CORS preflight.
  // Reject them before token validation or writing a session cookie.
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return NextResponse.json({ error: "JSON required" }, { status: 415 });
  }
  try {
    const ip = getClientIdentifier(request);
    const rl = await rateLimit(
      ip,
      "session_sync",
      RateLimitPresets.SESSION_SYNC,
    );

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const accessToken =
      body && typeof body === "object" && "accessToken" in body
        ? body.accessToken
        : null;

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { error: "Missing Access Token" },
        { status: 400 },
      );
    }

    // Never mint a session cookie from an unverified string.
    const supabase = createSupabaseServiceClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserDoc({
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name,
      picture: user.user_metadata?.avatar_url,
    });
    if (!profile.success || !(await getSupabaseSessionClaims(accessToken))) {
      return NextResponse.json(
        { error: "Profile unavailable" },
        { status: 403 },
      );
    }

    // The cookie must not outlive the token inside it: Supabase access tokens
    // expire in about an hour, and a 7-day cookie left the middleware waving
    // through requests that every server-side check then rejected.
    const maxAge =
      readTokenExpirySeconds(accessToken) ?? DEFAULT_SESSION_SECONDS;

    const cookieStore = await cookies();
    cookieStore.set("session", accessToken, {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    if (error instanceof Error && error.name === "RateLimitUnavailableError")
      return NextResponse.json(
        {
          error:
            "Serviço temporariamente indisponível. Tente novamente em alguns instantes.",
        },
        {
          status: 503,
          headers: { "Retry-After": "30", "Cache-Control": "no-store" },
        },
      );
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

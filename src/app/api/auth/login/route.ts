import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  rateLimit,
  RateLimitPresets,
  getClientIdentifier,
} from "@/lib/rateLimit";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getAdminAuth } from "@/lib/firebase/admin";

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

    const body = await request.json();
    const { accessToken } = body;

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

    // Firestore security rules gate reads on Firebase Auth (`request.auth`),
    // but the app only authenticates through Supabase. Mint a Firebase custom
    // token for the same uid so the client can sign into Firebase Auth too —
    // without this, every direct client-side Firestore read is rejected with
    // permission-denied regardless of the (valid) Supabase session.
    let firebaseToken: string | null = null;
    try {
      firebaseToken = await getAdminAuth().createCustomToken(user.id);
    } catch (tokenError) {
      console.error("Firebase custom token minting failed:", tokenError);
    }

    return NextResponse.json({ status: "success", firebaseToken });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

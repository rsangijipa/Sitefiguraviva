"use server";

import { verifySession } from "@/lib/auth/server";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { logAudit } from "@/lib/audit";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "session";
const IMPERSONATION_COOKIE_NAME = "admin_session_backup";

export async function impersonateUser(targetUid: string) {
  const session = await verifySession();

  if (!session) {
    return { error: "Unauthorized: No active session" };
  }

  try {
    await logAudit({
      actor: {
        uid: session.uid,
        email: session.email,
        role: String(session.role || "unknown"),
      },
      action: "auth.impersonate_attempt_denied",
      target: { collection: "users", id: targetUid },
      metadata: { reason: "feature_disabled_security_hardening" },
    });
  } catch {
    // no-op
  }

  return {
    error: "Impersonation is temporarily disabled for security hardening.",
  };
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  const backupSession = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;

  if (!backupSession) {
    // If lost, just logout completely
    cookieStore.delete(COOKIE_NAME);
    redirect("/auth");
  }

  try {
    // Verify backup token is still valid with Supabase session claims
    const claims = await getSupabaseSessionClaims(backupSession);
    if (!claims) {
      throw new Error("Invalid backup session");
    }

    // Log stop
    await logAudit({
      actor: { uid: claims.uid, email: claims.email, role: "admin" },
      action: "auth.impersonate_stop",
      target: { collection: "system", id: "self" },
    });

    // Restore
    cookieStore.set(COOKIE_NAME, backupSession, {
      maxAge: 60 * 60 * 24 * 5, // reset window
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    cookieStore.delete(IMPERSONATION_COOKIE_NAME);

    return { success: true };
  } catch {
    // Backup invalid
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete(IMPERSONATION_COOKIE_NAME);
    redirect("/auth");
  }
}

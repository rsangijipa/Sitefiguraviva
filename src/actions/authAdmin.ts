"use server";

import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";
import { verifySession } from "@/lib/auth/server";

const IMPERSONATION_COOKIE_NAME = "admin_session_backup";

/** Deliberately disabled until a Supabase-native audited impersonation design exists. */
export async function impersonateUser(targetUid: string) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized: No active session" };
  if (!session.isAdmin) return { error: "Forbidden" };
  await logAudit({
    actor: { uid: session.uid, email: session.email, role: session.role },
    action: "auth.impersonate_attempt_denied",
    target: { collection: "profiles", id: targetUid },
    metadata: { reason: "feature_disabled_security_hardening" },
  });
  return {
    error: "Impersonation is temporarily disabled for security hardening.",
  };
}

/** Clears a stale legacy backup cookie; no identity is switched in Supabase. */
export async function stopImpersonation() {
  const session = await verifySession();
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE_NAME);
  if (session?.isAdmin) {
    await logAudit({
      actor: { uid: session.uid, email: session.email, role: session.role },
      action: "auth.impersonate_stop",
      target: { collection: "system", id: "self" },
      metadata: { legacyCookieCleared: true },
    });
  }
  return { success: true };
}

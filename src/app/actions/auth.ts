"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string;
}

export async function ensureUserProfileAction(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    // 1. Verify Session / Auth (Implicitly trusted if called after client login, but strictly we should verify token if passed,
    // or relies on session cookie.
    // Since this is called right after login on client, the session cookie might not be set yet if we use client SDK.
    // EXCEPT: The user demands "Server Action... Exige usuário autenticado (pegar UID/email...)"
    // If we uses client SDK login, we don't have a session cookie yet.
    // We probably need to pass the ID Token or rely on the fact that this might be called AFTER session creation?
    // Wait, the prompt says "Após login... chama ensureUserProfileAction".
    // Standard pattern: Client Login -> Get ID Token -> Set Cookie -> Call Action.
    // OR: Client Login -> Call Action (passing nothing?) -> Action checks logic.
    // BUT: Server Actions can't see Client SDK auth state directly.
    // So we either need a session cookie OR pass the ID token.
    // The prompt implies a standard flow. Let's assume the session cookie is set OR we verify the ID token passed as arg?
    // "Exige usuário autenticado" - usually implies verifying the session cookie.
    // Let's assume the client sets the cookie first (which the legacy login page did).
    // The new auth page must do the same: Login -> /api/auth/login (cookie) -> ensureUserProfileAction.

    // However, to be robust, let's accept an ID Token optionally, OR check cookie.
    // Actually, looking at the previous login page, it did: `await fetch('/api/auth/login', ...)`
    // So the cookie is set. Then we can use `cookies()` to get it.

    // Let's import headers/cookies
    const { cookies } = await import("next/headers");
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return { success: false, error: "Unauthenticated" };
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const { uid, email, name, picture } = decodedToken;

    if (!email) return { success: false, error: "No email provided" };

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let role = "student";
    let isActive = true;

    if (userDoc.exists) {
      const data = userDoc.data();
      role = data?.role || "student";
      isActive = data?.isActive !== false;

      // Keep governance fields stable: never auto-reactivate a disabled account.
      await userRef.set(
        {
          uid,
          email, // Ensure email is in sync
          displayName: name || data?.displayName || null, // Prefer token name (Google) or keep existing
          photoURL: picture || data?.photoURL || null,
          updatedAt: Timestamp.now(),
          lastSyncedAt: Timestamp.now(),
          role, // Force updated role
          isActive: data?.isActive ?? true,
          createdAt: data?.createdAt ?? Timestamp.now(),
        },
        { merge: true },
      );

      // Sync Custom Claims (Critical for Firestore Rules)
      await adminAuth.setCustomUserClaims(uid, {
        role,
        admin: role === "admin" && isActive,
        isActive,
      });
    } else {
      // Create new
      await userRef.set({
        uid,
        email,
        displayName: name || null,
        photoURL: picture || null,
        role,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastSyncedAt: Timestamp.now(),
        isActive: true, // robust default
      });

      // Sync Custom Claims
      await adminAuth.setCustomUserClaims(uid, {
        role,
        admin: role === "admin",
        isActive: true,
      });
    }

    return {
      success: true,
      user: {
        uid,
        email,
        displayName: name || null,
        photoURL: picture || null,
        role,
      },
    };
  } catch (error: any) {
    console.error("ensureUserProfileAction Error:", error);
    return { success: false, error: error.message };
  }
}

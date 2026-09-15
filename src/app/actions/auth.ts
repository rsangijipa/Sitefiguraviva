"use server";

import { cookies } from "next/headers";
import { verifySession, type ServerAuthContext } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { isAdminEmail } from "@/lib/auth/authService";
import {
  getSupabaseSessionClaims,
  readTokenExpirySeconds,
} from "@/lib/auth/supabase-session";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string;
}

export async function ensureUserProfileAction(providedToken?: string): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    let session: ServerAuthContext | null = await verifySession();

    if (!session && providedToken) {
      const claims = await getSupabaseSessionClaims(providedToken);
      if (claims) {
        session = {
          uid: claims.uid,
          email: claims.email,
          role: claims.role,
          isAdmin: claims.admin,
          isStaff: claims.admin || claims.tutor,
          isActive: claims.isActive,
        };

        try {
          const maxAge = readTokenExpirySeconds(providedToken) ?? 60 * 60;
          const cookieStore = await cookies();
          cookieStore.set("session", providedToken, {
            maxAge,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
          });
        } catch (cookieErr) {
          console.warn(
            "[ensureUserProfileAction] Could not set session cookie:",
            cookieErr,
          );
        }
      }
    }

    if (!session) {
      return { success: false, error: "Unauthenticated" };
    }

    const { uid, email, role = "student" } = session;

    if (!email) return { success: false, error: "No email provided" };

    const isAdmin = isAdminEmail(email);
    const supabase = createSupabaseServiceClient();

    // Fetch or create profile in Supabase PostgreSQL
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    let finalRole = isAdmin ? "admin" : profile?.role || role;
    let displayName: string | null = null;
    let photoURL: string | null = null;

    if (profile) {
      displayName = profile.display_name || null;
      photoURL = profile.photo_url || null;

      await supabase
        .from("profiles")
        .update({
          ...(isAdmin && profile.role !== "admin" ? { role: "admin" } : {}),
          last_login_at: new Date().toISOString(),
        })
        .eq("id", uid);
    } else {
      await supabase.from("profiles").upsert({
        id: uid,
        email,
        role: isAdmin ? "admin" : "student",
        is_active: true,
        last_login_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      user: {
        uid,
        email,
        displayName,
        photoURL,
        role: finalRole,
      },
    };
  } catch (error: any) {
    console.error("ensureUserProfileAction Error:", error);
    return { success: false, error: error.message };
  }
}

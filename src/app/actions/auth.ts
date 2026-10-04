"use server";

import { cookies } from "next/headers";
import { verifySession, type ServerAuthContext } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { ensureUserDoc } from "@/lib/auth/user-service";
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
    const supabase = createSupabaseServiceClient();
    let session: ServerAuthContext | null = null;

    // A newly signed-in account takes precedence over any previous cookie.
    // Bootstrap missing OAuth profiles only from an Auth-verified identity.
    if (providedToken) {
      const { data, error } = await supabase.auth.getUser(providedToken);
      if (error || !data.user) {
        return { success: false, error: "Unauthenticated" };
      }
      const ensured = await ensureUserDoc({
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.full_name,
        picture: data.user.user_metadata?.avatar_url,
      });
      if (!ensured.success) {
        return { success: false, error: "Profile unavailable" };
      }
      const claims = await getSupabaseSessionClaims(providedToken);
      if (claims?.isActive) {
        session = {
          uid: claims.uid,
          email: claims.email,
          role: claims.role,
          isAdmin: claims.admin,
          isStaff: claims.admin || claims.tutor,
          isActive: claims.isActive,
        };
      }
    } else {
      session = await verifySession();
    }

    if (!session || !session.isActive) {
      return { success: false, error: "Unauthenticated" };
    }

    const { uid, email } = session;

    if (!email) return { success: false, error: "No email provided" };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (profileError || !profile || profile.is_active !== true) {
      return { success: false, error: "Profile unavailable" };
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", uid);
    if (updateError) return { success: false, error: "Profile unavailable" };

    if (providedToken) {
      const cookieStore = await cookies();
      cookieStore.set("session", providedToken, {
        maxAge: readTokenExpirySeconds(providedToken) ?? 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }

    return {
      success: true,
      user: {
        uid,
        email,
        displayName: profile.display_name || null,
        photoURL: profile.photo_url || null,
        role: profile.role,
      },
    };
  } catch (error: any) {
    console.error("ensureUserProfileAction Error:", error);
    return { success: false, error: "Profile unavailable" };
  }
}

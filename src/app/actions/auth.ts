"use server";

import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

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
    const session = await verifySession();

    if (!session) {
      return { success: false, error: "Unauthenticated" };
    }

    const { uid, email, role = "student" } = session;

    if (!email) return { success: false, error: "No email provided" };

    const supabase = createSupabaseServiceClient();

    // Fetch or create profile in Supabase PostgreSQL
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    let finalRole = role;
    let displayName: string | null = null;
    let photoURL: string | null = null;

    if (profile) {
      finalRole = profile.role || role;
      displayName = profile.display_name || null;
      photoURL = profile.photo_url || null;

      await supabase
        .from("profiles")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("id", uid);
    } else {
      await supabase.from("profiles").upsert({
        id: uid,
        email,
        role: "student",
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

"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export interface UserAuthContextInput {
  uid: string;
  email?: string;
  displayName?: string | null;
  display_name?: string | null;
  picture?: string | null;
  photoURL?: string | null;
}

/**
 * Idempotent operation to ensure a profile document exists in Supabase PostgreSQL.
 */
export async function ensureUserDoc(decodedToken: UserAuthContextInput) {
  const uid = decodedToken.uid;
  const email = decodedToken.email || "";
  const displayName =
    decodedToken.displayName ||
    decodedToken.display_name ||
    email.split("@")[0] ||
    "Usuário";
  const photoUrl = decodedToken.picture || decodedToken.photoURL || null;

  try {
    const supabase = createSupabaseServiceClient();

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", uid)
      .maybeSingle();

    if (!existingProfile) {
      console.log(`[ensureUserDoc] Creating new user profile for ${uid}`);
      await supabase.from("profiles").upsert({
        id: uid,
        email,
        display_name: displayName,
        photo_url: photoUrl,
        role: "student",
        is_active: true,
        last_login_at: new Date().toISOString(),
      });
    } else {
      await supabase
        .from("profiles")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("id", uid);
    }
    return { success: true };
  } catch (error) {
    console.error("[ensureUserDoc] Error:", error);
    return { success: false, error };
  }
}

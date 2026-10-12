import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export interface UserAuthContextInput {
  uid: string;
  email?: string;
  displayName?: string | null;
  display_name?: string | null;
  picture?: string | null;
  photoURL?: string | null;
  /** Provedor verificado pelo Auth (app_metadata.provider), nunca vindo do cliente. */
  provider?: string | null;
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

    const { data: existingProfile, error: lookupError } = await supabase
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", uid)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!existingProfile && decodedToken.provider === "email") {
      // Conta de e-mail e senha sem perfil: o Auth permite cadastro direto, sem
      // passar pela solicitação do site. Nunca nasce ativa; entra na fila de
      // aprovação como qualquer outro cadastro e só vira aluno após a revisão.
      const { error } = await supabase.from("profiles").upsert(
        {
          id: uid,
          email,
          display_name: displayName,
          role: "student",
          is_active: false,
          registration_status: "pending",
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (error) throw error;
      return { success: false, error: "Registration pending approval" };
    }

    if (!existingProfile) {
      console.log(`[ensureUserDoc] Creating new user profile for ${uid}`);
      const { error } = await supabase.from("profiles").upsert(
        {
          id: uid,
          email,
          display_name: displayName,
          photo_url: photoUrl,
          role: "student",
          is_active: true,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (error) throw error;
    } else {
      if (existingProfile.is_active !== true) {
        return { success: false, error: "Account disabled" };
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("id", uid);
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error("[ensureUserDoc] Error:", error);
    return { success: false, error };
  }
}

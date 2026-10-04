import "server-only";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getAuthEmailRedirect } from "@/lib/auth/email-flow";
import { z } from "zod";

/** Invitations prove address ownership; existing profiles are never reactivated or demoted here. */
export async function findOrCreateSupabaseUserByEmail(
  email: string,
  displayName?: string,
): Promise<{ uid: string; isNewUser: boolean }> {
  const normalizedEmail = z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(254)
    .parse(email);
  const supabase = createSupabaseServiceClient();
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id,is_active")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (lookupError) throw new Error("Não foi possível consultar a conta.");
  if (existing) {
    if (!existing.is_active) throw new Error("A conta está desativada.");
    return { uid: existing.id, isNewUser: false };
  }
  const redirectTo = getAuthEmailRedirect("recovery");
  const { data: created, error } = await supabase.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo,
      data: {
        full_name: displayName?.slice(0, 200),
        created_by: "admin_manual_enrollment",
      },
    },
  );
  if (error || !created?.user)
    throw new Error(
      "Não foi possível enviar o convite de primeiro acesso. Confira o serviço de e-mail.",
    );
  const { error: writeError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: created.user.id,
        email: normalizedEmail,
        display_name:
          displayName?.slice(0, 200) || normalizedEmail.split("@")[0],
        role: "student",
        is_active: true,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (writeError)
    throw new Error(
      "Convite solicitado, mas o perfil não pôde ser preparado. Verifique a conta antes de repetir.",
    );
  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("id,is_active")
    .eq("id", created.user.id)
    .maybeSingle();
  if (readError || !profile?.is_active)
    throw new Error(
      "O perfil convidado não está disponível. Verifique a conta antes de repetir.",
    );
  return { uid: profile.id, isNewUser: true };
}

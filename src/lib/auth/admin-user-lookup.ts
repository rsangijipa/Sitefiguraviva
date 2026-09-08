import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

/**
 * Finds a Supabase Auth user by email, or creates a placeholder one.
 * Shared by every admin flow that manually enrolls a student by email
 * (course-level "Nova Matrícula"/"Matrícula em Lote" and the "Interessados"
 * lead-conversion action) — accounts are created exclusively through
 * Supabase Auth now, so this is the one place that logic should live.
 */
export async function findOrCreateSupabaseUserByEmail(
  email: string,
  displayName?: string,
): Promise<{ uid: string; isNewUser: boolean }> {
  const supabase = createSupabaseServiceClient();
  const normalizedEmail = email.toLowerCase().trim();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return { uid: existingProfile.id, isNewUser: false };
  }

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: false,
      user_metadata: {
        full_name: displayName,
        created_by: "admin_manual_enrollment",
      },
    });

  if (createError || !created?.user) {
    throw new Error(createError?.message || "Falha ao criar usuário");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: created.user.id,
    email: normalizedEmail,
    display_name: displayName || normalizedEmail.split("@")[0],
    role: "student",
    is_active: true,
  });
  if (profileError) throw profileError;

  return { uid: created.user.id, isNewUser: true };
}

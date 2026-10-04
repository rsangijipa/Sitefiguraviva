"use server";
import { headers } from "next/headers";
import { z } from "zod";
import {
  getClientIdentifier,
  rateLimit,
  RateLimitPresets,
} from "@/lib/rateLimit";
import { createSupabaseAuthServerClient } from "@/infrastructure/supabase/server";
import { getAuthEmailRedirect } from "@/lib/auth/email-flow";
export async function requestPasswordResetAction(
  email: unknown,
): Promise<{ success: boolean; error?: string }> {
  const parsed = z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email()
    .safeParse(email);
  if (!parsed.success)
    return { success: false, error: "Informe um e-mail válido." };
  try {
    const ip = getClientIdentifier({ headers: await headers() });
    const ipLimit = await rateLimit(
      ip,
      "password_reset_ip",
      RateLimitPresets.PASSWORD_RESET,
    );
    if (!ipLimit.allowed)
      return {
        success: false,
        error: "Aguarde alguns minutos antes de solicitar outro link.",
      };
    const emailLimit = await rateLimit(
      parsed.data,
      "password_reset_email",
      RateLimitPresets.PASSWORD_RESET,
    );
    // Target throttling returns the same result regardless of account existence.
    if (!emailLimit.allowed) return { success: true };
    const { error } =
      await createSupabaseAuthServerClient().auth.resetPasswordForEmail(
        parsed.data,
        { redirectTo: getAuthEmailRedirect("recovery") },
      );
    if (error)
      return {
        success: false,
        error: "Não foi possível enviar o link. Aguarde e tente novamente.",
      };
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "Recuperação temporariamente indisponível. Tente novamente em alguns instantes.",
    };
  }
}

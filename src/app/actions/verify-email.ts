"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createSupabaseAuthServerClient } from "@/infrastructure/supabase/server";
import { getClientIdentifier, rateLimit } from "@/lib/rateLimit";
import type { EmailOtpType } from "@supabase/supabase-js";

const verifySchema = z.object({
  token_hash: z.string().trim().min(6, "Token inválido.").max(256),
  type: z.enum(["email", "signup", "invite", "recovery", "email_change"]).default("email"),
});

export interface VerifyEmailResult {
  success: boolean;
  emailConfirmed?: boolean;
  error?: string;
}

/**
 * Validates the email confirmation token hash with Supabase Auth.
 * Invoked via explicit user action (e.g. button click) to prevent pre-consumption
 * by anti-spam and security link scanners.
 * Runs on the server with request-local public auth client: does not leak sessions or set cookies.
 */
export async function verifyEmailOtpAction(
  tokenHash: string,
  type: string = "email",
): Promise<VerifyEmailResult> {
  const parsed = verifySchema.safeParse({ token_hash: tokenHash, type });
  if (!parsed.success) {
    return {
      success: false,
      error: "Código ou token de verificação inválido.",
    };
  }

  try {
    const identifier = getClientIdentifier({ headers: await headers() });
    const limit = await rateLimit(identifier, "verify-email", {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return {
        success: false,
        error: "Muitas tentativas de verificação. Aguarde alguns minutos e tente novamente.",
      };
    }

    const authClient = createSupabaseAuthServerClient();
    const otpType: EmailOtpType = parsed.data.type as EmailOtpType;

    const { data, error } = await authClient.auth.verifyOtp({
      token_hash: parsed.data.token_hash,
      type: otpType,
    });

    if (error || !data.user) {
      // If error with "email", retry with "signup" (and vice versa) for template compatibility
      const fallbackType: EmailOtpType = otpType === "email" ? "signup" : "email";
      const fallback = await authClient.auth.verifyOtp({
        token_hash: parsed.data.token_hash,
        type: fallbackType,
      });

      if (!fallback.error && fallback.data.user) {
        return {
          success: true,
          emailConfirmed: true,
        };
      }

      return {
        success: false,
        error:
          "Link de verificação inválido ou expirado. Se o link expirou, solicite um novo e-mail de confirmação.",
      };
    }

    return {
      success: true,
      emailConfirmed: true,
    };
  } catch (error) {
    console.error("verifyEmailOtpAction error:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao verificar seu e-mail. Tente novamente.",
    };
  }
}

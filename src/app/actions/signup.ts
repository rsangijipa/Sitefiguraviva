"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  createSupabaseAuthServerClient,
  createSupabaseServiceClient,
} from "@/infrastructure/supabase/server";
import { getAuthEmailRedirect } from "@/lib/auth/email-flow";
import {
  getClientIdentifier,
  rateLimit,
  RateLimitPresets,
} from "@/lib/rateLimit";

/**
 * Account creation is bound to enrollment: an account only exists because
 * someone is signing up for a course. Runs server-side so the request is rate
 * limited, the course is verified, and the name/phone the visitor typed are
 * actually persisted.
 */

const signupSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo.").max(200),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone com DDD.")
    .max(20, "Telefone inválido."),
  email: z.string().trim().toLowerCase().max(254).email("E-mail inválido."),
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .max(256),
  courseId: z
    .string()
    .trim()
    .min(1, "Selecione o curso que deseja cursar.")
    .max(200),
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Flat shape rather than a discriminated union: the project compiles with
 * `strict: false`, so `success: true | false` unions do not narrow at call
 * sites. This also matches the convention used by the other server actions.
 */
export interface SignupResult {
  success: boolean;
  courseId?: string;
  email?: string;
  requiresAdminApproval?: boolean;
  requiresEmailVerification?: boolean;
  error?: string;
}

export async function registerForCourseAction(
  input: SignupInput,
): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const { fullName, phone, email, password, courseId } = parsed.data;

  try {
    const identifier = getClientIdentifier({ headers: await headers() });
    const limit = await rateLimit(
      identifier,
      "signup",
      RateLimitPresets.SIGNUP_ATTEMPT,
    );

    if (!limit.allowed) {
      const waitMinutes = Math.max(
        1,
        Math.ceil((limit.resetAt - Date.now()) / 60000),
      );
      return {
        success: false,
        error: `Muitas tentativas de cadastro. Tente novamente em ${waitMinutes} min.`,
      };
    }

    const emailLimit = await rateLimit(
      email,
      "signup-destination",
      RateLimitPresets.SIGNUP_ATTEMPT,
    );
    if (!emailLimit.allowed)
      return {
        success: false,
        error: "Aguarde antes de solicitar outro cadastro para este e-mail.",
      };

    const serviceClient = createSupabaseServiceClient();

    // The course gate: no open course, no account.
    const { data: course, error: courseError } = await serviceClient
      .from("courses")
      .select("id, is_published, status")
      .eq("id", courseId)
      .maybeSingle();

    if (
      courseError ||
      !course ||
      course.is_published !== true ||
      course.status !== "open"
    ) {
      return {
        success: false,
        error: "Curso indisponível para inscrição. Escolha outro curso.",
      };
    }

    // Call official signUp using request-local public auth client
    const authClient = createSupabaseAuthServerClient();
    const emailRedirectTo = getAuthEmailRedirect("verify", courseId);

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          course_interest: courseId,
        },
        emailRedirectTo,
      },
    });

    if (error) {
      return {
        success: false,
        error:
          "Não foi possível solicitar o cadastro. Se já tem uma conta, entre com seus dados de acesso.",
      };
    }
    if (!data.user) {
      return {
        success: false,
        error: "Não foi possível concluir o cadastro. Tente novamente.",
      };
    }

    // Supabase returns identities: [] when user already exists (enumeration protection)
    if (data.user.identities && data.user.identities.length === 0) {
      return {
        success: false,
        error:
          "Não foi possível solicitar o cadastro. Se já tem uma conta, entre com seus dados de acesso.",
      };
    }

    const { error: profileError } = await serviceClient.from("profiles").insert({
      id: data.user.id,
      email,
      display_name: fullName,
      phone_number: phone,
      role: "student",
      is_active: false,
      registration_status: "pending",
    });
    if (profileError) {
      const { error: deleteError } = await serviceClient.auth.admin.deleteUser(
        data.user.id,
      );
      if (deleteError) {
        await serviceClient.auth.admin.updateUserById(data.user.id, {
          ban_duration: "876000h",
        });
      }
      throw new Error("Não foi possível registrar a solicitação.");
    }

    return {
      success: true,
      courseId,
      email,
      requiresAdminApproval: true,
      requiresEmailVerification: true,
    };
  } catch (error: any) {
    console.error("registerForCourseAction failed:", error);
    return {
      success: false,
      error: "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }
}

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("E-mail inválido."),
});

export interface ResendConfirmationResult {
  success: boolean;
  message: string;
}

export async function resendConfirmationEmailAction(
  emailInput: string,
): Promise<ResendConfirmationResult> {
  const parsed = resendSchema.safeParse({ email: emailInput });
  if (!parsed.success) {
    return {
      success: false,
      message: "Informe um endereço de e-mail válido.",
    };
  }

  const { email } = parsed.data;

  try {
    const identifier = getClientIdentifier({ headers: await headers() });
    const ipLimit = await rateLimit(
      identifier,
      "resend-email-ip",
      { maxRequests: 5, windowMs: 15 * 60 * 1000 },
    );
    if (!ipLimit.allowed) {
      const waitMinutes = Math.max(
        1,
        Math.ceil((ipLimit.resetAt - Date.now()) / 60000),
      );
      return {
        success: false,
        message: `Muitas tentativas de reenvio. Aguarde ${waitMinutes} min para tentar novamente.`,
      };
    }

    const emailLimit = await rateLimit(
      email,
      "resend-email-dest",
      { maxRequests: 3, windowMs: 15 * 60 * 1000 },
    );
    if (!emailLimit.allowed) {
      return {
        success: false,
        message:
          "Aguarde alguns minutos antes de solicitar um novo reenvio para este e-mail.",
      };
    }

    const serviceClient = createSupabaseServiceClient();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("id, is_active, registration_status")
      .eq("email", email)
      .maybeSingle();

    if (profile?.registration_status === "rejected") {
      return {
        success: true,
        message:
          "Se o e-mail estiver cadastrado e pendente de confirmação, enviamos uma nova mensagem.",
      };
    }

    if (profile?.is_active === true) {
      return {
        success: false,
        message: "Este e-mail já foi confirmado e ativado. Você já pode fazer login.",
      };
    }

    const authClient = createSupabaseAuthServerClient();
    const emailRedirectTo = getAuthEmailRedirect("verify");

    await authClient.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo,
      },
    });

    return {
      success: true,
      message:
        "Se o e-mail estiver cadastrado e pendente de confirmação, enviamos uma nova mensagem. Verifique também a pasta de spam.",
    };
  } catch (error) {
    console.error("resendConfirmationEmailAction error:", error);
    return {
      success: true,
      message:
        "Se o e-mail estiver cadastrado e pendente de confirmação, enviamos uma nova mensagem.",
    };
  }
}

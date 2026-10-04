"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  createSupabaseServiceClient,
  createSupabaseAuthServerClient,
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
  requiresEmailConfirmation?: boolean;
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

    const supabase = createSupabaseServiceClient();

    // The course gate: no open course, no account.
    const { data: course, error: courseError } = await supabase
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

    const auth = createSupabaseAuthServerClient();
    const { data, error } = await auth.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthEmailRedirect("confirm", courseId),
        data: { full_name: fullName, phone, course_interest: courseId },
      },
    });

    if (error) {
      return {
        success: false,
        error:
          "Não foi possível enviar a confirmação. Tente novamente ou entre com uma conta existente.",
      };
    }

    // With confirmation enabled, Auth returns no session. Do not bootstrap
    // profiles from this response: an existing email can return an obfuscated user.
    if (data.session) {
      await auth.auth.signOut();
      return {
        success: false,
        error:
          "Cadastro temporariamente indisponível. Entre em contato com o Instituto.",
      };
    }

    return { success: true, courseId, requiresEmailConfirmation: true };
  } catch (error: any) {
    console.error("registerForCourseAction failed:", error);
    return {
      success: false,
      error: "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }
}

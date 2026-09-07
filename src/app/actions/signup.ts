"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
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
  fullName: z.string().trim().min(3, "Informe seu nome completo."),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone com DDD.")
    .max(20, "Telefone inválido."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
  courseId: z.string().trim().min(1, "Selecione o curso que deseja cursar."),
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
  error?: string;
}

function isEmailTakenError(error: any): boolean {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "email_exists" ||
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("already exists")
  );
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
    const { data: course } = await supabase
      .from("courses")
      .select("id, is_published")
      .eq("id", courseId)
      .maybeSingle();

    if (!course || course.is_published !== true) {
      return {
        success: false,
        error: "Curso indisponível para inscrição. Escolha outro curso.",
      };
    }

    // Confirmed on creation so the visitor can be signed in immediately and
    // continue into the enrollment flow; access to paid content is still
    // gated by an approved enrollment, not by having an account.
    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
          course_interest: courseId,
        },
      });

    if (createError || !created?.user) {
      if (isEmailTakenError(createError)) {
        return {
          success: false,
          error: "Este e-mail já possui cadastro. Faça login para continuar.",
        };
      }

      console.error("registerForCourseAction createUser failed:", createError);
      return {
        success: false,
        error: "Não foi possível concluir o cadastro. Tente novamente.",
      };
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: created.user.id,
      email,
      display_name: fullName,
      role: "student",
      is_active: true,
    });

    if (profileError) {
      console.error(
        "registerForCourseAction profile upsert failed:",
        profileError,
      );
    }

    return { success: true, courseId };
  } catch (error: any) {
    console.error("registerForCourseAction failed:", error);
    return {
      success: false,
      error: "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }
}

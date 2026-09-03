"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import {
  getClientIdentifier,
  rateLimit,
  RateLimitPresets,
} from "@/lib/rateLimit";

/**
 * Account creation is bound to enrollment: an account only exists because
 * someone is signing up for a course. This replaces the previous client-side
 * `createUserWithEmailAndPassword` call, which had no rate limiting, no
 * server-side validation, and silently discarded the name and phone the
 * visitor had just typed.
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

    // The course gate: no open course, no account.
    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const course = courseSnap.exists ? courseSnap.data() : null;

    if (!course || course.isPublished !== true) {
      return {
        success: false,
        error: "Curso indisponível para inscrição. Escolha outro curso.",
      };
    }

    const user = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    await adminAuth.setCustomUserClaims(user.uid, {
      role: "student",
      admin: false,
      isActive: true,
    });

    await adminDb.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        email,
        displayName: fullName,
        phone,
        role: "student",
        isActive: true,
        courseInterest: courseId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    return { success: true, courseId };
  } catch (error: any) {
    if (error?.code === "auth/email-already-exists") {
      return {
        success: false,
        error: "Este e-mail já possui cadastro. Faça login para continuar.",
      };
    }

    if (error?.code === "auth/invalid-password") {
      return { success: false, error: "Senha inválida ou muito fraca." };
    }

    console.error("registerForCourseAction failed:", error);
    return {
      success: false,
      error: "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }
}

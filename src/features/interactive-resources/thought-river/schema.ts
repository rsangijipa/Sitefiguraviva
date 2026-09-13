import { z } from "zod";
import {
  MAX_RIVER_ACTIVE_DURATION_SECONDS,
  MAX_RIVER_REFLECTION_LENGTH,
  RIVER_TIMED_DURATIONS,
  type RiverSessionInput,
} from "./types";

const optionalReflection = z
  .string()
  .trim()
  .max(
    MAX_RIVER_REFLECTION_LENGTH,
    `Máximo de ${MAX_RIVER_REFLECTION_LENGTH} caracteres.`,
  )
  .nullable()
  .optional()
  .transform((value) => value || null);

export const riverSessionSchema = z
  .object({
    mode: z.enum(["timed", "free"]),
    plannedDurationSeconds: z.union([
      z.literal(120),
      z.literal(180),
      z.literal(300),
      z.null(),
    ]),
    activeDurationSeconds: z
      .number()
      .int("A duração deve ser um número inteiro de segundos.")
      .min(0, "A duração não pode ser negativa.")
      .max(
        MAX_RIVER_ACTIVE_DURATION_SECONDS,
        "A duração excede o limite permitido.",
      ),
    reflection: optionalReflection,
    clientRequestId: z.string().uuid("Identificador de solicitação inválido."),
    contentVersion: z.string().trim().min(1).max(80).optional().default("v1"),
  })
  .superRefine((value, ctx) => {
    if (
      value.mode === "timed" &&
      !RIVER_TIMED_DURATIONS.includes(
        value.plannedDurationSeconds as 120 | 180 | 300,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["plannedDurationSeconds"],
        message: "Escolha 2, 3 ou 5 minutos para o modo com tempo.",
      });
    }
    if (value.mode === "free" && value.plannedDurationSeconds !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["plannedDurationSeconds"],
        message: "O modo livre não possui duração planejada.",
      });
    }
  });

export function validateRiverSession(input: unknown):
  | {
      success: true;
      data: RiverSessionInput & {
        reflection: string | null;
        contentVersion: string;
      };
    }
  | { success: false; error: string } {
  const parsed = riverSessionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }
  return {
    success: true,
    data: {
      mode: parsed.data.mode,
      plannedDurationSeconds: parsed.data.plannedDurationSeconds ?? null,
      activeDurationSeconds: parsed.data.activeDurationSeconds,
      reflection: parsed.data.reflection ?? null,
      clientRequestId: parsed.data.clientRequestId,
      contentVersion: parsed.data.contentVersion,
    },
  };
}

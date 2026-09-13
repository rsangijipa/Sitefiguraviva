import { z } from "zod";
import {
  MAX_THOUGHT_LENGTH,
  MIN_THOUGHT_LENGTH,
  MAX_TITLE_LENGTH,
} from "./types";

export const thoughtSchema = z.object({
  thoughtText: z
    .string()
    .trim()
    .min(MIN_THOUGHT_LENGTH, "Escreva pelo menos uma letra.")
    .max(MAX_THOUGHT_LENGTH, `Máximo de ${MAX_THOUGHT_LENGTH} caracteres.`),
  optionalTitle: z
    .string()
    .trim()
    .max(MAX_TITLE_LENGTH, `Máximo de ${MAX_TITLE_LENGTH} caracteres.`)
    .optional()
    .or(z.literal("")),
});

export type ThoughtInput = z.infer<typeof thoughtSchema>;

export function validateThought(raw: string): {
  success: boolean;
  text?: string;
  error?: string;
} {
  const trimmed = raw.trim();
  const result = thoughtSchema.safeParse({ thoughtText: trimmed });
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message };
  }
  return { success: true, text: result.data.thoughtText };
}

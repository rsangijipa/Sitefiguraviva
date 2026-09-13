import type { ListeningSessionInput } from "./types";

export function validateListeningSession(
  input: ListeningSessionInput,
): string | null {
  if (input.mode !== "text")
    return "validation_error: somente o modo textual pode ser salvo nesta fase.";
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds < 0)
    return "validation_error: duração inválida.";
  if (input.observations.length > 10)
    return "validation_error: máximo de 10 observações.";
  if (input.reflection && input.reflection.length > 500)
    return "validation_error: reflexão deve ter no máximo 500 caracteres.";
  if (
    input.observations.some(
      (item) =>
        item.qualities.length > 5 || (item.customQuality?.length ?? 0) > 120,
    )
  )
    return "validation_error: características inválidas.";
  return null;
}

import { ValidatedInstrument } from "../../types";

/**
 * Validar se um instrumento foi configurado corretamente
 * Executado em desenvolvimento
 */

export const validateInstrumentDefinition = (
  instrument: ValidatedInstrument,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Verificar campos obrigatórios
  if (!instrument.id) errors.push("Campo 'id' obrigatório");
  if (!instrument.name) errors.push("Campo 'name' obrigatório");
  if (!instrument.publicTitle) errors.push("Campo 'publicTitle' obrigatório");
  if (!instrument.questions || instrument.questions.length === 0) {
    errors.push("Instrumento deve ter pelo menos uma questão");
  }

  // Verificar se modo validado tem itens oficiais
  if (instrument.mode === "validated") {
    const hasOfficialTexts = instrument.questions.every((q) => q.officialText);
    if (!hasOfficialTexts) {
      errors.push("Modo 'validated' requer 'officialText' em todos os itens");
    }
  }

  // Verificar duplicatas de ID
  const ids = instrument.questions.map((q) => q.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push("IDs de questão duplicados");
  }

  // Verificar ordem
  if (instrument.questions.some((q) => q.order == null)) {
    errors.push("Todas as questões devem ter 'order' definida");
  }

  // Verificar regras de interpretação
  if (!instrument.interpretation || instrument.interpretation.length === 0) {
    errors.push("Instrumento deve ter regras de interpretação");
  }

  // Verificar se há uma regra "fallback" (sem condição específica)
  const hasFallback = instrument.interpretation.some((r) =>
    r.condition(Number.MAX_SAFE_INTEGER),
  );
  if (!hasFallback) {
    errors.push("Deve haver uma regra de interpretação fallback");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Executar validação em desenvolvimento
 */
export const validateAllInstruments = (
  instruments: ValidatedInstrument[],
): void => {
  if (process.env.NODE_ENV !== "development") return;

  instruments.forEach((instrument) => {
    const validation = validateInstrumentDefinition(instrument);
    if (!validation.valid) {
      console.error(
        `❌ Instrumento ${instrument.id} configurado incorretamente:`,
      );
      validation.errors.forEach((error) => console.error(`  - ${error}`));
      throw new Error(`Instrumento inválido: ${instrument.id}`);
    } else {
      console.log(`✅ Instrumento ${instrument.id} validado`);
    }
  });
};

/**
 * Validação de dados e sanitização para o Jardim de Pensamentos
 * Garante segurança, ausência de fórmulas em CSV e respeito aos limites editoriais.
 */

export const THOUGHT_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 500,
  MAX_TITLE_LENGTH: 80,
  MAX_VISUAL_DESKTOP: 8,
  MAX_VISUAL_MOBILE: 3,
  MAX_SESSION_LEAVES: 20,
};

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

/**
 * Valida o texto da folha
 * - 1 a 500 caracteres após trim
 * - Quebras de linha preservadas
 * - Não truncado ao salvar
 */
export function validateThoughtText(rawText: string): ValidationResult<string> {
  if (typeof rawText !== 'string') {
    return { isValid: false, error: 'O texto deve ser uma sequência de caracteres válida.' };
  }

  const trimmed = rawText.trim();

  if (trimmed.length < THOUGHT_LIMITS.MIN_LENGTH) {
    return { isValid: false, error: 'Por favor, escreva pelo menos uma palavra para colocar a folha no jardim.' };
  }

  if (trimmed.length > THOUGHT_LIMITS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `O texto ultrapassou o limite de ${THOUGHT_LIMITS.MAX_LENGTH} caracteres (atual: ${trimmed.length}).`,
    };
  }

  return { isValid: true, data: trimmed };
}

/**
 * Valida título opcional (≤ 80 caracteres)
 */
export function validateOptionalTitle(rawTitle?: string | null): ValidationResult<string | null> {
  if (!rawTitle || rawTitle.trim().length === 0) {
    return { isValid: true, data: null };
  }

  const trimmed = rawTitle.trim();
  if (trimmed.length > THOUGHT_LIMITS.MAX_TITLE_LENGTH) {
    return {
      isValid: false,
      error: `O título não pode exceder ${THOUGHT_LIMITS.MAX_TITLE_LENGTH} caracteres (atual: ${trimmed.length}).`,
    };
  }

  return { isValid: true, data: trimmed };
}

/**
 * Neutraliza células para exportação em CSV contra fórmula maliciosa
 * Se o valor iniciar com '=', '+', '-', '@', prefixa com apóstrofo simples (')
 */
export function sanitizeCsvCell(cell: string | number | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  
  // Verifica caracteres que disparam execução de fórmulas no Excel / LibreOffice
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  let sanitized = str;
  if (dangerousPrefixes.some((prefix) => sanitized.startsWith(prefix))) {
    sanitized = `'${sanitized}`;
  }

  // Escapa aspas duplas internas
  return `"${sanitized.replace(/"/g, '""')}"`;
}

/**
 * Exporta registros persistidos em formato CSV seguro
 */
export function exportThoughtsToCsv(records: Array<{
  id: string;
  created_at: string;
  optional_title: string | null;
  text: string;
}>): string {
  const headers = ['Data e Hora', 'Título (se houver)', 'Pensamento'];
  const rows = records.map((record) => {
    const formattedDate = new Date(record.created_at).toLocaleString('pt-BR');
    return [
      sanitizeCsvCell(formattedDate),
      sanitizeCsvCell(record.optional_title || ''),
      sanitizeCsvCell(record.text),
    ].join(';');
  });

  return [headers.map(sanitizeCsvCell).join(';'), ...rows].join('\r\n');
}

/**
 * Exporta registros em formato Texto Simples (.txt)
 */
export function exportThoughtsToTxt(records: Array<{
  created_at: string;
  optional_title: string | null;
  text: string;
}>): string {
  let output = 'INSTITUTO FIGURA VIVA — JARDIM DE PENSAMENTOS\n';
  output += 'Histórico Privado de Registros Pessoais\n';
  output += `Exportado em: ${new Date().toLocaleString('pt-BR')}\n`;
  output += '===================================================\n\n';

  if (records.length === 0) {
    output += 'Nenhum pensamento guardado no histórico.\n';
    return output;
  }

  records.forEach((rec, idx) => {
    output += `[#${idx + 1}] — ${new Date(rec.created_at).toLocaleString('pt-BR')}\n`;
    if (rec.optional_title) {
      output += `Título: ${rec.optional_title}\n`;
    }
    output += `Pensamento:\n${rec.text}\n`;
    output += '---------------------------------------------------\n\n';
  });

  return output;
}

/**
 * Exporta registros em JSON seguro e identado
 */
export function exportThoughtsToJson(records: unknown[]): string {
  return JSON.stringify(records, null, 2);
}

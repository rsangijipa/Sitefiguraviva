/**
 * Helpers genéricos para cálculo de scores
 * Seguem princípios científicos rigorosos
 */

export const ScoringHelpers = {
  /**
   * Soma simples de valores
   */
  sum: (values: number[]): number => {
    return values.reduce((acc, val) => acc + (val || 0), 0);
  },

  /**
   * Média aritmética
   * Valida quantidade mínima de respostas
   */
  mean: (values: number[], minItems?: number): number | null => {
    if (minItems && values.filter((v) => v != null).length < minItems) {
      return null;
    }
    const validValues = values.filter((v) => v != null);
    if (validValues.length === 0) return null;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
  },

  /**
   * Normalizar score em escala 0-100
   * Fórmula: ((score - min) / (max - min)) * 100
   */
  normalize: (score: number, min: number, max: number): number => {
    if (max === min) return 0;
    const normalized = ((score - min) / (max - min)) * 100;
    return Math.round(normalized);
  },

  /**
   * Aplicar reverse scoring
   * Para itens onde respostas altas significam pontuação baixa
   */
  reverse: (value: number, scale: number): number => {
    return scale - value;
  },

  /**
   * Extrair valores de respostas por IDs de questão
   */
  extractValues: (
    responses: Record<string, any>,
    questionIds: string[],
  ): number[] => {
    return questionIds.map((id) => responses[id]).filter((v) => v != null);
  },

  /**
   * Contar respostas válidas
   */
  countAnswered: (responses: Record<string, any>): number => {
    return Object.values(responses).filter((v) => v != null).length;
  },

  /**
   * Converter string de resposta em número
   */
  parseResponse: (response: any): number | null => {
    if (typeof response === "number") return response;
    if (typeof response === "string") {
      const num = parseInt(response, 10);
      return isNaN(num) ? null : num;
    }
    return null;
  },
};

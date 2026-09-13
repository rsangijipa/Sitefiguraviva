import { QuizResult } from "../types";

const STORAGE_KEY = "mentequiz_results";
const MAX_RESULTS = 50;

// ─────────────────────────────────────────────────────────────────
// Tipos públicos
// ─────────────────────────────────────────────────────────────────

export type SaveResultOutcome =
  | { ok: true }
  | {
      ok: false;
      reason: "quota_exceeded" | "parse_error" | "unknown";
      message: string;
    };

export interface StorageUsage {
  /** Bytes usados pela chave mentequiz_results */
  usedBytes: number;
  /** Número de resultados armazenados */
  count: number;
  /** Percentual estimado da quota do browser (0–1). null se API indisponível. */
  quotaRatio: number | null;
}

// ─────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────

/**
 * Testa se consegue gravar `extraBytes` adicionais no localStorage.
 * Usa uma chave temporária para não corromper dados reais.
 */
function canFitBytes(extraBytes: number): boolean {
  const testKey = `__mq_quota_test_${Date.now()}`;
  try {
    localStorage.setItem(testKey, "x".repeat(extraBytes));
    localStorage.removeItem(testKey);
    return true;
  } catch {
    try {
      localStorage.removeItem(testKey);
    } catch {
      /* noop */
    }
    return false;
  }
}

/**
 * Remove os `count` resultados mais antigos.
 * Retorna o novo array (já persistido).
 */
function evictOldest(results: QuizResult[], count: number): QuizResult[] {
  const sorted = [...results].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const kept = sorted.slice(count);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
  } catch {
    // Se ainda não couber, limpa tudo (último recurso)
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
  return kept;
}

// ─────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────

export const saveResult = (result: QuizResult): SaveResultOutcome => {
  try {
    const existing = getResults();

    // Montar o array atualizado respeitando o limite de MAX_RESULTS
    const updated = [...existing, result].slice(-MAX_RESULTS);
    const payload = JSON.stringify(updated);
    const payloadBytes = new Blob([payload]).size;

    // 1ª tentativa: cabe directo?
    if (canFitBytes(payloadBytes)) {
      localStorage.setItem(STORAGE_KEY, payload);
      return { ok: true };
    }

    // 2ª tentativa: liberar espaço eviccionando 20% dos mais antigos
    const toEvict = Math.max(1, Math.ceil(existing.length * 0.2));
    evictOldest(existing, toEvict);

    // Recalcular sem os eviccionados
    const afterEviction = getResults();
    const updatedAfter = [...afterEviction, result].slice(-MAX_RESULTS);
    const payloadAfter = JSON.stringify(updatedAfter);
    const bytesAfter = new Blob([payloadAfter]).size;

    if (canFitBytes(bytesAfter)) {
      localStorage.setItem(STORAGE_KEY, payloadAfter);
      return { ok: true };
    }

    // 3ª tentativa: salvar só este resultado (limpa tudo)
    const minimal = JSON.stringify([result]);
    try {
      localStorage.setItem(STORAGE_KEY, minimal);
      return { ok: true };
    } catch {
      return {
        ok: false,
        reason: "quota_exceeded",
        message:
          "Espaço insuficiente no navegador. Resultado não salvo. Considere limpar o histórico.",
      };
    }
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    return {
      ok: false,
      reason: isQuota ? "quota_exceeded" : "unknown",
      message:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao salvar resultado.",
    };
  }
};

export const getResults = (): QuizResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as QuizResult[]) : [];
  } catch (error) {
    console.error("Erro ao recuperar resultados:", error);
    return [];
  }
};

export const getResultsByQuestionnaire = (
  questionnaireId: string,
): QuizResult[] =>
  getResults().filter((r) => r.questionnaireId === questionnaireId);

export const clearResults = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar resultados:", error);
  }
};

export const deleteResult = (resultId: string): void => {
  try {
    const results = getResults().filter((r) => r.id !== resultId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error("Erro ao deletar resultado:", error);
  }
};

export const exportResults = (): string =>
  JSON.stringify(getResults(), null, 2);

/**
 * Retorna métricas de uso do storage.
 * quotaRatio usa a Storage Estimate API quando disponível; caso contrário null.
 */
export const getStorageUsage = async (): Promise<StorageUsage> => {
  const raw = localStorage.getItem(STORAGE_KEY) ?? "[]";
  const usedBytes = new Blob([raw]).size;
  const count = getResults().length;

  let quotaRatio: number | null = null;
  try {
    if (navigator.storage?.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      if (usage != null && quota != null && quota > 0) {
        quotaRatio = usage / quota;
      }
    }
  } catch {
    // API não disponível — deixa null
  }

  return { usedBytes, count, quotaRatio };
};

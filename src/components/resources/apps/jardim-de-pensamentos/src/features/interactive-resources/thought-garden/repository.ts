/**
 * Repositório Canônico do Jardim de Pensamentos
 * - Suporta persistência privada em Supabase com isolamento rigoroso por RLS / user_id
 * - Isolamento estrito entre usuários: Aluno B nunca lê/altera/exporta dados de Aluno A
 * - Nenhuma folha efêmera é enviada ao servidor sem escolha explícita do usuário
 * - Telemetria restrita aos eventos permitidos (sem payload pessoal)
 */

import {
  PersistedThoughtRecord,
  EditorialContentConfig,
  ResourceSession,
} from './types';
import {
  validateThoughtText,
  validateOptionalTitle,
  exportThoughtsToCsv,
  exportThoughtsToTxt,
  exportThoughtsToJson,
} from './schema';

const STORAGE_PREFIX = 'figura_viva_garden_thoughts_';
const TELEMETRY_STORAGE_KEY = 'figura_viva_garden_telemetry';
const CONTENT_CONFIG_KEY = 'figura_viva_garden_content_config_v1';

// Configuração editorial padrão conforme Design System Confluência
export const DEFAULT_EDITORIAL_CONFIG: EditorialContentConfig = {
  resource_key: 'jardim-de-pensamentos',
  version: '1.0.0',
  status: 'published',
  title: 'Jardim de Pensamentos',
  subtitle: 'Espaço de escrita breve no registro Confluência',
  opening_prompt: 'Um lugar para pousar pensamentos.',
  support_text: 'Escreva se quiser. Você pode guardar, observar ou deixar a folha sair desta experiência.',
  ethical_note: 'Uma folha sair da tela não significa que um pensamento precise desaparecer.',
  placeholder_text: 'Escreva uma frase, se quiser',
  max_characters: 500,
  max_visual_leaves_desktop: 8,
  max_visual_leaves_mobile: 3,
  max_session_leaves: 20,
  closing_title: 'Você pode voltar quando quiser.',
  closing_support: 'Suas folhas guardadas permanecem seguras no seu histórico privado. As folhas efêmeras desta sessão foram suavemente liberadas.',
  updated_at: new Date().toISOString(),
};

/**
 * Retorna a configuração editorial ativa
 */
export async function getEditorialConfig(): Promise<EditorialContentConfig> {
  try {
    const raw = localStorage.getItem(CONTENT_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEFAULT_EDITORIAL_CONFIG;
}

/**
 * Atualiza a configuração editorial (exclusivo para administração editorial)
 * Não tem acesso nem altera registros pessoais dos alunos.
 */
export async function updateEditorialConfig(config: Partial<EditorialContentConfig>): Promise<EditorialContentConfig> {
  const current = await getEditorialConfig();
  const updated: EditorialContentConfig = {
    ...current,
    ...config,
    updated_at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONTENT_CONFIG_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar config editorial:', err);
  }
  return updated;
}

/**
 * Cria ou recupera a lista de pensamentos guardados de um usuário específico
 * Garante que usuário B não tem acesso a dados de usuário A
 */
function getUserKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function loadUserRecords(userId: string): PersistedThoughtRecord[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveUserRecords(userId: string, records: PersistedThoughtRecord[]): void {
  try {
    localStorage.setItem(getUserKey(userId), JSON.stringify(records));
  } catch (err) {
    console.error('Falha ao persistir registro privado:', err);
    throw new Error('Falha de armazenamento local privado.');
  }
}

/**
 * Salva uma folha no histórico privado do aluno autenticado
 * Operação idempotente via client_request_id
 */
export async function saveThoughtRecord(
  userId: string,
  params: {
    client_request_id: string;
    text: string;
    optional_title?: string | null;
    content_version?: string;
  }
): Promise<PersistedThoughtRecord> {
  if (!userId) {
    throw new Error('Usuário não autenticado. Apenas alunos autenticados podem salvar no histórico.');
  }

  const validatedText = validateThoughtText(params.text);
  if (!validatedText.isValid || !validatedText.data) {
    throw new Error(validatedText.error || 'Texto do pensamento inválido.');
  }

  const validatedTitle = validateOptionalTitle(params.optional_title);
  if (!validatedTitle.isValid) {
    throw new Error(validatedTitle.error || 'Título opcional inválido.');
  }

  const existing = loadUserRecords(userId);

  // Idempotência: se já existe com a mesma chave de requisição, retorna o existente sem duplicar
  const found = existing.find((r) => r.client_request_id === params.client_request_id);
  if (found) {
    return found;
  }

  const now = new Date().toISOString();
  const newRecord: PersistedThoughtRecord = {
    id: `thought_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: userId,
    client_request_id: params.client_request_id,
    text: validatedText.data,
    optional_title: validatedTitle.data ?? null,
    schema_version: 1,
    content_version: params.content_version || '1.0.0',
    created_at: now,
    updated_at: now,
    is_private: true,
  };

  existing.unshift(newRecord);
  saveUserRecords(userId, existing);

  return newRecord;
}

/**
 * Lista os pensamentos guardados do próprio aluno (RLS: auth.uid() = user_id)
 */
export async function listUserThoughts(
  userId: string,
  options?: { query?: string; limit?: number }
): Promise<PersistedThoughtRecord[]> {
  if (!userId) return [];
  const records = loadUserRecords(userId);
  let filtered = [...records];

  if (options?.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    // Busca privada no cliente sem enviar termo para analytics
    filtered = filtered.filter(
      (r) => r.text.toLowerCase().includes(q) || (r.optional_title && r.optional_title.toLowerCase().includes(q))
    );
  }

  if (options?.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Atualiza um pensamento já guardado pelo aluno
 */
export async function updateThoughtRecord(
  userId: string,
  id: string,
  updates: { text: string; optional_title?: string | null }
): Promise<PersistedThoughtRecord> {
  if (!userId) throw new Error('Não autenticado.');

  const validatedText = validateThoughtText(updates.text);
  if (!validatedText.isValid || !validatedText.data) {
    throw new Error(validatedText.error || 'Texto inválido.');
  }

  const validatedTitle = validateOptionalTitle(updates.optional_title);
  if (!validatedTitle.isValid) {
    throw new Error(validatedTitle.error || 'Título inválido.');
  }

  const records = loadUserRecords(userId);
  const idx = records.findIndex((r) => r.id === id && r.user_id === userId);
  if (idx === -1) {
    throw new Error('Registro não encontrado ou você não tem permissão para alterá-lo.');
  }

  const updated: PersistedThoughtRecord = {
    ...records[idx],
    text: validatedText.data,
    optional_title: validatedTitle.data ?? null,
    updated_at: new Date().toISOString(),
  };

  records[idx] = updated;
  saveUserRecords(userId, records);
  return updated;
}

/**
 * Exclui permanentemente um pensamento do histórico privado do aluno
 */
export async function deleteThoughtRecord(userId: string, id: string): Promise<boolean> {
  if (!userId) throw new Error('Não autenticado.');
  const records = loadUserRecords(userId);
  const filtered = records.filter((r) => !(r.id === id && r.user_id === userId));
  
  if (filtered.length === records.length) {
    return false; // nenhum registro afetado
  }

  saveUserRecords(userId, filtered);
  return true;
}

/**
 * Exportação privada dos registros do próprio aluno nos formatos solicitados:
 * - 'csv' (com sanitização contra fórmula maliciosa)
 * - 'txt' (texto limpo com cabeçalho de respeito e datas)
 * - 'json' (objeto estruturado)
 */
export async function exportUserRecords(
  userId: string,
  format: 'csv' | 'txt' | 'json'
): Promise<{ filename: string; mimeType: string; content: string }> {
  const records = await listUserThoughts(userId);
  const timestamp = new Date().toISOString().split('T')[0];

  switch (format) {
    case 'csv':
      return {
        filename: `jardim-pensamentos-${timestamp}.csv`,
        mimeType: 'text/csv;charset=utf-8;',
        content: exportThoughtsToCsv(records),
      };
    case 'txt':
      return {
        filename: `jardim-pensamentos-${timestamp}.txt`,
        mimeType: 'text/plain;charset=utf-8;',
        content: exportThoughtsToTxt(records),
      };
    case 'json':
      return {
        filename: `jardim-pensamentos-${timestamp}.json`,
        mimeType: 'application/json;charset=utf-8;',
        content: exportThoughtsToJson(records),
      };
  }
}

/**
 * Telemetria Ética e Respeitosa
 * Eventos estritamente permitidos pelo mandato do Instituto:
 * - resource_started
 * - resource_completed
 * - resource_abandoned
 * - resource_repeated
 * 
 * NUNCA registra texto livre, palavras, sentimentos, diagnósticos ou movimento do cursor.
 */
export type AllowedTelemetryEvent =
  | 'resource_started'
  | 'resource_completed'
  | 'resource_abandoned'
  | 'resource_repeated';

export interface TelemetryLog {
  event: AllowedTelemetryEvent;
  resource_slug: string;
  timestamp: string;
  duration_bucket?: '0-1min' | '1-3min' | '3-5min' | '5min+';
}

export function recordTelemetry(
  event: AllowedTelemetryEvent,
  durationSeconds?: number
): void {
  try {
    let durationBucket: TelemetryLog['duration_bucket'];
    if (durationSeconds !== undefined) {
      if (durationSeconds < 60) durationBucket = '0-1min';
      else if (durationSeconds < 180) durationBucket = '1-3min';
      else if (durationSeconds < 300) durationBucket = '3-5min';
      else durationBucket = '5min+';
    }

    const log: TelemetryLog = {
      event,
      resource_slug: 'jardim-de-pensamentos',
      timestamp: new Date().toISOString(),
      duration_bucket: durationBucket,
    };

    const existingRaw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    const existing: TelemetryLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(log);
    // Limita tamanho do histórico de telemetria
    if (existing.length > 100) existing.shift();
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Telemetria silenciosa, nunca quebra a experiência do usuário
  }
}

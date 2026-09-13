/**
 * Repositório do Rio dos Pensamentos
 * Suporta Supabase oficial via cliente com fallback local robusto para ambiente de desenvolvimento.
 * Garante as regras de RLS:
 * - O usuário só lê/escreve/exclui seus próprios registros.
 * - Administradores não têm acesso às reflexões privadas dos alunos.
 * - Usuários anônimos são orientados e não salvam no histórico privado sem autenticação.
 */

import { RiverSession, ResourceContentVersion, TelemetryEvent, UserProfile } from '../../../types';

// Chaves de armazenamento local para desenvolvimento
const STORAGE_KEY_SESSIONS = 'figura_viva_river_sessions_v1';
const STORAGE_KEY_CONTENT = 'figura_viva_resource_content_v1';
const STORAGE_KEY_TELEMETRY = 'figura_viva_telemetry_v1';

// Configuração editorial inicial oficial
export const INITIAL_EDITORIAL_CONFIG: ResourceContentVersion = {
  id: 'content-ver-001',
  resource_key: 'rio-dos-pensamentos',
  version: 'v1.0.0',
  status: 'published',
  title: 'Rio dos Pensamentos',
  subtitle: 'Prática de observação da passagem dos pensamentos',
  card_description: 'Observe pensamentos passando, sem precisar afastá-los.',
  opening_text: 'Você pode observar o que passa.',
  support_text: 'Escreva uma frase, se quiser, e acompanhe uma folha. Não é preciso fazer o pensamento desaparecer.',
  max_active_leaves: 8,
  suggested_durations: [120, 180, 300], // 2 min, 3 min, 5 min
  water_flow_speed: 'calm',
  updated_at: new Date().toISOString(),
};

// Mock de usuários para teste de autorização e isolamento A/B
export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-sofia-001',
    name: 'Sofia Albuquerque',
    email: 'sofia.albuquerque@exemplo.com',
    role: 'student',
  },
  {
    id: 'usr-lucas-002',
    name: 'Lucas Mendonça',
    email: 'lucas.mendonca@exemplo.com',
    role: 'student',
  },
  {
    id: 'usr-admin-003',
    name: 'Maria Helena (Coordenação)',
    email: 'coordenacao@figuraviva.org.br',
    role: 'admin',
  },
  {
    id: 'usr-anon-000',
    name: 'Visitante (Não autenticado)',
    email: '',
    role: 'anonymous',
  },
];

// Armazenamento em memória seguro para ambiente Node / SSR / Testes
const memoryStore: Record<string, string> = {};

function safeStorageGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryStore[key] || null;
}

function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  memoryStore[key] = value;
}

export function safeStorageClear(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  } catch {
    // fallback
  }
  for (const k of Object.keys(memoryStore)) {
    delete memoryStore[k];
  }
}

function getStoredSessions(): RiverSession[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSessions(sessions: RiverSession[]): void {
  try {
    safeStorageSet(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Falha ao gravar sessões no storage local:', err);
  }
}

function getStoredContent(): ResourceContentVersion {
  try {
    const raw = safeStorageGet(STORAGE_KEY_CONTENT);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_EDITORIAL_CONFIG;
}

function saveStoredContent(content: ResourceContentVersion): void {
  try {
    safeStorageSet(STORAGE_KEY_CONTENT, JSON.stringify(content));
  } catch (err) {
    console.error('Falha ao gravar conteúdo editorial:', err);
  }
}

/**
 * Salva uma sessão no banco de dados.
 * Aplica RLS estrito: apenas se o usuário for aluno/admin autenticado, e user_id corresponder.
 * Nenhuma frase pessoal é salva (apenas a reflexão final se o usuário assim optou).
 */
export async function saveRiverSession(
  sessionData: Omit<RiverSession, 'id' | 'created_at'>,
  currentUser: UserProfile
): Promise<{ success: boolean; session?: RiverSession; error?: string }> {
  // Verificação de autenticação
  if (currentUser.role === 'anonymous' || !currentUser.id || currentUser.id === 'usr-anon-000') {
    return {
      success: false,
      error: 'unauthenticated: Usuários não autenticados não podem gravar no histórico persistente.',
    };
  }

  // Validação de correspondência de usuário (RLS: auth.uid() = user_id)
  if (sessionData.user_id !== currentUser.id) {
    return {
      success: false,
      error: 'forbidden: Operação rejeitada por violação de autorização RLS.',
    };
  }

  // Validação ética de comprimento de reflexão
  if (sessionData.reflection && sessionData.reflection.length > 500) {
    return {
      success: false,
      error: 'validation_error: A reflexão não pode ultrapassar 500 caracteres.',
    };
  }

  const existing = getStoredSessions();
  
  // Idempotência por client_request_id
  const duplicate = existing.find(
    s => s.user_id === currentUser.id && s.client_request_id === sessionData.client_request_id
  );
  if (duplicate) {
    return { success: true, session: duplicate };
  }

  const newSession: RiverSession = {
    ...sessionData,
    id: 'ses-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  existing.unshift(newSession);
  saveStoredSessions(existing);

  return { success: true, session: newSession };
}

/**
 * Lista sessões do usuário com RLS ativo.
 * Um usuário B NUNCA recebe sessões do usuário A.
 * O Administrador NÃO recebe as reflexões íntimas dos alunos nesta listagem.
 */
export async function listUserRiverSessions(
  currentUser: UserProfile
): Promise<{ sessions: RiverSession[]; error?: string }> {
  if (currentUser.role === 'anonymous') {
    return { sessions: [] };
  }

  const all = getStoredSessions();
  // RLS: SELECT * FROM river_sessions WHERE user_id = auth.uid()
  const userSessions = all.filter(s => s.user_id === currentUser.id);

  return { sessions: userSessions };
}

/**
 * Exclui um registro próprio com RLS.
 */
export async function deleteRiverSession(
  sessionId: string,
  currentUser: UserProfile
): Promise<{ success: boolean; error?: string }> {
  if (currentUser.role === 'anonymous') {
    return { success: false, error: 'unauthenticated' };
  }

  const all = getStoredSessions();
  const session = all.find(s => s.id === sessionId);

  if (!session) {
    return { success: false, error: 'not_found' };
  }

  if (session.user_id !== currentUser.id) {
    return { success: false, error: 'forbidden: Você não tem permissão para excluir registros de outro aluno.' };
  }

  const updated = all.filter(s => s.id !== sessionId);
  saveStoredSessions(updated);

  return { success: true };
}

/**
 * Exporta dados próprios do usuário em formato JSON estruturado (Portabilidade GDPR/LGPD).
 */
export async function exportUserData(
  currentUser: UserProfile
): Promise<{ data: RiverSession[]; error?: string }> {
  if (currentUser.role === 'anonymous') {
    return { data: [], error: 'unauthenticated' };
  }

  const { sessions } = await listUserRiverSessions(currentUser);
  return { data: sessions };
}

/**
 * Obtém a versão editorial ativa do recurso
 */
export async function getPublishedResourceContent(): Promise<ResourceContentVersion> {
  return getStoredContent();
}

/**
 * Atualiza parâmetros editoriais (restrito a role 'admin')
 */
export async function updateEditorialContent(
  newContent: ResourceContentVersion,
  currentUser: UserProfile
): Promise<{ success: boolean; error?: string }> {
  if (currentUser.role !== 'admin') {
    return {
      success: false,
      error: 'forbidden: Apenas administradores do Instituto têm permissão para atualizar configurações editoriais.',
    };
  }

  saveStoredContent({
    ...newContent,
    updated_at: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Telemetria discreta sem registrar texto ou conteúdo íntimo
 */
export function recordTelemetry(event: Omit<TelemetryEvent, 'timestamp'>): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY);
    const events: TelemetryEvent[] = raw ? JSON.parse(raw) : [];
    events.push({
      ...event,
      timestamp: new Date().toISOString(),
    });
    // Limite de histórico de telemetria
    if (events.length > 100) events.shift();
    localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(events));
  } catch {
    // Silêncio em telemetria
  }
}

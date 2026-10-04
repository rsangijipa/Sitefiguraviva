/**
 * @license
 * Instituto Figura Viva - Cliente Supabase com Barramento Reativo e RLS em Ambiente Local/Web
 */

import {
  UserProfile,
  PauseSessionRecord,
  InteractiveResourceSession,
  InteractiveResourceEntry,
  ResourceContentVersion,
  TelemetryLog,
  TelemetryEventType
} from '../../types';

// Perfis pré-configurados para validação instantânea de isolamento A/B e RLS
export const DEMO_USERS: Record<string, UserProfile> = {
  sofia: {
    id: 'u-sofia-101',
    name: 'Sofia Mendes',
    email: 'sofia.mendes@aluno.figuraviva.org.br',
    role: 'student',
    avatarInitials: 'SM',
  },
  lucas: {
    id: 'u-lucas-202',
    name: 'Lucas Silveira',
    email: 'lucas.silveira@aluno.figuraviva.org.br',
    role: 'student',
    avatarInitials: 'LS',
  },
  admin: {
    id: 'u-helena-999',
    name: 'Dra. Helena Prado',
    email: 'helena.prado@admin.figuraviva.org.br',
    role: 'admin',
    avatarInitials: 'HP',
  },
  guest: {
    id: 'u-guest-000',
    name: 'Visitante (Não autenticado)',
    email: 'anonimo@sessao-local.temp',
    role: 'guest',
    avatarInitials: 'VI',
  },
};

type RealtimeCallback = (payload: { event: string; record: unknown }) => void;

class ReactiveSupabaseClient {
  private currentUser: UserProfile = DEMO_USERS.sofia;
  private subscribers: Map<string, Set<RealtimeCallback>> = new Map();
  private storageKeyPrefix = 'figura_viva_db_';

  constructor() {
    this.seedInitialDataIfEmpty();
  }

  // Troca de usuário para testar autorização A/B e permissões
  public setCurrentUser(userKey: keyof typeof DEMO_USERS) {
    this.currentUser = DEMO_USERS[userKey] || DEMO_USERS.guest;
    this.notify('auth_change', { event: 'USER_CHANGE', record: this.currentUser });
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  // Canal reativo em tempo real
  public subscribe(channel: string, callback: RealtimeCallback): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    return () => {
      const channelSubs = this.subscribers.get(channel);
      if (channelSubs) {
        channelSubs.delete(callback);
      }
    };
  }

  private notify(channel: string, payload: { event: string; record: unknown }) {
    const channelSubs = this.subscribers.get(channel);
    if (channelSubs) {
      channelSubs.forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error('Erro em subscriber reativo:', e);
        }
      });
    }
  }

  // --- PERSISTÊNCIA DA SALA DE PAUSA (pause_sessions) ---

  public async savePauseSession(session: Omit<PauseSessionRecord, 'id' | 'user_id' | 'created_at'>): Promise<{ data: PauseSessionRecord | null; error: string | null }> {
    if (this.currentUser.role === 'guest') {
      return { 
        data: null, 
        error: 'Sessão anônima: Faça login ou vincule sua conta para salvar no histórico permanente.' 
      };
    }

    const allSessions = this.getStoredList<PauseSessionRecord>('pause_sessions');
    
    // Idempotência por client_request_id e user_id
    const existing = allSessions.find(
      s => s.user_id === this.currentUser.id && s.client_request_id === session.client_request_id
    );
    if (existing) {
      return { data: existing, error: null };
    }

    const newRecord: PauseSessionRecord = {
      ...session,
      id: 'pause-' + Math.random().toString(36).substring(2, 9),
      user_id: this.currentUser.id,
      created_at: new Date().toISOString(),
    };

    allSessions.unshift(newRecord);
    this.setStoredList('pause_sessions', allSessions);

    // Também registra a sessão comum na tabela agregada
    await this.logInteractiveSession({
      resource_slug: 'sala-de-pausa',
      started_at: new Date(Date.now() - session.active_duration_seconds * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: session.active_duration_seconds,
      metadata: {
        practice_id: session.practice_id,
        planned_duration: session.planned_duration_seconds,
        ended_by: session.ended_by,
      }
    });

    // Notifica barramento reativo
    this.notify('pause_sessions', { event: 'INSERT', record: newRecord });

    return { data: newRecord, error: null };
  }

  public async getPauseSessionsForCurrentUser(): Promise<PauseSessionRecord[]> {
    if (this.currentUser.role === 'guest') return [];
    
    // RLS: O usuário só tem acesso aos seus próprios registros
    const allSessions = this.getStoredList<PauseSessionRecord>('pause_sessions');
    return allSessions
      .filter(s => s.user_id === this.currentUser.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async deletePauseSession(id: string): Promise<boolean> {
    const allSessions = this.getStoredList<PauseSessionRecord>('pause_sessions');
    // RLS: Só pode apagar se o registro for seu
    const updated = allSessions.filter(
      s => !(s.id === id && s.user_id === this.currentUser.id)
    );
    
    if (updated.length !== allSessions.length) {
      this.setStoredList('pause_sessions', updated);
      this.notify('pause_sessions', { event: 'DELETE', record: { id } });
      return true;
    }
    return false;
  }

  // --- SESSÕES E ENTRADAS DO RIO DOS PENSAMENTOS ---

  public async saveRiverReflection(reflection: {
    text: string;
    durationSeconds: number;
    thoughtsReleasedCount: number;
  }): Promise<{ data: InteractiveResourceEntry | null; error: string | null }> {
    if (this.currentUser.role === 'guest') {
      return { 
        data: null, 
        error: 'Sessão de visitante: os pensamentos foram acolhidos efemeramente nas águas.' 
      };
    }

    const sessionId = 'session-' + Math.random().toString(36).substring(2, 9);
    
    // Cria sessão genérica
    await this.logInteractiveSession({
      resource_slug: 'rio-dos-pensamentos',
      started_at: new Date(Date.now() - reflection.durationSeconds * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: reflection.durationSeconds,
      metadata: { thoughtsReleasedCount: reflection.thoughtsReleasedCount }
    });

    // Cria entrada privada voluntária
    const allEntries = this.getStoredList<InteractiveResourceEntry>('interactive_resource_entries');
    const newEntry: InteractiveResourceEntry = {
      id: 'entry-' + Math.random().toString(36).substring(2, 9),
      user_id: this.currentUser.id,
      resource_slug: 'rio-dos-pensamentos',
      session_id: sessionId,
      payload: {
        title: 'Observação no Rio dos Pensamentos',
        reflection: reflection.text,
        details: {
          thoughtsCount: reflection.thoughtsReleasedCount,
          duration: reflection.durationSeconds,
        }
      },
      is_private: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    allEntries.unshift(newEntry);
    this.setStoredList('interactive_resource_entries', allEntries);
    this.notify('interactive_entries', { event: 'INSERT', record: newEntry });

    return { data: newEntry, error: null };
  }

  public async getRiverEntriesForCurrentUser(): Promise<InteractiveResourceEntry[]> {
    if (this.currentUser.role === 'guest') return [];
    const allEntries = this.getStoredList<InteractiveResourceEntry>('interactive_resource_entries');
    return allEntries
      .filter(e => e.user_id === this.currentUser.id && e.resource_slug === 'rio-dos-pensamentos')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async deleteRiverEntry(id: string): Promise<boolean> {
    const allEntries = this.getStoredList<InteractiveResourceEntry>('interactive_resource_entries');
    const updated = allEntries.filter(
      e => !(e.id === id && e.user_id === this.currentUser.id)
    );
    if (updated.length !== allEntries.length) {
      this.setStoredList('interactive_resource_entries', updated);
      this.notify('interactive_entries', { event: 'DELETE', record: { id } });
      return true;
    }
    return false;
  }

  // --- SESSÕES AGREGADAS & TELEMETRIA NÃO INVASIVA ---

  public async logInteractiveSession(session: {
    resource_slug: 'sala-de-pausa' | 'rio-dos-pensamentos';
    started_at: string;
    completed_at: string | null;
    duration_seconds: number;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    const all = this.getStoredList<InteractiveResourceSession>('interactive_resource_sessions');
    const newSession: InteractiveResourceSession = {
      ...session,
      id: 'sess-' + Math.random().toString(36).substring(2, 9),
      user_id: this.currentUser.id,
      created_at: new Date().toISOString()
    };
    all.unshift(newSession);
    this.setStoredList('interactive_resource_sessions', all);
  }

  public logTelemetry(eventType: TelemetryEventType, resourceSlug: string, durationSeconds?: number) {
    // Registra apenas eventos macro sem invadir privacidade ou coletar movimentos detalhados
    const logs = this.getStoredList<TelemetryLog>('telemetry_logs');
    logs.unshift({
      id: 'tel-' + Math.random().toString(36).substring(2, 9),
      eventType,
      resourceSlug,
      timestamp: new Date().toISOString(),
      durationSeconds,
    });
    this.setStoredList('telemetry_logs', logs.slice(0, 100));
  }

  public getTelemetryLogs(): TelemetryLog[] {
    return this.getStoredList<TelemetryLog>('telemetry_logs');
  }

  // --- CONTEÚDO EDITORIAL (GESTÃO DE ROTEIROS PELO ADMIN) ---

  public getPublishedEditorialVersions(): ResourceContentVersion[] {
    return this.getStoredList<ResourceContentVersion>('resource_content_versions');
  }

  public updateEditorialVersion(updated: ResourceContentVersion): { success: boolean; error?: string } {
    if (this.currentUser.role !== 'admin') {
      return { success: false, error: 'Apenas administradores editoriais podem atualizar roteiros.' };
    }
    const all = this.getStoredList<ResourceContentVersion>('resource_content_versions');
    const index = all.findIndex(v => v.id === updated.id || v.resource_key === updated.resource_key);
    if (index >= 0) {
      all[index] = { ...updated, updated_at: new Date().toISOString() };
    } else {
      all.push(updated);
    }
    this.setStoredList('resource_content_versions', all);
    this.notify('editorial_content', { event: 'UPDATE', record: updated });
    return { success: true };
  }

  // --- EXPORTAÇÃO DE DADOS PESSOAIS ---

  public async exportUserData(): Promise<{
    user: UserProfile;
    pauseSessions: PauseSessionRecord[];
    riverEntries: InteractiveResourceEntry[];
    exportedAt: string;
  }> {
    const pauseSessions = await this.getPauseSessionsForCurrentUser();
    const riverEntries = await this.getRiverEntriesForCurrentUser();
    return {
      user: this.currentUser,
      pauseSessions,
      riverEntries,
      exportedAt: new Date().toISOString()
    };
  }

  // --- STORAGE HELPERS ---

  private getStoredList<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(this.storageKeyPrefix + key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredList<T>(key: string, items: T[]): void {
    try {
      localStorage.setItem(this.storageKeyPrefix + key, JSON.stringify(items));
    } catch (e) {
      console.warn('Falha no localStorage:', e);
    }
  }

  private seedInitialDataIfEmpty(): void {
    try {
      const existingPauses = this.getStoredList<PauseSessionRecord>('pause_sessions');
      if (existingPauses.length === 0) {
        const initialPauses: PauseSessionRecord[] = [
          {
            id: 'pause-init-01',
            user_id: 'u-sofia-101',
            client_request_id: 'req-01-sofia',
            practice_id: 'breathing',
            practice_title: 'Respirar',
            planned_duration_seconds: 180,
            active_duration_seconds: 180,
            ended_by: 'timer',
            reflection: 'Sensação de retorno ao corpo após um bloco de escrita. Respiração natural.',
            content_version: '1.0.0',
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 'pause-init-02',
            user_id: 'u-sofia-101',
            client_request_id: 'req-02-sofia',
            practice_id: 'slowing',
            practice_title: 'Desacelerar',
            planned_duration_seconds: 120,
            active_duration_seconds: 145,
            ended_by: 'user',
            reflection: 'Pausa breve antes do seminário. Boa sustentação dos pés.',
            content_version: '1.0.0',
            created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          },
          // Registro de outro aluno (Lucas Silveira) para validar isolamento de dados
          {
            id: 'pause-init-03-lucas',
            user_id: 'u-lucas-202',
            client_request_id: 'req-03-lucas',
            practice_id: 'observing',
            practice_title: 'Observar',
            planned_duration_seconds: 180,
            active_duration_seconds: 180,
            ended_by: 'timer',
            reflection: 'Percebi as cores da folha da calathea na janela.',
            content_version: '1.0.0',
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          }
        ];
        this.setStoredList('pause_sessions', initialPauses);
      }

      // Seed das versões editoriais
      const existingEditorial = this.getStoredList<ResourceContentVersion>('resource_content_versions');
      if (existingEditorial.length === 0) {
        const editorialVersions: ResourceContentVersion[] = [
          {
            id: 'ed-pause-01',
            resource_key: 'sala-de-pausa',
            version: '1.0.0',
            status: 'published',
            title: 'Sala de Pausa',
            subtitle: 'Hub de pausas opcionais de 2 a 5 minutos no seu ritmo.',
            reviewer: 'Comitê Editorial Confluência',
            configuration: {
              allowedDurations: [120, 180, 300],
              defaultDuration: 180,
              practicesCount: 5,
            },
            updated_at: new Date().toISOString()
          },
          {
            id: 'ed-river-01',
            resource_key: 'rio-dos-pensamentos',
            version: '1.0.0',
            status: 'published',
            title: 'Rio dos Pensamentos',
            subtitle: 'Observe o fluxo de pensamentos e sensações sem reter.',
            reviewer: 'Comitê Editorial Confluência',
            configuration: {
              speeds: ['still', 'serene', 'calm'],
              defaultSpeed: 'serene',
            },
            updated_at: new Date().toISOString()
          }
        ];
        this.setStoredList('resource_content_versions', editorialVersions);
      }
    } catch (e) {
      console.warn('Erro ao inicializar seed:', e);
    }
  }
}

export const supabaseClient = new ReactiveSupabaseClient();

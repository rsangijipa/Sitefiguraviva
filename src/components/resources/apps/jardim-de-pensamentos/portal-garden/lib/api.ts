import { UserEntry, UserProfile, UserSession } from '../types';

const localEntriesKey = 'figura-viva:jardim-de-pensamentos:entries';

function localEntries(): UserEntry[] {
  try {
    return JSON.parse(localStorage.getItem(localEntriesKey) || '[]');
  } catch {
    return [];
  }
}

function saveLocalEntries(entries: UserEntry[]) {
  try {
    localStorage.setItem(localEntriesKey, JSON.stringify(entries));
  } catch {
    // A prática continua disponível quando o armazenamento está indisponível.
  }
}

export const api = {
  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Falha ao autenticar');
    const data = await res.json();
    return data.user;
  },

  async startSession(resource_slug: string, metadata: Record<string, any> = {}): Promise<UserSession> {
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_slug, metadata }),
      });
      if (res.ok) return res.json();
    } catch {}
    const now = new Date().toISOString();
    return { id: crypto.randomUUID(), user_id: '', resource_slug, started_at: now, completed_at: null, duration_seconds: 0, metadata, created_at: now };
  },

  async finishSession(id: string, duration_seconds: number, metadata: Record<string, any> = {}): Promise<UserSession> {
    const res = await fetch('/api/sessions/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, duration_seconds, metadata }),
    });
    if (!res.ok) throw new Error('Falha ao finalizar sessão');
    return res.json();
  },

  async abandonSession(id: string, duration_seconds: number): Promise<UserSession> {
    const res = await fetch('/api/sessions/abandon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, duration_seconds }),
    });
    if (!res.ok) throw new Error('Falha ao registrar encerramento');
    return res.json();
  },

  async getSessionHistory(resource_slug?: string): Promise<UserSession[]> {
    const url = resource_slug ? `/api/sessions/history?resource_slug=${resource_slug}` : '/api/sessions/history';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar histórico');
    return res.json();
  },

  async getEntries(resource_slug?: string): Promise<UserEntry[]> {
    const url = resource_slug ? `/api/entries?resource_slug=${resource_slug}` : '/api/entries';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar anotações');
    return res.json();
  },

  async saveEntry(
    resource_slug: string,
    sessionId: string | null,
    payload: { text: string; action: string; botanical_form?: string; notes?: string },
    isPrivate = true
  ): Promise<UserEntry> {
    try {
      const res = await fetch('/api/entries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_slug, session_id: sessionId, payload, is_private: isPrivate }),
      });
      if (res.ok) return res.json();
    } catch {}
    const now = new Date().toISOString();
    const entry: UserEntry = { id: crypto.randomUUID(), user_id: '', resource_slug, session_id: sessionId, payload, is_private: isPrivate, created_at: now, updated_at: now };
    saveLocalEntries([entry, ...localEntries()]);
    return entry;
  },

  async deleteEntry(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/entries/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao remover item');
    return res.json();
  },

  async clearEntries(resource_slug: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/entries/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource_slug }),
    });
    if (!res.ok) throw new Error('Falha ao limpar');
    return res.json();
  },

  async logTelemetry(
    event: 'resource_started' | 'resource_completed' | 'resource_abandoned' | 'resource_repeated',
    resource_slug: string,
    duration_seconds?: number
  ): Promise<void> {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, resource_slug, duration_seconds }),
      });
    } catch {
      // Telemetria silenciosa para não quebrar fluxo do aluno
    }
  },

  async getTelemetryStats(): Promise<any> {
    const res = await fetch('/api/telemetry/stats');
    if (!res.ok) throw new Error('Falha ao buscar estatísticas');
    return res.json();
  },
};

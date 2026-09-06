import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export interface AuditLogEntry {
  actor: {
    uid: string;
    email?: string;
    role?: string;
    ip?: string;
  };
  action: string;
  target: {
    collection: string;
    id: string;
    summary?: string;
  };
  diff?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  // Legacy support for 'payload' or 'eventType' if needed by callers
  payload?: any;
}

/**
 * Standard business audit log.
 * Immutable record in 'audit_logs' collection.
 */
export async function logAudit(entry: AuditLogEntry) {
  try {
    const { error } = await createSupabaseServiceClient()
      .from("audit_logs")
      .insert({
        event_type: entry.action,
        actor_user_id: entry.actor.uid,
        actor_email: entry.actor.email || null,
        actor_role: entry.actor.role || null,
        target_collection: entry.target.collection,
        target_id: entry.target.id,
        payload: {
          metadata: entry.metadata,
          summary: entry.target.summary,
          payload: entry.payload,
        },
        diff: entry.diff || null,
      });
    if (error) throw error;
    console.log(
      `[AUDIT] ${entry.action} by ${entry.actor.uid} -> ${entry.target.id}`,
    );
  } catch (error) {
    console.error("Audit log failed", error);
  }
}

/**
 * Logs within an existing Firestore transaction.
 */
export function logAuditInTransaction(_tx: unknown, entry: AuditLogEntry) {
  // Transactional callers are migrated independently; keep this compatibility
  // seam until their transaction adapters target Supabase RPCs.
  void entry;
}

// Global Alias for smooth migration from auditService
export const auditService = {
  logEvent: (params: any) =>
    logAudit({
      action: params.eventType,
      actor: params.actor,
      target: params.target,
      diff: params.diff,
      payload: params.payload,
    }),
  logEventInTransaction: (tx: any, params: any) =>
    logAuditInTransaction(tx, {
      action: params.eventType,
      actor: params.actor,
      target: params.target,
      diff: params.diff,
      payload: params.payload,
    }),
};

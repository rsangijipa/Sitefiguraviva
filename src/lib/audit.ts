import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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
    await adminDb.collection("audit_logs").add({
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
      version: "1.2",
    });
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
export function logAuditInTransaction(
  tx: FirebaseFirestore.Transaction,
  entry: AuditLogEntry,
) {
  const ref = adminDb.collection("audit_logs").doc();
  tx.set(ref, {
    ...entry,
    timestamp: FieldValue.serverTimestamp(),
    version: "1.2",
  });
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

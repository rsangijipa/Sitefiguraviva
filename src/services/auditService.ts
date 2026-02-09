import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface AuditLogParams {
  eventType: string;
  actor: {
    uid: string;
    email?: string;
    role?: string;
  };
  target: {
    id: string;
    collection: string;
  };
  payload?: any;
  diff?: {
    before?: any;
    after?: any;
  };
}

/**
 * Service to log critical admin and system events.
 * Ensures an audit trail across the application.
 */
export const auditService = {
  /**
   * Logs an event to the 'audit_logs' collection.
   */
  async logEvent(params: AuditLogParams): Promise<string> {
    try {
      const logRef = adminDb.collection("audit_logs").doc();
      const logData = {
        ...params,
        timestamp: FieldValue.serverTimestamp(),
      };

      await logRef.set(logData);
      console.log(
        `[Audit] Event ${params.eventType} logged for target ${params.target.id}`,
      );
      return logRef.id;
    } catch (error) {
      console.error("[Audit] Failed to log event:", error);
      throw error;
    }
  },

  /**
   * Helper to log within a transaction.
   */
  logEventInTransaction(
    tx: FirebaseFirestore.Transaction,
    params: AuditLogParams,
  ) {
    const logRef = adminDb.collection("audit_logs").doc();
    tx.set(logRef, {
      ...params,
      timestamp: FieldValue.serverTimestamp(),
    });
  },
};

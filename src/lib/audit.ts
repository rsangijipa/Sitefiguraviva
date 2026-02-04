import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface AuditLogEntry {
    actor: {
        uid: string;
        email?: string;
        role?: string;
        ip?: string; // Optional, might be masked
    };
    action: string; // e.g., 'billing.subscription_created', 'auth.role_change'
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
}

/**
 * Registra um evento de negócio imutável na coleção audit_logs.
 * Não falha a execução principal se o log falhar (catch silencioso + console.error).
 */
export async function logAudit(entry: AuditLogEntry) {
    try {
        await adminDb.collection('audit_logs').add({
            ...entry,
            timestamp: FieldValue.serverTimestamp(),
            version: '1.0'
        });
        // Console log structured for observability tools
        console.log(`[AUDIT] ${entry.action} by ${entry.actor.uid}`, {
            target: entry.target.id,
            diffKeys: entry.diff ? Object.keys(entry.diff) : []
        });
    } catch (error) {
        console.error("FATAL: Failed to write audit log", error);
        // We do typically NOT throw here to avoid blocking the main transaction,
        // but for high-security environments, you might want to consider it.
    }
}

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function logSystemError(
    source: string,
    message: string,
    context: Record<string, any> = {},
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error'
) {
    try {
        await adminDb.collection('system_logs').add({
            source,
            message,
            context,
            severity,
            createdAt: FieldValue.serverTimestamp(),
            resolved: false
        });
        console.error(`[${source}] ${message}`, context);
    } catch (err) {
        // Fallback to console if Firestore fails
        console.error('FAILED TO LOG TO FIRESTORE:', err);
        console.error(`[${source}] ${message}`, context);
    }
}

"use server";

import { verifySession } from '@/lib/auth/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * Strict Guard for Content Authoring Actions.
 * Allows only 'admin' or 'tutor' roles.
 * 
 * Fails fast with a standardized error if unauthorized.
 */
export async function assertIsTutorOrAdmin() {
    const session = await verifySession();
    if (!session) {
        throw new Error('Unauthorized: Valid session required');
    }

    // 1. Claims Check (Fastest & Preferred)
    // We check both the top-level claims (if custom claims set) and the 'role' claim
    if (session.admin === true || session.role === 'admin' || session.role === 'tutor') {
        return session;
    }

    // 2. DB Fallback (Robustness for explicit role changes not yet in token)
    // This adds latency but ensures we don't block valid users if claims are stale
    try {
        const userDoc = await adminDb.collection('users').doc(session.uid).get();
        const role = userDoc.data()?.role;

        if (role === 'admin' || role === 'tutor' || role === 'administrador') {
            return session;
        }
    } catch (error) {
        console.error('Authoring Gate: DB check failed', error);
        // Fall through to throw
    }

    throw new Error('Forbidden: Insufficient permissions for authoring');
}

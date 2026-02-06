'use server';

import { auth, adminDb } from '@/lib/firebase/admin';
import { logAudit } from '@/lib/audit';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'session';
const IMPERSONATION_COOKIE_NAME = 'admin_session_backup';

export async function impersonateUser(targetUid: string) {
    const cookieStore = await cookies();
    const currentSession = cookieStore.get(COOKIE_NAME)?.value;

    if (!currentSession) {
        return { error: 'Unauthorized: No active session' };
    }

    try {
        // 1. Verify Requestor is Admin
        const claims = await auth.verifySessionCookie(currentSession, true);
        if (claims.role !== 'admin') {
            await logAudit({
                actor: { uid: claims.uid, role: String(claims.role || 'unknown') },
                action: 'auth.impersonate_attempt_denied',
                target: { collection: 'users', id: targetUid },
                metadata: { reason: 'not_admin' }
            });
            return { error: 'Forbidden: Admin access required' };
        }

        // 2. Fetch Target User
        const targetUser = await auth.getUser(targetUid);
        if (!targetUser) return { error: 'Target user not found' };

        // 3. Create Session Cookie for Target
        // 5 days duration
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const newSessionCookie = await auth.createSessionCookie(targetUid, { expiresIn });

        // 4. Log Audit (CRITICAL)
        await logAudit({
            actor: { uid: claims.uid, email: claims.email, role: 'admin' },
            action: 'auth.impersonate_start',
            target: { collection: 'users', id: targetUid, summary: targetUser.email },
            metadata: { original_admin_uid: claims.uid }
        });

        // 5. Swap Cookies
        // Backup admin session
        cookieStore.set(IMPERSONATION_COOKIE_NAME, currentSession, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        // Set new user session
        cookieStore.set(COOKIE_NAME, newSessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        return { success: true };
    } catch (error) {
        console.error('Impersonation failed:', error);
        return { error: 'Impersonation failed' };
    }
}

export async function stopImpersonation() {
    const cookieStore = await cookies();
    const backupSession = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;

    if (!backupSession) {
        // If lost, just logout completely
        cookieStore.delete(COOKIE_NAME);
        redirect('/login');
    }

    try {
        // Verify backup token is still valid
        const claims = await auth.verifySessionCookie(backupSession, true);

        // Log stop
        await logAudit({
            actor: { uid: claims.uid, role: 'admin' },
            action: 'auth.impersonate_stop',
            target: { collection: 'system', id: 'self' }
        });

        // Restore
        cookieStore.set(COOKIE_NAME, backupSession, {
            maxAge: 60 * 60 * 24 * 5, // reset window
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        cookieStore.delete(IMPERSONATION_COOKIE_NAME);

        return { success: true };
    } catch (e) {
        // Backup invalid
        cookieStore.delete(COOKIE_NAME);
        cookieStore.delete(IMPERSONATION_COOKIE_NAME);
        redirect('/login');
    }
}

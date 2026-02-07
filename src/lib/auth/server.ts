import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';

export async function verifySession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        console.error('Session verification failed:', error);
        return null;
    }
}

function isAdminRole(role: unknown) {
    const r = String(role || '').toLowerCase();
    return r === 'admin' || r === 'administrador';
}

function parseCsvEnv(name: string) {
    return (process.env[name] || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
}

export async function requireAdmin() {
    const claims: any = await verifySession();

    if (!claims) {
        redirect('/admin/login');
    }

    // 1) Fast path: Custom Claims
    if (claims.admin === true || isAdminRole(claims.role)) {
        return claims;
    }

    // 2) Fallback: Firestore user profile role
    try {
        const snap = await adminDb.collection('users').doc(claims.uid).get();
        const role = snap.exists ? snap.data()?.role : null;
        if (isAdminRole(role)) {
            return { ...claims, role: 'admin' };
        }
    } catch (error) {
        console.error('Admin role lookup failed:', error);
    }

    // 3) Bootstrap (optional): allow a known email to become admin automatically
    // Set ADMIN_BOOTSTRAP_EMAILS="you@domain.com,other@domain.com" in your env.
    const bootstrapEmails = parseCsvEnv('ADMIN_BOOTSTRAP_EMAILS');
    const email = String(claims.email || '').toLowerCase();

    if (email && bootstrapEmails.includes(email)) {
        try {
            // Ensure profile role
            await adminDb.collection('users').doc(claims.uid).set({
                role: 'admin',
                updatedAt: new Date(),
            }, { merge: true });

            // Merge custom claims safely
            const user = await adminAuth.getUser(claims.uid);
            const existing = user.customClaims || {};
            await adminAuth.setCustomUserClaims(claims.uid, {
                ...existing,
                admin: true,
                role: 'admin',
            });

            return { ...claims, admin: true, role: 'admin' };
        } catch (error) {
            console.error('Admin bootstrap failed:', error);
        }
    }

    redirect('/admin/login');
}

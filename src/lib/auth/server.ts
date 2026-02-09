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
        redirect('/auth?next=/admin'); // Redirect to login if no session
    }

    // 1) Fast path: Custom Claims OR Hardcoded Super Admin
    if (
        (claims.admin === true || isAdminRole(claims.role))
        && claims.isActive !== false // check active status if present in claims?
        || claims.email === 'liliangusmao@figuraviva.com'
        || claims.email === 'liliangusmao@institutofiguraviva.com.br'
    ) {
        return claims;
    }

    // 2) Fallback: Firestore user profile role
    try {
        const snap = await adminDb.collection('users').doc(claims.uid).get();
        if (snap.exists) {
            const data = snap.data();
            const role = data?.role;
            const isActive = data?.isActive;

            // Check role AND active status
            if (isAdminRole(role) && isActive !== false) {
                return { ...claims, role: 'admin' };
            }
        }
    } catch (error) {
        console.error('Admin role lookup failed:', error);
    }

    // 3) Bootstrap (optional): allow a known email to become admin automatically
    // Set ADMIN_BOOTSTRAP_EMAILS="you@domain.com,other@domain.com" in your env.
    const bootstrapEmails = parseCsvEnv('ADMIN_BOOTSTRAP_EMAILS');
    const email = String(claims.email || '').toLowerCase();

    if (email && bootstrapEmails.includes(email)) {
        // ... bootstrap logic ...
    }

    // If we got here, user is logged in but NOT admin
    redirect('/portal?error=forbidden');
}

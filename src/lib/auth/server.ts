import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
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

export async function requireAdmin() {
    const claims = await verifySession();

    if (!claims || !claims.admin) {
        redirect('/admin/login');
    }

    return claims;
}

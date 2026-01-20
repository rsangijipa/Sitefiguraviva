
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID Token' }, { status: 400 });
        }

        // Create session cookie (valid for 5 days)
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();

        cookieStore.set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error("Session creation error:", error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

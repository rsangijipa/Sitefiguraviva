import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
        const debugInfo = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            keyLength: privateKey.length,
            keyStart: privateKey.substring(0, 10),
            keyEnd: privateKey.substring(privateKey.length - 10),
            hasNewlines: privateKey.includes('\n'),
            hasEscapedNewlines: privateKey.includes('\\n'),
            hasCarriageReturns: privateKey.includes('\r'),
        };

        console.log('[API DEBUG] Env Info:', debugInfo);

        // Try usage
        const snap = await adminDb.collection('courses').limit(1).get();

        return NextResponse.json({
            success: true,
            docsFound: snap.size,
            envAnalysis: debugInfo
        });
    } catch (error: any) {
        console.error('[API DEBUG] Auth Failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
            envAnalysis: {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                keyLength: (process.env.FIREBASE_PRIVATE_KEY || '').length
            }
        }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getBearerSupabaseSessionClaims } from '@/lib/auth/supabase-session';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const claims = await getBearerSupabaseSessionClaims(req);
        if (!claims || !claims.isActive) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const uid = claims.uid;

        const body = await req.json().catch(() => ({}));
        const { courseId, answers, consent } = body;

        if (typeof courseId !== 'string' || !courseId.trim()) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        const normalizedCourseId = courseId.trim();
        const applicationId = `${uid}_${normalizedCourseId}`;
        const applicationRef = adminDb.collection('applications').doc(applicationId);

        await applicationRef.set({
            uid,
            courseId: normalizedCourseId,
            answers: answers && typeof answers === 'object' ? answers : {},
            consent: consent && typeof consent === 'object' ? consent : {},
            status: 'submitted',
            source: 'internal',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        return NextResponse.json({ success: true, applicationId });

    } catch (error: any) {
        console.error('Application submit error:', error);
        return NextResponse.json({ error: 'Unable to submit application' }, { status: 500 });
    }
}

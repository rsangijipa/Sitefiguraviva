import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const body = await req.json();
        const { courseId, answers, consent } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        const applicationId = `${uid}_${courseId}`;
        const applicationRef = adminDb.collection('applications').doc(applicationId);

        await applicationRef.set({
            uid,
            courseId,
            answers: answers || {},
            consent: consent || {},
            status: 'submitted',
            source: 'internal',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        return NextResponse.json({ success: true, applicationId });

    } catch (error: any) {
        console.error('Application submit error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

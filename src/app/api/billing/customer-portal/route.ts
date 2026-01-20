import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Find customer ID from user's enrollments
        // We look for any enrollment that has a customerId
        const enrollmentsSnapshot = await adminDb.collection('users').doc(uid).collection('enrollments')
            .where('stripe.customerId', '!=', null)
            .limit(1)
            .get();

        if (enrollmentsSnapshot.empty) {
            return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
        }

        const customerId = enrollmentsSnapshot.docs[0].data().stripe.customerId;

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/portal`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Customer Portal error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

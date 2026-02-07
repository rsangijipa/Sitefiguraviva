import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
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
        const email = decodedToken.email;

        const body = await req.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        // 1. Fetch Course details
        const courseDoc = await adminDb.collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const courseData: any = courseDoc.data();
        const isAvailable = courseData?.status === 'open' || courseData?.isPublished === true;
        if (!isAvailable) {
            return NextResponse.json({ error: 'Course is not available' }, { status: 400 });
        }

        const priceId = courseData.billing?.priceIdMonthly;
        if (!priceId) {
            return NextResponse.json({ error: 'Course billing is not configured' }, { status: 500 });
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email, // Pre-fill email
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // Redirect to internal enrollment flow success/cancel pages
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/inscricao/${courseId}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/inscricao/${courseId}/cancelado`,
            metadata: {
                uid: uid,
                courseId: courseId,
                applicationId: `${uid}_${courseId}`, // Link to application doc
            },
            subscription_data: {
                metadata: {
                    uid: uid,
                    courseId: courseId,
                    applicationId: `${uid}_${courseId}`,
                }
            }
        });

        // 3. Create Pending Enrollment (Idempotent key use ideally, but here simple set)
        const enrollmentId = `${uid}_${courseId}`;
        const enrollmentData = {
            uid,
            courseId,
            status: 'awaiting_payment',
            paymentStatus: 'pending',
            approvalStatus: 'pending_review',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            stripe: {
                checkoutSessionId: session.id,
            }
        };

        // Write to User's subcollection (Portal Access)
        await adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId).set(enrollmentData, { merge: true });

        // Write to Global Ledger
        await adminDb.collection('enrollments').doc(enrollmentId).set(enrollmentData, { merge: true });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Idempotency Check
    const eventRef = adminDb.collection('stripe_events').doc(event.id);
    const eventDoc = await eventRef.get();
    if (eventDoc.exists) {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const checkoutSession = session as Stripe.Checkout.Session;
                if (checkoutSession.mode === 'subscription') {
                    const uid = checkoutSession.metadata?.uid;
                    const courseId = checkoutSession.metadata?.courseId;
                    const applicationId = checkoutSession.metadata?.applicationId; // NEW
                    const subscriptionId = checkoutSession.subscription as string;
                    const customerId = checkoutSession.customer as string;

                    if (uid && courseId) {
                        // A. Update User with Customer ID (for Portal lookup)
                        await adminDb.collection('users').doc(uid).set({
                            'stripeCustomerId': customerId
                        }, { merge: true });

                        // B. Update Enrollments (Global + User)
                        const updateData = {
                            status: 'pending', // Wait for invoice.paid
                            'stripe.customerId': customerId,
                            'stripe.subscriptionId': subscriptionId,
                            applicationId: applicationId || null, // Link application
                            updatedAt: FieldValue.serverTimestamp(),
                        };
                        // Note: Global enrollment is now the Single Source of Truth
                        const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);
                        const globalEnrollmentRef = adminDb.collection('enrollments').doc(`${uid}_${courseId}`);

                        const batch = adminDb.batch();
                        batch.set(userEnrollmentRef, updateData, { merge: true });
                        batch.set(globalEnrollmentRef, updateData, { merge: true });
                        await batch.commit();
                    }
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = session as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                // We need to find the enrollment by subscriptionId since invoice might not have metadata
                // Query global enrollments
                const enrollmentQuery = await adminDb.collection('enrollments')
                    .where('stripe.subscriptionId', '==', subscriptionId)
                    .limit(1)
                    .get();

                if (!enrollmentQuery.empty) {
                    const enrollmentDoc = enrollmentQuery.docs[0];
                    const { uid, courseId } = enrollmentDoc.data();

                    const updateData = {
                        status: 'pending_approval', // Change: Wait for Admin Approval
                        paymentStatus: 'paid',      // NEW: Track payment separately
                        approvalStatus: 'pending_review', // NEW: Track approval separately
                        activatedAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                        'stripe.latestInvoiceId': invoice.id,
                        'stripe.latestInvoiceStatus': invoice.status,
                        'stripe.subscriptionStatus': 'active'
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);

                    batch.set(enrollmentDoc.ref, updateData, { merge: true });
                    batch.set(userEnrollmentRef, updateData, { merge: true });
                    await batch.commit();
                    console.log(`Payment confirmed (Pending Approval) for user ${uid}, course ${courseId}`);

                    // TODO: Trigger Welcome Email
                    // await sendEmail({ to: userEmail, template: 'welcome_course', data: { courseId } });
                } else {
                    console.warn(`No enrollment found for subscription ${subscriptionId}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = session as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                const enrollmentQuery = await adminDb.collection('enrollments')
                    .where('stripe.subscriptionId', '==', subscriptionId)
                    .limit(1)
                    .get();

                if (!enrollmentQuery.empty) {
                    const enrollmentDoc = enrollmentQuery.docs[0];
                    const { uid, courseId } = enrollmentDoc.data();

                    const updateData = {
                        status: 'past_due',
                        updatedAt: FieldValue.serverTimestamp(),
                        'stripe.latestInvoiceStatus': invoice.status,
                        'stripe.subscriptionStatus': 'past_due'
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);

                    batch.set(enrollmentDoc.ref, updateData, { merge: true });
                    batch.set(userEnrollmentRef, updateData, { merge: true });
                    await batch.commit();
                    console.log(`Payment failed for user ${uid}, course ${courseId}. status: past_due`);

                    // TODO: Trigger Payment Failed Email
                    // await sendEmail({ to: userEmail, template: 'payment_failed', data: { link: portalUrl } });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = session as Stripe.Subscription;
                const subscriptionId = subscription.id;

                const enrollmentQuery = await adminDb.collection('enrollments')
                    .where('stripe.subscriptionId', '==', subscriptionId)
                    .limit(1)
                    .get();

                if (!enrollmentQuery.empty) {
                    const enrollmentDoc = enrollmentQuery.docs[0];
                    const { uid, courseId } = enrollmentDoc.data();

                    const updateData = {
                        status: 'canceled',
                        updatedAt: FieldValue.serverTimestamp(),
                        endedAt: FieldValue.serverTimestamp(),
                        'stripe.subscriptionStatus': 'canceled'
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);

                    batch.update(enrollmentDoc.ref, updateData);
                    batch.update(userEnrollmentRef, updateData);
                    await batch.commit();
                    console.log(`Subscription canceled for user ${uid}, course ${courseId}`);

                    // TODO: Trigger Cancellation Email
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = session as Stripe.Subscription;
                const subscriptionId = subscription.id;
                const status = subscription.status; // active, past_due, unpaid, canceled, incomplete...

                const enrollmentQuery = await adminDb.collection('enrollments')
                    .where('stripe.subscriptionId', '==', subscriptionId)
                    .limit(1)
                    .get();

                if (!enrollmentQuery.empty) {
                    const enrollmentDoc = enrollmentQuery.docs[0];
                    const { uid, courseId } = enrollmentDoc.data();

                    // Map Stripe status to our Data Model status
                    let newStatus = 'pending';
                    if (status === 'active') newStatus = 'active';
                    if (status === 'past_due' || status === 'unpaid') newStatus = 'past_due';
                    if (status === 'canceled') newStatus = 'canceled';
                    if (status === 'incomplete' || status === 'incomplete_expired') newStatus = 'pending';

                    const updateData = {
                        status: newStatus,
                        updatedAt: FieldValue.serverTimestamp(),
                        'stripe.subscriptionStatus': status
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);

                    batch.update(enrollmentDoc.ref, updateData);
                    batch.update(userEnrollmentRef, updateData);
                    await batch.commit();
                }
                break;
            }
        }

        // Record processed event
        await eventRef.set({
            id: event.id,
            type: event.type,
            created: event.created,
            processedAt: FieldValue.serverTimestamp(),
            livemode: event.livemode
        });

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

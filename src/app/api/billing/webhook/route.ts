import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { computeAccessStatus, AccessStatus, PaymentStatus, StripeSubscriptionStatus } from '@/lib/enrollmentStatus';
import { logSystemError } from '@/lib/logging';
import { logAudit } from '@/lib/audit';

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
        const errorMsg = `Webhook signature verification failed: ${err.message}`;
        console.error(errorMsg);
        await logSystemError('webhook', errorMsg, { bodySnippet: body.substring(0, 200) });
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const eventId = event.id;
    const eventRef = adminDb.collection('stripe_events').doc(eventId);

    // -------------------------------------------------------------------------
    // 1. Idempotency & Locking (Processing / Done pattern)
    // -------------------------------------------------------------------------
    try {
        const eventDoc = await adminDb.runTransaction(async (t) => {
            const doc = await t.get(eventRef);
            if (!doc.exists) {
                t.set(eventRef, {
                    id: eventId,
                    type: event.type,
                    created: event.created,
                    status: 'processing',
                    processingStartedAt: FieldValue.serverTimestamp(),
                    livemode: event.livemode
                });
                return null; // Signals "We are first, proceed"
            }
            return doc.data(); // Signals "Already exists"
        });

        if (eventDoc) {
            // Event already exists
            if (eventDoc.status === 'done') {
                return NextResponse.json({ received: true, status: 'already_done' });
            }
            if (eventDoc.status === 'processing') {
                // Concurrency edge case: another request is handling it right now.
                // We return 200 to Stripe so it doesn't retry immediately and cause race conditions.
                return NextResponse.json({ received: true, status: 'processing_concurrently' });
            }
            // If status is 'error', we assume the transaction above didn't block us from retrying logic 
            // (actually for strictness we might want to allow retry only after X time, but simple is ok for now: let it flow through logic again if logic fixes it)
            // However, for safety in this robust plan, let's treat 'error' as allow-retry.
            // But valid flow above only writes if !exists. So if 'error' exists, we skipped the write but returned the doc.
            // We should allow retry.
        }
    } catch (err: any) {
        console.error("Idempotency lock error", err);
        return NextResponse.json({ error: 'Lock error' }, { status: 500 });
    }

    const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice;

    // -------------------------------------------------------------------------
    // 2. Logic Execution
    // -------------------------------------------------------------------------
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const checkoutSession = session as Stripe.Checkout.Session;
                if (checkoutSession.mode === 'subscription') {
                    const uid = checkoutSession.metadata?.uid;
                    const courseId = checkoutSession.metadata?.courseId;
                    const applicationId = checkoutSession.metadata?.applicationId;
                    const subscriptionId = checkoutSession.subscription as string;
                    const customerId = checkoutSession.customer as string;

                    if (uid && courseId) {
                        try {
                            // Link user to stripe customer
                            await adminDb.collection('users').doc(uid).set({
                                'stripeCustomerId': customerId
                            }, { merge: true });

                            // INITIAL ENROLLMENT STATE
                            // Paid via Checkout means Payment is implicitly confirmed or processing...
                            // BUT 'invoice.paid' is the real source of truth for "Paid".
                            // Status here: Payment=Pending (safe bet), Approval=PendingReview.

                            const updateData = {
                                uid,
                                courseId,
                                status: 'awaiting_payment', // Default start
                                paymentStatus: 'pending',
                                approvalStatus: 'pending_review',

                                'stripe.customerId': customerId,
                                'stripe.subscriptionId': subscriptionId,
                                'stripe.subscriptionStatus': 'active', // Assumed from session

                                applicationId: applicationId || null,
                                updatedAt: FieldValue.serverTimestamp(),
                                createdAt: FieldValue.serverTimestamp() // Only if new
                            };

                            const userEnrollmentRef = adminDb.collection('users').doc(uid).collection('enrollments').doc(courseId);
                            const globalEnrollmentRef = adminDb.collection('enrollments').doc(`${uid}_${courseId}`);

                            const batch = adminDb.batch();
                            batch.set(userEnrollmentRef, updateData, { merge: true });
                            batch.set(globalEnrollmentRef, updateData, { merge: true });
                            await batch.commit();
                        } catch (err: any) {
                            throw new Error(`Failed to process checkout for ${uid}/${courseId}: ${err.message}`);
                        }
                    }
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = session as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                const enrollmentQuery = await adminDb.collection('enrollments')
                    .where('stripe.subscriptionId', '==', subscriptionId)
                    .limit(1)
                    .get();

                if (!enrollmentQuery.empty) {
                    const enrollmentDoc = enrollmentQuery.docs[0];
                    const data = enrollmentDoc.data();

                    const currentApproval = data.approvalStatus || 'pending_review';
                    const currentStripeStatus = data['stripe.subscriptionStatus'] || 'active'; // Default active if missing on creation

                    // CORE LOGIC: invoice.paid sets paymentStatus = 'paid'.
                    const finalStatus = computeAccessStatus('paid', currentApproval, currentStripeStatus);

                    const updateData = {
                        status: finalStatus,
                        paymentStatus: 'paid', // Explicitly PAID
                        approvalStatus: currentApproval, // Preserves approval

                        'stripe.latestInvoiceId': invoice.id,
                        'stripe.latestInvoiceStatus': invoice.status,
                        // DO NOT set stripe.subscriptionStatus here blindly, wait for sub.updated event or keep existing?
                        // Usually safe to assume active if invoice paid, but let sub event handle status.

                        lastPaidAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(data.uid).collection('enrollments').doc(data.courseId);

                    batch.set(enrollmentDoc.ref, updateData, { merge: true });
                    batch.set(userEnrollmentRef, updateData, { merge: true });
                    await batch.commit();

                    await logAudit({
                        actor: { uid: 'system', role: 'webhook' },
                        action: 'billing.invoice_paid',
                        target: { collection: 'enrollments', id: enrollmentDoc.id, summary: `Invoice ${invoice.id} paid. Access Granted/Renewed.` },
                        metadata: { subscriptionId, invoiceId: invoice.id, amount: invoice.amount_paid },
                        diff: { after: updateData }
                    });
                } else {
                    console.warn(`No enrollment found for subscription ${subscriptionId}`);
                    await logSystemError('webhook', 'Missing enrollment for paid invoice', { subscriptionId, invoiceId: invoice.id }, 'warning');
                    // TODO: Add to "Reconciliation Queue"
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
                    const docSnap = enrollmentQuery.docs[0];
                    const data = docSnap.data();

                    const currentApproval = data.approvalStatus || 'pending_review';
                    const currentStripeStatus = data['stripe.subscriptionStatus'] || 'past_due';

                    // Force payment failed
                    const finalStatus = computeAccessStatus('failed', currentApproval, currentStripeStatus);

                    const updateData = {
                        status: finalStatus,
                        paymentStatus: 'failed',
                        'stripe.latestInvoiceStatus': invoice.status,
                        updatedAt: FieldValue.serverTimestamp(),
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(data.uid).collection('enrollments').doc(data.courseId);

                    batch.set(docSnap.ref, updateData, { merge: true });
                    batch.set(userEnrollmentRef, updateData, { merge: true });
                    await batch.commit();
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = session as Stripe.Subscription;
                const subscriptionId = subscription.id;
                const stripeStatus = subscription.status as StripeSubscriptionStatus;

                const enrollmentQuery = await adminDb.collection('enrollments')
                    .where('stripe.subscriptionId', '==', subscriptionId)
                    .limit(1)
                    .get();

                if (!enrollmentQuery.empty) {
                    const docSnap = enrollmentQuery.docs[0];
                    const data = docSnap.data();

                    const currentPayment = data.paymentStatus || 'pending';
                    const currentApproval = data.approvalStatus || 'pending_review';

                    // Update ONLY stripe status in our inputs
                    const finalStatus = computeAccessStatus(currentPayment, currentApproval, stripeStatus);

                    const updateData: Record<string, unknown> = {
                        status: finalStatus,
                        'stripe.subscriptionStatus': stripeStatus,
                        'stripe.currentPeriodEnd': typeof (subscription as any).current_period_end === 'number' ? new Date((subscription as any).current_period_end * 1000) : null,
                        updatedAt: FieldValue.serverTimestamp(),
                    };

                    if (stripeStatus === 'canceled') {
                        updateData.endedAt = FieldValue.serverTimestamp();
                    }

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(data.uid).collection('enrollments').doc(data.courseId);

                    batch.update(docSnap.ref, updateData);
                    batch.update(userEnrollmentRef, updateData);
                    await batch.commit();
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
                    const docSnap = enrollmentQuery.docs[0];
                    const data = docSnap.data();

                    const currentPayment = data.paymentStatus || 'pending';
                    const currentApproval = data.approvalStatus || 'pending_review';

                    // Subscription deleted -> canceled
                    const finalStatus = computeAccessStatus(currentPayment, currentApproval, 'canceled');

                    const updateData = {
                        status: finalStatus,
                        'stripe.subscriptionStatus': 'canceled',
                        endedAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                    };

                    const batch = adminDb.batch();
                    const userEnrollmentRef = adminDb.collection('users').doc(data.uid).collection('enrollments').doc(data.courseId);

                    batch.update(docSnap.ref, updateData);
                    batch.update(userEnrollmentRef, updateData);
                    await batch.commit();

                    await logAudit({
                        actor: { uid: 'system', role: 'webhook' },
                        action: 'billing.subscription_canceled',
                        target: { collection: 'enrollments', id: docSnap.id, summary: `Subscription ${subscriptionId} canceled. Access Revoked.` },
                        metadata: { subscriptionId },
                        diff: { after: updateData }
                    });
                }
                break;
            }
        }

        // -------------------------------------------------------------------------
        // 3. Mark as Done
        // -------------------------------------------------------------------------
        await eventRef.update({
            status: 'done',
            processedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ received: true });

    } catch (error: any) {
        const errorMsg = `Webhook handler failed: ${error.message}`;
        console.error(errorMsg);
        await logSystemError('webhook', errorMsg, { eventId: event.id, type: event.type }, 'critical');

        // Mark event as failed so we can audit or retry manualy
        await eventRef.update({
            failedAt: FieldValue.serverTimestamp(),
            error: error.message, // Warning: Firestore field size limit 
            status: 'error'
        });

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

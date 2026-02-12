import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";
import { EnrollmentDoc } from "@/types/lms";
import {
  computeAccessStatus,
  AccessStatus,
  PaymentStatus,
  StripeSubscriptionStatus,
} from "@/lib/enrollmentStatus";
import { activateEnrollmentFromStripe } from "@/lib/auth/enrollment-service";
import { logSystemError } from "@/lib/logging";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    const errorMsg = `Webhook signature verification failed: ${err.message}`;
    console.error(errorMsg);
    await logSystemError("webhook", errorMsg, {
      bodySnippet: body.substring(0, 200),
    });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const eventId = event.id;
  const eventRef = adminDb.collection("stripe_events").doc(eventId);

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
          status: "processing",
          processingStartedAt: FieldValue.serverTimestamp(),
          livemode: event.livemode,
        });
        return null; // Signals "We are first, proceed"
      }
      return doc.data(); // Signals "Already exists"
    });

    if (eventDoc) {
      // Event already exists
      if (eventDoc.status === "done") {
        return NextResponse.json({ received: true, status: "already_done" });
      }
      if (eventDoc.status === "processing") {
        // Concurrency edge case: another request is handling it right now.
        // We return 200 to Stripe so it doesn't retry immediately and cause race conditions.
        return NextResponse.json({
          received: true,
          status: "processing_concurrently",
        });
      }
      // If status is 'error', we assume the transaction above didn't block us from retrying logic
      // (actually for strictness we might want to allow retry only after X time, but simple is ok for now: let it flow through logic again if logic fixes it)
      // However, for safety in this robust plan, let's treat 'error' as allow-retry.
      // But valid flow above only writes if !exists. So if 'error' exists, we skipped the write but returned the doc.
      // We should allow retry.
    }
  } catch (err: any) {
    console.error("Idempotency lock error", err);
    return NextResponse.json({ error: "Lock error" }, { status: 500 });
  }

  const session = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.Subscription
    | Stripe.Invoice;

  // -------------------------------------------------------------------------
  // 2. Logic Execution
  // -------------------------------------------------------------------------
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = session as Stripe.Checkout.Session;
        const uid = checkoutSession.metadata?.uid;
        const courseId = checkoutSession.metadata?.courseId;
        const isSubscription = checkoutSession.mode === "subscription";
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : null;

        if (uid && courseId && subscriptionId) {
          const enrollmentId = `${uid}_${courseId}`;
          const mirrorRef = adminDb
            .collection("users")
            .doc(uid)
            .collection("enrollments")
            .doc(courseId);
          const rootRef = adminDb.collection("enrollments").doc(enrollmentId);
          const stripeMeta = {
            "stripe.subscriptionId": subscriptionId,
            "stripe.subscriptionStatus": "active",
            updatedAt: FieldValue.serverTimestamp(),
          };
          const batch = adminDb.batch();
          batch.set(rootRef, stripeMeta, { merge: true });
          batch.set(mirrorRef, stripeMeta, { merge: true });
          await batch.commit();
        }

        if (uid && courseId) {
          // Note: We'll wait for invoice.paid for subscriptions if we want strictness,
          // but for one-time or trial starts, we activate now.
          // For simplicity and immediate access as requested in Orbital 03:
          await activateEnrollmentFromStripe({
            uid,
            courseId,
            sessionId: checkoutSession.id,
            isSubscription,
            paymentStatus: "paid",
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = session as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        // Authoritative metadata: userId/courseId are often in the subscription or initial checkout
        // But for safety, we try to find the enrollment by subscriptionId
        const enrollmentQuery = await adminDb
          .collection("enrollments")
          .where("sourceRef", "==", subscriptionId) // Assuming subId was used as sourceRef if subscription
          .limit(1)
          .get();

        // If not found by sourceRef, try metadata from initial checkout if available
        // Usually better to have a helper that finds it
        if (!enrollmentQuery.empty) {
          const data = enrollmentQuery.docs[0].data() as EnrollmentDoc;
          await activateEnrollmentFromStripe({
            uid: data.uid || data.userId,
            courseId: data.courseId,
            sessionId: subscriptionId,
            isSubscription: true,
            paymentStatus: "paid",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = session as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        const enrollmentQuery = await adminDb
          .collection("enrollments")
          .where("stripe.subscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        if (!enrollmentQuery.empty) {
          const docSnap = enrollmentQuery.docs[0];
          const data = docSnap.data();

          const currentApproval = data.approvalStatus || "approved";
          const currentStripeStatus =
            data["stripe.subscriptionStatus"] || "past_due";

          // Force payment failed
          const finalStatus = computeAccessStatus(
            "failed",
            currentApproval,
            currentStripeStatus,
          );

          const updateData = {
            status: finalStatus,
            paymentStatus: "failed",
            "stripe.latestInvoiceStatus": invoice.status,
            updatedAt: FieldValue.serverTimestamp(),
          };

          const batch = adminDb.batch();
          const userEnrollmentRef = adminDb
            .collection("users")
            .doc(data.uid)
            .collection("enrollments")
            .doc(data.courseId);

          batch.set(docSnap.ref, updateData, { merge: true });
          batch.set(userEnrollmentRef, updateData, { merge: true });
          await batch.commit();
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = session as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const stripeStatus = subscription.status as StripeSubscriptionStatus;

        const enrollmentQuery = await adminDb
          .collection("enrollments")
          .where("stripe.subscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        if (!enrollmentQuery.empty) {
          const docSnap = enrollmentQuery.docs[0];
          const data = docSnap.data();

          const currentPayment = data.paymentStatus || "pending";
          const currentApproval = data.approvalStatus || "approved";

          // Update ONLY stripe status in our inputs
          const finalStatus = computeAccessStatus(
            currentPayment,
            currentApproval,
            stripeStatus,
          );

          const updateData: Record<string, unknown> = {
            status: finalStatus,
            "stripe.subscriptionStatus": stripeStatus,
            "stripe.currentPeriodEnd":
              typeof (subscription as any).current_period_end === "number"
                ? new Date((subscription as any).current_period_end * 1000)
                : null,
            updatedAt: FieldValue.serverTimestamp(),
          };

          if (stripeStatus === "canceled") {
            updateData.endedAt = FieldValue.serverTimestamp();
          }

          const batch = adminDb.batch();
          const userEnrollmentRef = adminDb
            .collection("users")
            .doc(data.uid)
            .collection("enrollments")
            .doc(data.courseId);

          batch.update(docSnap.ref, updateData);
          batch.update(userEnrollmentRef, updateData);
          await batch.commit();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = session as Stripe.Subscription;
        const subscriptionId = subscription.id;

        const enrollmentQuery = await adminDb
          .collection("enrollments")
          .where("stripe.subscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        if (!enrollmentQuery.empty) {
          const docSnap = enrollmentQuery.docs[0];
          const data = docSnap.data();

          const currentPayment = data.paymentStatus || "pending";
          const currentApproval = data.approvalStatus || "approved";

          // Subscription deleted -> canceled
          const finalStatus = computeAccessStatus(
            currentPayment,
            currentApproval,
            "canceled",
          );

          const updateData = {
            status: finalStatus,
            "stripe.subscriptionStatus": "canceled",
            endedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          };

          const batch = adminDb.batch();
          const userEnrollmentRef = adminDb
            .collection("users")
            .doc(data.uid)
            .collection("enrollments")
            .doc(data.courseId);

          batch.update(docSnap.ref, updateData);
          batch.update(userEnrollmentRef, updateData);
          await batch.commit();

          await logAudit({
            actor: { uid: "system", role: "webhook" },
            action: "billing.subscription_canceled",
            target: {
              collection: "enrollments",
              id: docSnap.id,
              summary: `Subscription ${subscriptionId} canceled. Access Revoked.`,
            },
            metadata: { subscriptionId },
            diff: { after: updateData },
          });
        }
        break;
      }
    }

    // -------------------------------------------------------------------------
    // 3. Mark as Done
    // -------------------------------------------------------------------------
    await eventRef.update({
      status: "done",
      processedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    const errorMsg = `Webhook handler failed: ${error.message}`;
    console.error(errorMsg);
    await logSystemError(
      "webhook",
      errorMsg,
      { eventId: event.id, type: event.type },
      "critical",
    );

    // Mark event as failed so we can audit or retry manualy
    await eventRef.update({
      failedAt: FieldValue.serverTimestamp(),
      error: error.message, // Warning: Firestore field size limit
      status: "error",
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

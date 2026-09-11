import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  activateEnrollmentFromStripe,
  writeEnrollmentMirror,
} from "@/lib/auth/enrollment-service";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getStripe } from "@/lib/stripe";
import { logAudit } from "@/lib/audit";
import { logSystemError } from "@/lib/logging";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type EventLock = "claimed" | "done" | "processing";

async function claimEvent(event: Stripe.Event): Promise<EventLock> {
  const supabase = createSupabaseServiceClient();
  const { error } = await (supabase as any)
    .from("stripe_webhook_events")
    .insert({
      id: event.id,
      type: event.type,
      livemode: event.livemode,
      event_created_at: new Date(event.created * 1000).toISOString(),
      status: "processing",
    });
  if (!error) return "claimed";
  if (error.code !== "23505") throw error;

  const { data, error: readError } = await (supabase as any)
    .from("stripe_webhook_events")
    .select("status")
    .eq("id", event.id)
    .maybeSingle();
  if (readError) throw readError;
  if (data?.status === "done") return "done";
  if (data?.status === "processing") return "processing";

  const { error: retryError } = await (supabase as any)
    .from("stripe_webhook_events")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", event.id)
    .eq("status", "error");
  if (retryError) throw retryError;
  return "claimed";
}

async function finishEvent(id: string, errorMessage?: string) {
  const patch = errorMessage
    ? {
        status: "error",
        failed_at: new Date().toISOString(),
        error_message: errorMessage.slice(0, 1000),
      }
    : { status: "done", processed_at: new Date().toISOString() };
  const { error } = await (createSupabaseServiceClient() as any)
    .from("stripe_webhook_events")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

async function findSubscriptionEnrollment(subscriptionId: string) {
  const { data, error } = await createSupabaseServiceClient()
    .from("enrollments")
    .select("*")
    .eq("source_ref", subscriptionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    const message = `Webhook signature verification failed: ${error.message}`;
    console.error(message);
    await logSystemError("webhook", message, { bodyLength: body.length });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const lock = await claimEvent(event);
    if (lock === "done")
      return NextResponse.json({ received: true, status: "already_done" });
    if (lock === "processing")
      return NextResponse.json({
        received: true,
        status: "processing_concurrently",
      });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;
        const courseId = session.metadata?.courseId;
        const isSubscription = session.mode === "subscription";
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : null;
        if (uid && courseId && subscriptionId) {
          await writeEnrollmentMirror({
            uid,
            courseId,
            enrollmentDoc: {
              sourceRef: subscriptionId,
              paymentStatus: "pending",
              paymentMethod: "subscription",
            } as any,
          });
        }
        if (
          uid &&
          courseId &&
          !isSubscription &&
          session.payment_status === "paid"
        ) {
          await activateEnrollmentFromStripe({
            uid,
            courseId,
            sessionId: session.id,
            isSubscription: false,
            paymentStatus: "paid",
          });
        } else if (uid && courseId) {
          await logAudit({
            actor: { uid: "system", role: "webhook" },
            action: "billing.activation_deferred",
            target: {
              collection: "enrollments",
              id: `${uid}_${courseId}`,
              summary: "Activation deferred until confirmed payment event",
            },
            metadata: {
              eventType: event.type,
              isSubscription,
              checkoutPaymentStatus: session.payment_status || "unknown",
              subscriptionId,
            },
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;
        if (subscriptionId) {
          const enrollment = await findSubscriptionEnrollment(subscriptionId);
          if (enrollment?.course_id && enrollment.user_id) {
            await activateEnrollmentFromStripe({
              uid: enrollment.user_id,
              courseId: enrollment.course_id,
              sessionId: subscriptionId,
              isSubscription: true,
              paymentStatus: "paid",
            });
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;
        if (subscriptionId) {
          const enrollment = await findSubscriptionEnrollment(subscriptionId);
          if (
            enrollment?.course_id &&
            (enrollment.user_id || enrollment.legacy_firebase_uid)
          ) {
            await writeEnrollmentMirror({
              uid: enrollment.user_id || enrollment.legacy_firebase_uid,
              courseId: enrollment.course_id,
              enrollmentDoc: {
                status: "canceled",
                paymentStatus: "failed",
                sourceRef: subscriptionId,
              } as any,
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const enrollment = await findSubscriptionEnrollment(subscription.id);
        if (
          enrollment?.course_id &&
          (enrollment.user_id || enrollment.legacy_firebase_uid)
        ) {
          const canceled =
            event.type === "customer.subscription.deleted" ||
            subscription.status === "canceled";
          await writeEnrollmentMirror({
            uid: enrollment.user_id || enrollment.legacy_firebase_uid,
            courseId: enrollment.course_id,
            enrollmentDoc: {
              status: canceled ? "canceled" : enrollment.status,
              sourceRef: subscription.id,
            } as any,
          });
          if (canceled)
            await logAudit({
              actor: { uid: "system", role: "webhook" },
              action: "billing.subscription_canceled",
              target: {
                collection: "enrollments",
                id: enrollment.id,
                summary: `Subscription ${subscription.id} canceled`,
              },
              metadata: { subscriptionId: subscription.id },
            });
        }
        break;
      }
    }

    await finishEvent(event.id);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    const message = `Webhook handler failed: ${error.message}`;
    console.error(message);
    await logSystemError(
      "webhook",
      message,
      { eventId: event.id, type: event.type },
      "critical",
    );
    try {
      await finishEvent(event.id, error.message);
    } catch (finishError) {
      console.error("Webhook event failure recording failed", finishError);
    }
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

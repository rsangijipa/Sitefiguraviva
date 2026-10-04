import {
  isStripeTestBillingEnabled,
  STRIPE_DISABLED_MESSAGE,
} from "./billing-mode";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeTestBillingEnabled()) throw new Error(STRIPE_DISABLED_MESSAGE);
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2024-12-18.acacia" as any,
    typescript: true,
  });

  return stripeClient;
}

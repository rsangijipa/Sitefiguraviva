// The commercial launch uses manual Pix. Legacy Stripe paths are test-only.
export function isStripeTestBillingEnabled() {
  return (
    process.env.STRIPE_BILLING_MODE === "test" &&
    process.env.VERCEL_ENV !== "production" &&
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") === true
  );
}

export const STRIPE_DISABLED_MESSAGE =
  "Pagamento por cartão indisponível. Utilize a inscrição com Pix.";

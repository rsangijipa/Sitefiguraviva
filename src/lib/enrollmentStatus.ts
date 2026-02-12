export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";
export type ApprovalStatus = "pending_review" | "approved" | "rejected";
export type AccessStatus =
  | "pending_approval"
  | "active"
  | "completed"
  | "canceled"
  | "refunded";
export type StripeSubscriptionStatus =
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "paused";

/**
 * Computes the final access status for an enrollment.
 *
 * CORE RULE: Access is 'active' ONLY if:
 * 1. Payment is 'paid'
 * 2. Approval is 'approved'
 * 3. Subscription is 'active' (or trialing)
 */
export function computeAccessStatus(
  paymentStatus: PaymentStatus,
  approvalStatus: ApprovalStatus,
  stripeSubscriptionStatus: StripeSubscriptionStatus,
): AccessStatus {
  // 1. Hard blockers
  if (approvalStatus === "rejected") {
    return "canceled";
  }

  if (
    stripeSubscriptionStatus === "canceled" ||
    stripeSubscriptionStatus === "unpaid"
  ) {
    return "canceled";
  }

  // 2. Financial blockers
  if (
    paymentStatus === "failed" ||
    paymentStatus === "refunded" ||
    stripeSubscriptionStatus === "past_due" ||
    stripeSubscriptionStatus === "incomplete_expired"
  ) {
    return paymentStatus === "refunded" ? "refunded" : "canceled";
  }

  // 3. Active only when paid + approved + valid subscription status
  const isStripeActive =
    stripeSubscriptionStatus === "active" ||
    stripeSubscriptionStatus === "trialing";
  if (
    paymentStatus === "paid" &&
    approvalStatus === "approved" &&
    isStripeActive
  ) {
    return "active";
  }

  // 4. Everything else stays pending admin approval.
  return "pending_approval";
}

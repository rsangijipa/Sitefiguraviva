export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type ApprovalStatus = 'pending_review' | 'approved' | 'rejected';
export type AccessStatus = 'active' | 'awaiting_payment' | 'awaiting_approval' | 'blocked' | 'rejected' | 'canceled';
export type StripeSubscriptionStatus = 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';

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
    stripeSubscriptionStatus: StripeSubscriptionStatus
): AccessStatus {
    // 1. Hard Blockers (Explicit Rejection or Cancellation)
    if (approvalStatus === 'rejected') {
        return 'rejected';
    }

    if (stripeSubscriptionStatus === 'canceled' || stripeSubscriptionStatus === 'unpaid') {
        return 'canceled';
    }

    // 2. Financial Blockers
    // If payment failed or sub is past due, access is blocked.
    if (paymentStatus === 'failed' || paymentStatus === 'refunded' || stripeSubscriptionStatus === 'past_due' || stripeSubscriptionStatus === 'incomplete_expired') {
        return 'blocked';
    }

    // 3. Awaiting Approval (Paid but not approved)
    if (paymentStatus === 'paid' && approvalStatus === 'pending_review') {
        return 'awaiting_approval';
    }

    // 4. Active (The Happy Path)
    // STRICT RULE: Paid + Approved + Active Subscription
    const isStripeActive = stripeSubscriptionStatus === 'active' || stripeSubscriptionStatus === 'trialing';
    if (paymentStatus === 'paid' && approvalStatus === 'approved' && isStripeActive) {
        return 'active';
    }

    // 5. Default Fallback (anything else is Pending/Awaiting Payment)
    return 'awaiting_payment';
}

import { computeAccessStatus, PaymentStatus, ApprovalStatus, StripeSubscriptionStatus } from '../enrollmentStatus';

describe('computeAccessStatus', () => {
    // 1. Rejected
    it('should return rejected if approval is rejected', () => {
        expect(computeAccessStatus('paid', 'rejected', 'active')).toBe('rejected');
    });

    // 2. Canceled/Unpaid Subscription
    it('should return canceled if stripe subscription is canceled', () => {
        expect(computeAccessStatus('paid', 'approved', 'canceled')).toBe('canceled');
    });

    // 3. Blocked (Financial)
    it('should return blocked if payment failed', () => {
        expect(computeAccessStatus('failed', 'approved', 'active')).toBe('blocked');
    });

    it('should return blocked if subscription is past_due', () => {
        expect(computeAccessStatus('paid', 'approved', 'past_due')).toBe('blocked');
    });

    // 4. Awaiting Approval
    it('should return awaiting_approval if paid but pending review', () => {
        expect(computeAccessStatus('paid', 'pending_review', 'active')).toBe('awaiting_approval');
    });

    // 5. Active (Happy Path)
    it('should return active if paid, approved, and subscription active', () => {
        expect(computeAccessStatus('paid', 'approved', 'active')).toBe('active');
    });

    it('should return active if paid, approved, and subscription trialing', () => {
        expect(computeAccessStatus('paid', 'approved', 'trialing')).toBe('active');
    });

    // 6. Default Fallback
    it('should return awaiting_payment for other cases', () => {
        expect(computeAccessStatus('pending', 'approved', 'active')).toBe('awaiting_payment');
    });
});

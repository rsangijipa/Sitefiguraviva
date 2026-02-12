import { computeAccessStatus } from "../enrollmentStatus";

describe("computeAccessStatus", () => {
  // 1. Rejected approval maps to canceled access
  it("should return canceled if approval is rejected", () => {
    expect(computeAccessStatus("paid", "rejected", "active")).toBe("canceled");
  });

  // 2. Canceled/Unpaid Subscription
  it("should return canceled if stripe subscription is canceled", () => {
    expect(computeAccessStatus("paid", "approved", "canceled")).toBe(
      "canceled",
    );
  });

  // 3. Financial issues map to canceled/refunded
  it("should return canceled if payment failed", () => {
    expect(computeAccessStatus("failed", "approved", "active")).toBe(
      "canceled",
    );
  });

  it("should return canceled if subscription is past_due", () => {
    expect(computeAccessStatus("paid", "approved", "past_due")).toBe(
      "canceled",
    );
  });

  // 4. Awaiting Approval
  it("should return pending_approval if paid but pending review", () => {
    expect(computeAccessStatus("paid", "pending_review", "active")).toBe(
      "pending_approval",
    );
  });

  // 5. Active (Happy Path)
  it("should return active if paid, approved, and subscription active", () => {
    expect(computeAccessStatus("paid", "approved", "active")).toBe("active");
  });

  it("should return active if paid, approved, and subscription trialing", () => {
    expect(computeAccessStatus("paid", "approved", "trialing")).toBe("active");
  });

  // 6. Default Fallback
  it("should return pending_approval for other cases", () => {
    expect(computeAccessStatus("pending", "approved", "active")).toBe(
      "pending_approval",
    );
  });
});

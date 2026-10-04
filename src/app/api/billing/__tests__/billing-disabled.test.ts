const stripe = jest.fn(),
  claims = jest.fn(),
  database = jest.fn();
jest.mock("@/lib/stripe", () => ({
  getStripe: (...args: unknown[]) => stripe(...args),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => database(),
}));
jest.mock("@/lib/auth/supabase-session", () => ({
  getBearerSupabaseSessionClaims: () => claims(),
}));
jest.mock("@/lib/firebase/admin", () => ({
  adminDb: { collection: () => database() },
}));
jest.mock("@/lib/auth/enrollment-service", () => ({
  activateEnrollmentFromStripe: jest.fn(),
  writeEnrollmentMirror: jest.fn(),
}));
jest.mock("@/lib/logging", () => ({ logSystemError: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }),
  },
}));
import { POST as checkout } from "../checkout-subscription/route";
import { POST as portal } from "../customer-portal/route";
import { POST as webhook } from "../webhook/route";
import { isStripeTestBillingEnabled } from "@/lib/billing-mode";
beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.STRIPE_BILLING_MODE;
  delete process.env.VERCEL_ENV;
  process.env.STRIPE_SECRET_KEY = "sk_test_fixture";
});
it.each([checkout, portal, webhook])(
  "rejects legacy billing without contacting identity, PSP or database",
  async (handler) => {
    const result = await handler({} as any);
    expect(result.status).toBe(503);
    expect(stripe).not.toHaveBeenCalled();
    expect(claims).not.toHaveBeenCalled();
    expect(database).not.toHaveBeenCalled();
  },
);
it("rejects live keys even with a test opt-in", () => {
  process.env.STRIPE_BILLING_MODE = "test";
  process.env.STRIPE_SECRET_KEY = "sk_live_fixture";
  expect(isStripeTestBillingEnabled()).toBe(false);
  expect(() => jest.requireActual("@/lib/stripe").getStripe()).toThrow(
    "indisponível",
  );
});
it("cannot enable test billing in a production Vercel deployment", async () => {
  process.env.STRIPE_BILLING_MODE = "test";
  process.env.VERCEL_ENV = "production";
  expect((await checkout({} as any)).status).toBe(503);
  expect(stripe).not.toHaveBeenCalled();
});
it("requires explicit test mode and test credentials", () => {
  process.env.STRIPE_BILLING_MODE = "test";
  expect(isStripeTestBillingEnabled()).toBe(true);
  delete process.env.STRIPE_SECRET_KEY;
  expect(isStripeTestBillingEnabled()).toBe(false);
});

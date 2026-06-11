import { activateEnrollmentFromStripe } from "@/lib/auth/enrollment-service";
import { logAudit } from "@/lib/audit";

const constructEventMock = jest.fn();
const eventRefUpdateMock = jest.fn();
const runTransactionMock = jest.fn();

jest.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: constructEventMock,
    },
  }),
}));

jest.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: eventRefUpdateMock,
      })),
    })),
    runTransaction: (...args: any[]) => runTransactionMock(...args),
  },
}));

jest.mock("@/lib/auth/enrollment-service", () => ({
  activateEnrollmentFromStripe: jest.fn(),
  writeEnrollmentMirror: jest.fn(),
}));

jest.mock("@/lib/logging", () => ({
  logSystemError: jest.fn(),
}));

jest.mock("@/lib/audit", () => ({
  logAudit: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

describe("billing webhook route", () => {
  let POST: (req: any) => Promise<any>;

  beforeAll(async () => {
    ({ POST } = await import("@/app/api/billing/webhook/route"));
  });

  beforeEach(() => {
    jest.clearAllMocks();

    runTransactionMock.mockImplementation(async (handler: any) => {
      const tx = {
        get: jest.fn(async () => ({ exists: false })),
        set: jest.fn(),
      };
      await handler(tx);
      return null;
    });

    eventRefUpdateMock.mockResolvedValue(undefined);
  });

  function makeRequest() {
    return {
      text: async () => JSON.stringify({ ok: true }),
      headers: {
        get: () => "sig_test",
      },
    } as any;
  }

  it("activates one-time enrollment only when checkout payment is paid", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_paid",
      type: "checkout.session.completed",
      created: 1,
      livemode: false,
      data: {
        object: {
          id: "cs_paid",
          mode: "payment",
          payment_status: "paid",
          metadata: { uid: "u1", courseId: "c1" },
        },
      },
    });

    await POST(makeRequest());

    expect(activateEnrollmentFromStripe).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "u1",
        courseId: "c1",
        sessionId: "cs_paid",
        isSubscription: false,
        paymentStatus: "paid",
      }),
    );
    expect(logAudit).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: "billing.activation_deferred" }),
    );
  });

  it("defers activation and writes audit when checkout is not paid", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_unpaid",
      type: "checkout.session.completed",
      created: 1,
      livemode: false,
      data: {
        object: {
          id: "cs_unpaid",
          mode: "payment",
          payment_status: "unpaid",
          metadata: { uid: "u2", courseId: "c2" },
        },
      },
    });

    await POST(makeRequest());

    expect(activateEnrollmentFromStripe).not.toHaveBeenCalled();
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "billing.activation_deferred",
      }),
    );
  });
});

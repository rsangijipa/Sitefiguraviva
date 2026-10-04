const verify = jest.fn(),
  admin = jest.fn(),
  find = jest.fn(),
  rpc = jest.fn(),
  course = jest.fn();
jest.mock("@/lib/auth/server", () => ({
  verifySession: () => verify(),
  requireAdmin: () => admin(),
}));
jest.mock("@/lib/pix-order.server", () => ({
  findPixOrder: (...args: unknown[]) => find(...args),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc,
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: course }) }) }),
  }),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import {
  generatePixPayload,
  approvePixEnrollment,
  rejectPixEnrollment,
} from "../enrollment-pix";
describe("manual Pix actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PIX_MERCHANT_KEY = "receiver@example.com";
    verify.mockResolvedValue({ uid: "00000000-0000-4000-8000-000000000001" });
    admin.mockResolvedValue({ uid: "00000000-0000-4000-8000-000000000002" });
    find.mockResolvedValue(null);
    course.mockResolvedValue({
      data: { pix_price_cents: 25000, is_published: true, status: "open" },
      error: null,
    });
    rpc.mockImplementation(async (name: string, args: any) => ({
      data:
        name === "create_manual_pix_order"
          ? {
              id: args.p_id,
              payload: args.p_payload,
              txid: args.p_txid,
              amount_cents: args.p_amount,
            }
          : { alreadyProcessed: false },
      error: null,
    }));
  });
  afterEach(() => {
    delete process.env.PIX_MERCHANT_KEY;
  });
  it("restores the persisted code even if configuration or price changed", async () => {
    delete process.env.PIX_MERCHANT_KEY;
    find.mockResolvedValue({
      id: "existing",
      payload: "stored",
      amount_cents: 10000,
    });
    expect((await generatePixPayload("course-a")).payload).toBe("stored");
    expect(rpc).not.toHaveBeenCalled();
    expect(course).not.toHaveBeenCalled();
  });
  it("creates distinct course references and embeds server-side initial amount", async () => {
    const a = await generatePixPayload("course-a"),
      b = await generatePixPayload("course-b");
    expect(a.order?.txid).not.toBe(b.order?.txid);
    expect(a.payload).toContain("5406250.00");
    expect(rpc.mock.calls[0][1].p_amount).toBe(25000);
  });
  it("creates no pending enrollment when Pix is unconfigured or price is invalid", async () => {
    delete process.env.PIX_MERCHANT_KEY;
    expect((await generatePixPayload("course-a")).configured).toBe(false);
    process.env.PIX_MERCHANT_KEY = "receiver@example.com";
    course.mockResolvedValue({
      data: { pix_price_cents: null, is_published: true, status: "open" },
      error: null,
    });
    expect((await generatePixPayload("course-a")).success).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("requires explicit bank receipt confirmation before approving", async () => {
    expect((await approvePixEnrollment("user", "course")).success).toBe(false);
    expect(
      (
        await approvePixEnrollment("user", "course", {
          bankReference: "BANKREF",
          receivedAt: new Date().toISOString(),
          receivedConfirmed: false,
          receivedAmountCents: 25000,
        })
      ).success,
    ).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("binds reviewer identity and supports idempotent approval", async () => {
    rpc.mockResolvedValue({ data: { alreadyProcessed: true }, error: null });
    const receivedAt = new Date().toISOString();
    expect(
      await approvePixEnrollment("user", "course", {
        bankReference: "BANKREF",
        receivedAt,
        receivedConfirmed: true,
        receivedAmountCents: 25000,
      }),
    ).toEqual({ success: true, alreadyProcessed: true });
    expect(rpc).toHaveBeenCalledWith(
      "review_manual_pix_order",
      expect.objectContaining({
        p_admin: "00000000-0000-4000-8000-000000000002",
        p_bank_reference: "BANKREF",
        p_received_at: receivedAt,
        p_approve: true,
      }),
    );
  });
  it("requires a reason and surfaces transaction failure", async () => {
    expect((await rejectPixEnrollment("user", "course", "x")).success).toBe(
      false,
    );
    expect(rpc).not.toHaveBeenCalled();
    rpc.mockResolvedValue({
      data: null,
      error: { message: "sensitive detail" },
    });
    const result = await rejectPixEnrollment(
      "user",
      "course",
      "Crédito não recebido",
    );
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("sensitive");
  });
});

it("rejects bank credit dated in the future before calling reconciliation", async () => {
  admin.mockResolvedValue({ uid: "admin" });
  rpc.mockClear();
  const result = await approvePixEnrollment("student", "course", {
    bankReference: "REF123456",
    receivedAt: new Date(Date.now() + 3600000).toISOString(),
    receivedConfirmed: true,
    receivedAmountCents: 100,
  });
  expect(result.success).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});

const admin = jest.fn(),
  read = jest.fn(),
  rpc = jest.fn(),
  find = jest.fn();
jest.mock("@/lib/auth/server", () => ({ requireAdmin: () => admin() }));
jest.mock("@/lib/pix-order.server", () => ({
  findPixOrder: (...a: unknown[]) => find(...a),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc,
    from: (table: string) => ({
      select: () => {
        const query: any = { eq: () => query, maybeSingle: () => read(table) };
        return query;
      },
    }),
  }),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import { enrollLead } from "../adminEnrollment";
beforeEach(() => {
  jest.clearAllMocks();
  admin.mockResolvedValue({ uid: "admin" });
  find.mockResolvedValue(null);
  read.mockImplementation(async (table: string) => ({
    data:
      table === "applications"
        ? {
            id: "saved-app",
            user_id: "saved-user",
            course_id: "saved-course",
            status: "submitted",
          }
        : table === "profiles"
          ? { is_active: true }
          : table === "courses"
            ? { pix_price_cents: 25000, is_published: true, status: "open" }
            : null,
    error: null,
  }));
  rpc.mockResolvedValue({ data: { status: "pending" }, error: null });
  process.env.PIX_MERCHANT_KEY = "receiver@example.com";
});
afterEach(() => delete process.env.PIX_MERCHANT_KEY);
it("ignores client supplied identity and keeps initial charge pending", async () => {
  const result = await enrollLead("saved-app", {
    email: "attacker@example.com",
    courseId: "wrong-course",
  });
  expect(result.success).toBe(true);
  expect(result.userId).toBe("saved-user");
  expect(result.courseId).toBe("saved-course");
  expect(result.paymentPending).toBe(true);
  expect(rpc).toHaveBeenCalledWith(
    "prepare_application_pix",
    expect.objectContaining({
      p_actor: "admin",
      p_application: "saved-app",
      p_amount: 25000,
    }),
  );
  expect(find).toHaveBeenCalledWith("saved-user", "saved-course");
});
it("does not depend on answers.email", async () => {
  expect((await enrollLead("saved-app")).success).toBe(true);
});
it("fails closed if application query errors", async () => {
  read.mockResolvedValue({ data: null, error: { message: "unavailable" } });
  expect((await enrollLead("saved-app")).success).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
it("rejects disabled linked account", async () => {
  const prior = read.getMockImplementation()!;
  read.mockImplementation((table: string) =>
    table === "profiles"
      ? Promise.resolve({ data: { is_active: false }, error: null })
      : prior(table),
  );
  expect((await enrollLead("saved-app")).success).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
it("restores existing charge even when config is missing", async () => {
  delete process.env.PIX_MERCHANT_KEY;
  find.mockResolvedValue({ status: "pending", amount_cents: 20000 });
  expect((await enrollLead("saved-app")).paymentPending).toBe(true);
  expect(rpc).not.toHaveBeenCalled();
});
it("does not change existing active enrollment", async () => {
  const prior = read.getMockImplementation()!;
  read.mockImplementation((table: string) =>
    table === "enrollments"
      ? Promise.resolve({ data: { status: "active" }, error: null })
      : prior(table),
  );
  expect((await enrollLead("saved-app")).alreadyEnrolled).toBe(true);
  expect(rpc).not.toHaveBeenCalled();
});
it("does not report success when preparation errors", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "consent missing" } });
  expect((await enrollLead("saved-app")).success).toBe(false);
});

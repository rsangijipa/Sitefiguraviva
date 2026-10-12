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
import { enrollLead, enrollLeadWithExternalPix } from "../adminEnrollment";
import { revalidatePath } from "next/cache";
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

describe("external Pix enrollment", () => {
  it.each([false, undefined, "true", 1])(
    "requires explicit confirmation (%s)",
    async (confirmation) => {
      const result = await enrollLeadWithExternalPix(
        "saved-app",
        confirmation as boolean,
      );
      expect(result.success).toBe(false);
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it("requires an administrator before granting access", async () => {
    admin.mockRejectedValueOnce(new Error("Forbidden"));
    expect((await enrollLeadWithExternalPix("saved-app", true)).success).toBe(
      false,
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects an empty application identity", async () => {
    expect((await enrollLeadWithExternalPix("  ", true)).success).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses persisted application identity without generating a charge", async () => {
    delete process.env.PIX_MERCHANT_KEY;
    rpc.mockResolvedValueOnce({
      data: {
        enrollmentId: "enrollment",
        userId: "saved-user",
        courseId: "saved-course",
        alreadyProcessed: false,
      },
      error: null,
    });
    const result = await enrollLeadWithExternalPix("saved-app", true);
    expect(result).toEqual({
      success: true,
      enrollmentId: "enrollment",
      userId: "saved-user",
      courseId: "saved-course",
      alreadyProcessed: false,
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("enroll_application_external_pix", {
      p_actor: "admin",
      p_application: "saved-app",
      p_confirmed: true,
    });
    expect(find).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/users");
    expect(revalidatePath).toHaveBeenCalledWith("/portal/course/saved-course");
  });

  it("preserves the result of an already completed enrollment", async () => {
    rpc.mockResolvedValueOnce({
      data: {
        enrollmentId: "enrollment",
        userId: "saved-user",
        courseId: "saved-course",
        alreadyProcessed: true,
      },
      error: null,
    });
    expect(await enrollLeadWithExternalPix("saved-app", true)).toMatchObject({
      success: true,
      alreadyProcessed: true,
    });
  });

  it("does not report success or refresh on database rejection", async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "state conflict" },
    });
    expect((await enrollLeadWithExternalPix("saved-app", true)).success).toBe(
      false,
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

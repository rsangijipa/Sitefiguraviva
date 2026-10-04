const actor = jest.fn(),
  read = jest.fn(),
  rpc = jest.fn(),
  lookup = jest.fn(),
  pix = jest.fn();
jest.mock("@/lib/auth/server", () => ({ requireAdmin: () => actor() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc,
    from: (table: string) => ({
      select: () => {
        const q: any = { eq: () => q, maybeSingle: () => read(table) };
        return q;
      },
    }),
  }),
}));
jest.mock("@/lib/auth/admin-user-lookup", () => ({
  findOrCreateSupabaseUserByEmail: (...a: unknown[]) => lookup(...a),
}));
jest.mock("@/app/actions/enrollment-pix", () => ({
  approvePixEnrollment: (...a: unknown[]) => pix(...a),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import {
  enrollUser,
  batchEnrollUsers,
  revokeAccess,
  approveEnrollment,
} from "../admin/enrollment";
beforeEach(() => {
  jest.clearAllMocks();
  actor.mockResolvedValue({ uid: "admin" });
  read.mockImplementation(async (table: string) => ({
    data:
      table === "courses"
        ? { id: "course", is_published: true, status: "open" }
        : { payment_method: "manual" },
    error: null,
  }));
  lookup.mockResolvedValue({ uid: "student", isNewUser: false });
  rpc.mockResolvedValue({
    data: { enrollmentId: "actual-uuid", alreadyProcessed: false },
    error: null,
  });
  pix.mockResolvedValue({ success: true });
});
it("validates course before creating or inviting an account", async () => {
  read.mockResolvedValue({ data: null, error: { message: "unavailable" } });
  expect((await enrollUser("student@example.com", "missing")).success).toBe(
    false,
  );
  expect(lookup).not.toHaveBeenCalled();
});
it("uses actual persisted enrollment ID and requests explicit manual grant", async () => {
  const result = await enrollUser(" STUDENT@example.com ", "course");
  expect(result.enrollmentId).toBe("actual-uuid");
  expect(rpc).toHaveBeenCalledWith("grant_manual_course_access", {
    p_actor: "admin",
    p_user: "student",
    p_course: "course",
  });
});
it("reports partial invitation when grant fails", async () => {
  lookup.mockResolvedValue({ uid: "student", isNewUser: true });
  rpc.mockResolvedValue({ data: null, error: { message: "state conflict" } });
  expect((await enrollUser("student@example.com", "course")).error).toContain(
    "Convite solicitado",
  );
});
it("revocation goes through atomic RPC and cannot upsert phantom enrollment", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "not found" } });
  expect((await revokeAccess("student", "course")).success).toBe(false);
  expect(rpc).toHaveBeenCalledWith("set_enrollment_admin_state", {
    p_actor: "admin",
    p_user: "student",
    p_course: "course",
    p_status: "canceled",
  });
});
it("deduplicates batch and separates outcome boolean from enrolled emails", async () => {
  const result = await batchEnrollUsers(
    ["Student@example.com", " student@example.com "],
    "course",
  );
  expect(result.success).toBe(true);
  expect(result.enrolled).toEqual(["student@example.com"]);
  expect(lookup).toHaveBeenCalledTimes(1);
});
it("bounds batch before any invitation", async () => {
  expect(
    (await batchEnrollUsers(Array(101).fill("student@example.com"), "course"))
      .success,
  ).toBe(false);
  expect(lookup).not.toHaveBeenCalled();
});
it("records individual batch failures without falsely granting access", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "state conflict" } });
  const result = await batchEnrollUsers(["student@example.com"], "course");
  expect(result.enrolled).toEqual([]);
  expect(result.failed).toHaveLength(1);
});
it("delegates Pix approval to bank reconciliation", async () => {
  read.mockResolvedValue({ data: { payment_method: "pix" }, error: null });
  await approveEnrollment("student", "course");
  expect(pix).toHaveBeenCalledWith("student", "course", undefined);
  expect(rpc).not.toHaveBeenCalled();
});

it.each([null, "stripe", "unknown"])(
  "rejects unsupported approval method %s before mutation",
  async (method) => {
    read.mockResolvedValue({ data: { payment_method: method }, error: null });
    expect(await approveEnrollment("student", "course")).toMatchObject({
      success: false,
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(pix).not.toHaveBeenCalled();
  },
);
it.each(["manual", "free"])(
  "grants %s access through the database guard",
  async (method) => {
    read.mockResolvedValue({ data: { payment_method: method }, error: null });
    expect(await approveEnrollment("student", "course")).toMatchObject({
      success: true,
    });
    expect(rpc).toHaveBeenCalledWith(
      "set_enrollment_admin_state",
      expect.objectContaining({ p_status: "active" }),
    );
  },
);

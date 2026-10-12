const requireAdmin = jest.fn();
const rpc = jest.fn();

jest.mock("@/lib/auth/server", () => ({
  requireAdmin: () => requireAdmin(),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ rpc }),
}));
jest.mock("@/app/actions/admin/enrollment", () => ({
  approveEnrollment: jest.fn(),
}));
jest.mock("@/app/actions/enrollment-pix", () => ({
  rejectPixEnrollment: jest.fn(),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { reviewRegistration } from "../actions";

describe("reviewRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ uid: "admin-1" });
    rpc.mockResolvedValue({ data: { approved: true }, error: null });
  });

  it("binds the decision to the authenticated administrator", async () => {
    expect(await reviewRegistration("student-1", true)).toEqual({
      success: true,
    });
    expect(rpc).toHaveBeenCalledWith("review_pending_registration", {
      p_actor: "admin-1",
      p_target: "student-1",
      p_approve: true,
    });
  });

  it("rejects invalid decisions and unauthorized callers before mutation", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("denied"));
    expect(await reviewRegistration("student-1", true)).toMatchObject({
      success: false,
    });
    expect(rpc).not.toHaveBeenCalled();

    requireAdmin.mockResolvedValue({ uid: "admin-1" });
    expect(await reviewRegistration("", true)).toMatchObject({
      success: false,
    });
    expect(rpc).not.toHaveBeenCalled();
  });
});

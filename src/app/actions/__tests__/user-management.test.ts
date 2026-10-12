const admin = jest.fn(),
  rpc = jest.fn(),
  read = jest.fn(),
  ban = jest.fn(),
  remove = jest.fn(),
  getAuth = jest.fn(),
  otp = jest.fn(),
  limit = jest.fn(),
  updateProfile = jest.fn();
jest.mock("@/lib/auth/server", () => ({ requireAdmin: () => admin() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc,
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: read }) }),
      update: (data: unknown) => ({ eq: (col: string, val: unknown) => updateProfile(data, col, val) }),
    }),
    auth: {
      admin: { updateUserById: ban, deleteUser: remove, getUserById: getAuth },
    },
  }),
  createSupabaseAuthServerClient: () => ({ auth: { signInWithOtp: otp } }),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...a: unknown[]) => limit(...a),
  RateLimitPresets: { PASSWORD_RESET: { maxRequests: 3, windowMs: 600000 } },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/features/interactive-resources/v2/maintenance.server",()=>({prepareResourceAccountErasure:jest.fn().mockResolvedValue(undefined)}));
import {
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  sendUserAccessEmail,
  adminUpdateUser,
} from "../user-management";
beforeEach(() => {
  jest.clearAllMocks();
  admin.mockResolvedValue({ uid: "admin" });
  read.mockResolvedValue({
    data: { id: "student", email: "student@example.com", is_active: true },
    error: null,
  });
  rpc.mockResolvedValue({ data: { isActive: false }, error: null });
  ban.mockResolvedValue({ error: null });
  remove.mockResolvedValue({ error: null });
  getAuth.mockResolvedValue({
    data: { user: { email: "student@example.com" } },
    error: null,
  });
  otp.mockResolvedValue({ error: null });
  limit.mockResolvedValue({ allowed: true });
  updateProfile.mockResolvedValue({ error: null });
  process.env.NEXT_PUBLIC_BASE_URL = "https://www.institutofiguraviva.com.br";
});
it("checks persisted governance result instead of raw update", async () => {
  rpc.mockResolvedValue({ data: null, error: { code: "42501" } });
  expect((await updateUserRole("student", "admin")).success).toBe(false);
  expect(rpc).toHaveBeenCalledWith(
    "set_admin_profile_governance",
    expect.objectContaining({
      p_actor: "admin",
      p_target: "student",
      p_role: "admin",
    }),
  );
});
it("rejects invalid runtime role", async () => {
  expect((await updateUserRole("student", "owner" as any)).success).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
it("rejects self disabling", async () => {
  expect((await toggleUserStatus("admin", "disabled")).success).toBe(false);
  expect(ban).not.toHaveBeenCalled();
});
it("does not report success when Auth ban returns an error", async () => {
  ban.mockResolvedValue({ error: { message: "unavailable" } });
  const result = await toggleUserStatus("student", "disabled");
  expect(result.success).toBe(false);
  expect(result.error).toContain("Perfil desativado");
  expect(rpc.mock.invocationCallOrder[0]).toBeLessThan(
    ban.mock.invocationCallOrder[0],
  );
  expect(ban).toHaveBeenCalledWith("student", { ban_duration: "876000h" });
});
it("does not activate the profile after an Auth failure", async () => {
  ban.mockResolvedValue({ error: { message: "unavailable" } });
  expect((await toggleUserStatus("student", "active")).success).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
it("unbans before enabling the profile", async () => {
  expect((await toggleUserStatus("student", "active")).success).toBe(true);
  expect(ban.mock.invocationCallOrder[0]).toBeLessThan(
    rpc.mock.invocationCallOrder[0],
  );
});
it("does not mutate missing profiles", async () => {
  read.mockResolvedValue({ data: null, error: null });
  expect((await toggleUserStatus("student", "disabled")).success).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
it("preserves accounts with business dependencies", async () => {
  rpc.mockResolvedValue({ data: true, error: null });
  expect((await deleteUser("student")).success).toBe(false);
  expect(remove).not.toHaveBeenCalled();
});
it("fails closed when dependency check errors", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "denied" } });
  expect((await deleteUser("student")).success).toBe(false);
  expect(remove).not.toHaveBeenCalled();
});
it("preserves inactive profile when Auth delete errors", async () => {
  rpc
    .mockResolvedValueOnce({ data: false, error: null })
    .mockResolvedValueOnce({ data: { isActive: false }, error: null });
  remove.mockResolvedValue({ error: { message: "unavailable" } });
  const result = await deleteUser("student");
  expect(result.success).toBe(false);
  expect(result.error).toContain("registros foram preservados");
  expect(read).toHaveBeenCalledTimes(1);
});
it("confirms canonical Auth cascade instead of separately deleting profile", async () => {
  rpc
    .mockResolvedValueOnce({ data: false, error: null })
    .mockResolvedValueOnce({ data: { isActive: false }, error: null });
  read
    .mockResolvedValueOnce({ data: { id: "student" }, error: null })
    .mockResolvedValueOnce({ data: null, error: null });
  expect((await deleteUser("student")).success).toBe(true);
});
it("denies access mail for disabled account", async () => {
  read.mockResolvedValue({
    data: { id: "student", email: "student@example.com", is_active: false },
    error: null,
  });
  expect((await sendUserAccessEmail("student")).success).toBe(false);
  expect(otp).not.toHaveBeenCalled();
});
it("denies mismatching canonical Auth email", async () => {
  getAuth.mockResolvedValue({
    data: { user: { email: "other@example.com" } },
    error: null,
  });
  expect((await sendUserAccessEmail("student")).success).toBe(false);
  expect(otp).not.toHaveBeenCalled();
});
it("requests mail without creating another account or exposing a token", async () => {
  const result = await sendUserAccessEmail("student");
  expect(result).toEqual({ success: true });
  expect(otp).toHaveBeenCalledWith({
    email: "student@example.com",
    options: {
      shouldCreateUser: false,
      emailRedirectTo:
        "https://www.institutofiguraviva.com.br/auth/update-password",
    },
  });
});
it("handles mail API error responses", async () => {
  otp.mockResolvedValue({ error: { message: "SMTP" } });
  expect((await sendUserAccessEmail("student")).success).toBe(false);
});
it("enforces resend throttle before email", async () => {
  limit.mockResolvedValue({ allowed: false });
  expect((await sendUserAccessEmail("student")).success).toBe(false);
  expect(otp).not.toHaveBeenCalled();
});

describe("adminUpdateUser", () => {
  it("updates displayName and phoneNumber in auth and profiles", async () => {
    const res = await adminUpdateUser("student", {
      displayName: "Carlos Silva",
      phoneNumber: "11988887777",
    });
    expect(res.success).toBe(true);
    expect(ban).toHaveBeenCalledWith("student", {
      user_metadata: {
        full_name: "Carlos Silva",
        phone: "11988887777",
      },
    });
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: "Carlos Silva",
        phone_number: "11988887777",
      }),
      "id",
      "student",
    );
  });

  it("updates password directly via updateUserById", async () => {
    const res = await adminUpdateUser("student", {
      password: "new-secure-password",
    });
    expect(res.success).toBe(true);
    expect(ban).toHaveBeenCalledWith("student", {
      password: "new-secure-password",
    });
  });

  it("updates email and sets email_confirm true when email changes", async () => {
    const res = await adminUpdateUser("student", {
      email: "newemail@example.com",
    });
    expect(res.success).toBe(true);
    expect(ban).toHaveBeenCalledWith("student", {
      email: "newemail@example.com",
      email_confirm: true,
    });
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newemail@example.com",
      }),
      "id",
      "student",
    );
  });

  it("rejects password shorter than 8 characters", async () => {
    const res = await adminUpdateUser("student", {
      password: "123",
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("mínimo 8 caracteres");
    expect(ban).not.toHaveBeenCalled();
  });

  it("rejects invalid email address", async () => {
    const res = await adminUpdateUser("student", {
      email: "not-an-email",
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("inválido");
    expect(ban).not.toHaveBeenCalled();
  });

  it("rejects non-admin actor", async () => {
    admin.mockRejectedValue(new Error("Unauthorized"));
    const res = await adminUpdateUser("student", {
      displayName: "Novo Nome",
    });
    expect(res.success).toBe(false);
    expect(ban).not.toHaveBeenCalled();
  });
});

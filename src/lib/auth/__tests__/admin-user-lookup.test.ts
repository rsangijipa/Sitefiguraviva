const read = jest.fn(),
  invite = jest.fn(),
  upsert = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: read }) }),
      upsert,
    }),
    auth: { admin: { inviteUserByEmail: invite } },
  }),
}));
import { findOrCreateSupabaseUserByEmail } from "../admin-user-lookup";
beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_BASE_URL = "https://www.institutofiguraviva.com.br";
  read.mockResolvedValue({ data: null, error: null });
  invite.mockResolvedValue({ data: { user: { id: "new-user" } }, error: null });
  upsert.mockResolvedValue({ error: null });
});
it("does not invite after failed profile lookup", async () => {
  read.mockResolvedValue({ data: null, error: { message: "unavailable" } });
  await expect(
    findOrCreateSupabaseUserByEmail("student@example.com"),
  ).rejects.toThrow("consultar");
  expect(invite).not.toHaveBeenCalled();
});
it("does not reactivate disabled profiles", async () => {
  read.mockResolvedValue({
    data: { id: "disabled", is_active: false },
    error: null,
  });
  await expect(
    findOrCreateSupabaseUserByEmail("student@example.com"),
  ).rejects.toThrow("desativada");
  expect(upsert).not.toHaveBeenCalled();
  expect(invite).not.toHaveBeenCalled();
});
it("returns existing active identity without Auth creation", async () => {
  read.mockResolvedValue({
    data: { id: "existing", is_active: true },
    error: null,
  });
  expect(await findOrCreateSupabaseUserByEmail("student@example.com")).toEqual({
    uid: "existing",
    isNewUser: false,
  });
  expect(invite).not.toHaveBeenCalled();
});
it("invites to trusted first access and preserves a concurrently provisioned role", async () => {
  read
    .mockResolvedValueOnce({ data: null, error: null })
    .mockResolvedValueOnce({
      data: { id: "new-user", is_active: true },
      error: null,
    });
  expect(
    await findOrCreateSupabaseUserByEmail(" STUDENT@example.com ", "Maria"),
  ).toEqual({ uid: "new-user", isNewUser: true });
  expect(invite).toHaveBeenCalledWith(
    "student@example.com",
    expect.objectContaining({
      redirectTo: "https://www.institutofiguraviva.com.br/auth/update-password",
    }),
  );
  expect(upsert).toHaveBeenCalledWith(
    expect.objectContaining({ role: "student" }),
    { onConflict: "id", ignoreDuplicates: true },
  );
});
it("reports partial failure after invitation", async () => {
  upsert.mockResolvedValue({ error: { message: "write failed" } });
  await expect(
    findOrCreateSupabaseUserByEmail("student@example.com"),
  ).rejects.toThrow("Convite solicitado");
});
it("checks invitation SDK errors", async () => {
  invite.mockResolvedValue({
    data: { user: null },
    error: { message: "SMTP" },
  });
  await expect(
    findOrCreateSupabaseUserByEmail("student@example.com"),
  ).rejects.toThrow("convite");
  expect(upsert).not.toHaveBeenCalled();
});

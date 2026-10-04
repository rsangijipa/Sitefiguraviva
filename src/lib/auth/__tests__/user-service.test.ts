const maybeSingle = jest.fn(),
  upsert = jest.fn(),
  update = jest.fn(),
  updateEq = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
      upsert,
      update,
    }),
  }),
}));
import { ensureUserDoc } from "../user-service";
describe("trusted profile bootstrap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    upsert.mockResolvedValue({ error: null });
    update.mockReturnValue({ eq: updateEq });
    updateEq.mockResolvedValue({ error: null });
  });
  it("creates only a student and never overwrites a concurrent existing profile", async () => {
    expect(
      (
        await ensureUserDoc({
          uid: "new-user",
          email: "liliangusmao@figuraviva.com",
        })
      ).success,
    ).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ role: "student" }),
      { onConflict: "id", ignoreDuplicates: true },
    );
  });
  it("preserves a provisioned role during login", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "admin-1", role: "admin", is_active: true },
      error: null,
    });
    await ensureUserDoc({ uid: "admin-1", email: "admin@example.com" });
    expect(update).toHaveBeenCalledWith({ last_login_at: expect.any(String) });
    expect(upsert).not.toHaveBeenCalled();
  });
  it("rejects disabled profiles and does not reactivate them", async () => {
    maybeSingle.mockResolvedValue({
      data: { role: "admin", is_active: false },
      error: null,
    });
    expect((await ensureUserDoc({ uid: "disabled-user" })).success).toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });
  it("does not claim success after database failures", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      maybeSingle.mockResolvedValueOnce({
        data: null,
        error: new Error("lookup failed"),
      });
      expect((await ensureUserDoc({ uid: "new-user" })).success).toBe(false);
      expect(upsert).not.toHaveBeenCalled();
      upsert.mockResolvedValueOnce({ error: new Error("insert failed") });
      expect((await ensureUserDoc({ uid: "new-user" })).success).toBe(false);
    } finally {
      log.mockRestore();
    }
  });
});

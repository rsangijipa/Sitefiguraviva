import {
  getBearerSupabaseSessionClaims,
  getSupabaseSessionClaims,
} from "@/lib/auth/supabase-session";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

const getUser = jest.fn();
const maybeSingle = jest.fn();
const eq = jest.fn(() => ({ maybeSingle }));
const select = jest.fn(() => ({ eq }));
const from = jest.fn(() => ({ select }));

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));

describe("Supabase session claims", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServiceClient as jest.Mock).mockReturnValue({
      auth: { getUser },
      from,
    });
  });

  it("maps a verified active profile to legacy-compatible claims", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "admin@figura.viva" } },
      error: null,
    });
    maybeSingle.mockResolvedValue({
      data: { role: "Administrador", is_active: true },
      error: null,
    });

    await expect(getSupabaseSessionClaims("valid-token")).resolves.toEqual({
      uid: "user-1",
      email: "admin@figura.viva",
      role: "administrador",
      admin: true,
      tutor: false,
      isActive: true,
    });
  });

  it("does not grant privileges to a disabled profile", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-2", email: "disabled@figura.viva" } },
      error: null,
    });
    maybeSingle.mockResolvedValue({
      data: { role: "admin", is_active: false },
      error: null,
    });

    await expect(getSupabaseSessionClaims("valid-token")).resolves.toBeNull();
  });

  it("does not elevate an allowlisted email or editable metadata", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-3",
          email: "liliangusmao@figuraviva.com",
          user_metadata: { role: "admin" },
        },
      },
      error: null,
    });
    maybeSingle.mockResolvedValue({
      data: { role: "student", is_active: true },
      error: null,
    });
    await expect(
      getSupabaseSessionClaims("valid-token"),
    ).resolves.toMatchObject({ role: "student", admin: false });
  });

  it("fails closed without a persisted active profile", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-4" } },
      error: null,
    });
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(getSupabaseSessionClaims("valid-token")).resolves.toBeNull();
    maybeSingle.mockResolvedValue({
      data: { role: "admin", is_active: null },
      error: null,
    });
    await expect(getSupabaseSessionClaims("valid-token")).resolves.toBeNull();
    maybeSingle.mockResolvedValue({
      data: { role: "admin", is_active: true },
      error: new Error("lookup failed"),
    });
    await expect(getSupabaseSessionClaims("valid-token")).resolves.toBeNull();
  });

  it("rejects requests without a bearer token before calling Supabase", async () => {
    const request = {
      headers: { get: jest.fn(() => "Basic abc") },
    } as unknown as Request;

    await expect(getBearerSupabaseSessionClaims(request)).resolves.toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });
});

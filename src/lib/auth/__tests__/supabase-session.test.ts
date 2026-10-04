import {
  getBearerSupabaseSessionClaims,
  getSupabaseSessionClaims,
} from "@/lib/auth/supabase-session";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

const rpc = jest.fn();
const sessionId = "00000000-0000-4000-8000-000000000001";
const token = `header.${Buffer.from(JSON.stringify({ session_id: sessionId })).toString("base64url")}.signature`;
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
    process.env.AUTH_SESSION_CHECK_MODE = "enforce";
    rpc.mockResolvedValue({ data: true, error: null });
    (createSupabaseServiceClient as jest.Mock).mockReturnValue({
      auth: { getUser },
      from,
      rpc,
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

    await expect(getSupabaseSessionClaims(token)).resolves.toEqual({
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

    await expect(getSupabaseSessionClaims(token)).resolves.toBeNull();
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
    await expect(getSupabaseSessionClaims(token)).resolves.toMatchObject({
      role: "student",
      admin: false,
    });
  });

  it("fails closed without a persisted active profile", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-4" } },
      error: null,
    });
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(getSupabaseSessionClaims(token)).resolves.toBeNull();
    maybeSingle.mockResolvedValue({
      data: { role: "admin", is_active: null },
      error: null,
    });
    await expect(getSupabaseSessionClaims(token)).resolves.toBeNull();
    maybeSingle.mockResolvedValue({
      data: { role: "admin", is_active: true },
      error: new Error("lookup failed"),
    });
    await expect(getSupabaseSessionClaims(token)).resolves.toBeNull();
  });

  it("rejects requests without a bearer token before calling Supabase", async () => {
    const request = {
      headers: { get: jest.fn(() => "Basic abc") },
    } as unknown as Request;

    await expect(getBearerSupabaseSessionClaims(request)).resolves.toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });
});

it("rejects revoked sessions and session verification failure", async () => {
  process.env.AUTH_SESSION_CHECK_MODE = "enforce";
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  rpc
    .mockResolvedValueOnce({ data: false, error: null })
    .mockResolvedValueOnce({ data: null, error: { message: "unavailable" } });
  expect(await getSupabaseSessionClaims(token)).toBeNull();
  expect(await getSupabaseSessionClaims(token)).toBeNull();
  expect(await getSupabaseSessionClaims("invalid-token")).toBeNull();
});

afterAll(() => {
  delete process.env.AUTH_SESSION_CHECK_MODE;
});

it("enforces session revocation by default when the mode is absent", async () => {
  jest.clearAllMocks();
  delete process.env.AUTH_SESSION_CHECK_MODE;
  (createSupabaseServiceClient as jest.Mock).mockReturnValue({
    auth: { getUser },
    from,
    rpc,
  });
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  rpc.mockResolvedValueOnce({ data: false, error: null });
  expect(await getSupabaseSessionClaims(token)).toBeNull();
  expect(rpc).toHaveBeenCalledWith("is_auth_session_active", {
    p_user: "user-1",
    p_session: sessionId,
  });
});

it("does not allow profile mode to bypass revocation in Vercel Production", async () => {
  const previousEnvironment = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";
  process.env.AUTH_SESSION_CHECK_MODE = "profile";
  try {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    rpc.mockResolvedValueOnce({ data: false, error: null });
    expect(await getSupabaseSessionClaims(token)).toBeNull();
  } finally {
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
    process.env.AUTH_SESSION_CHECK_MODE = "enforce";
  }
});

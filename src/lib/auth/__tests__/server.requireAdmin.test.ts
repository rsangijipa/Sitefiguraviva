import { requireAdmin, requireStaff, requireSession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn(() => ({
        value: `header.${Buffer.from(JSON.stringify({ session_id: "00000000-0000-4000-8000-000000000001" })).toString("base64url")}.signature`,
      })),
    }),
  ),
}));

const redirectMock = jest.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

jest.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

describe("server auth guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: true, error: null });
  });

  it("rejects a revoked session even for an active administrator", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({ data: false, error: null });
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth?next=/admin");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns normalized context when profile role is admin and active", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { role: "admin", is_active: true },
      }),
    });

    await expect(requireAdmin()).resolves.toEqual(
      expect.objectContaining({
        uid: "admin-1",
        role: "admin",
        isAdmin: true,
        isStaff: true,
      }),
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("allows staff access for tutors from Supabase profile", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "tutor-1", email: "tutor@example.com" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { role: "tutor", is_active: true },
      }),
    });

    await expect(requireStaff()).resolves.toEqual(
      expect.objectContaining({ uid: "tutor-1", role: "tutor", isStaff: true }),
    );
  });

  it("redirects forbidden when no admin role is present", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "student@example.com" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { role: "student", is_active: true },
      }),
    });

    await expect(requireAdmin()).rejects.toThrow(
      "REDIRECT:/portal?error=forbidden",
    );
  });

  it("rejects the session entirely when the profile is inactive", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-3", email: "admin@example.com" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { role: "admin", is_active: false },
      }),
    });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth?next=/admin");
    await expect(requireSession()).rejects.toThrow("REDIRECT:/auth");
  });

  it("redirects to auth when session is invalid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid session"),
    });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth?next=/admin");
  });
});

import { requireAdmin, requireStaff } from "@/lib/auth/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getUserByUid } from "@/lib/repositories/userRepository.server";

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn(() => ({ value: "valid-session-cookie" })),
    }),
  ),
}));

const redirectMock = jest.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

jest.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

jest.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifySessionCookie: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/userRepository.server", () => ({
  getUserByUid: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

describe("server auth guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserByUid as jest.Mock).mockResolvedValue(null);
  });

  it("returns normalized context when admin custom claim is true and active", async () => {
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "admin-1",
      admin: true,
      role: "student",
      isActive: true,
    });

    await expect(requireAdmin()).resolves.toEqual(
      expect.objectContaining({
        uid: "admin-1",
        admin: true,
        isAdmin: true,
        isStaff: true,
      }),
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("uses Firestore user role fallback when claims do not include admin", async () => {
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "admin-2",
      role: "student",
      isActive: true,
    });
    (getUserByUid as jest.Mock).mockResolvedValue({
      uid: "admin-2",
      role: "admin",
      isActive: true,
    });

    await expect(requireAdmin()).resolves.toEqual(
      expect.objectContaining({ uid: "admin-2", role: "admin", isAdmin: true }),
    );
  });

  it("allows staff access for tutors from Firestore fallback", async () => {
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "tutor-1",
      role: "student",
      isActive: true,
    });
    (getUserByUid as jest.Mock).mockResolvedValue({
      uid: "tutor-1",
      role: "tutor",
      isActive: true,
    });

    await expect(requireStaff()).resolves.toEqual(
      expect.objectContaining({ uid: "tutor-1", role: "tutor", isStaff: true }),
    );
  });

  it("redirects forbidden when no admin role is present", async () => {
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user-1",
      role: "student",
      isActive: true,
    });

    await expect(requireAdmin()).rejects.toThrow(
      "REDIRECT:/portal?error=forbidden",
    );
  });

  it("redirects forbidden when admin user is inactive", async () => {
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "admin-3",
      role: "admin",
      isActive: false,
    });

    await expect(requireAdmin()).rejects.toThrow(
      "REDIRECT:/portal?error=forbidden",
    );
  });

  it("redirects to auth when session is invalid", async () => {
    (adminAuth.verifySessionCookie as jest.Mock).mockRejectedValue(
      new Error("invalid session"),
    );

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth?next=/admin");
  });
});

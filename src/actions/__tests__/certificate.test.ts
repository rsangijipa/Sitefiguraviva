import { issueCertificate } from "@/actions/certificate";
import { auth } from "@/lib/firebase/admin";
import { CertificateIssuer } from "@/lib/certificates/issuer";

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name) => {
        if (name === "session") return { value: "valid-token" };
        return undefined;
      }),
    }),
  ),
}));

jest.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => "MOCK_TIMESTAMP"),
  },
}));

jest.mock("@/lib/certificates/issuer", () => ({
  CertificateIssuer: {
    issue: jest.fn(),
  },
}));

jest.mock("@/lib/firebase/admin", () => {
  const mockNotificationAdd = jest.fn().mockResolvedValue({ id: "notif_1" });

  const usersDoc = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ displayName: "Test Student" }),
    }),
    collection: jest.fn(() => ({
      add: mockNotificationAdd,
    })),
  };

  const coursesDoc = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ title: "Test Course" }),
    }),
  };

  return {
    auth: {
      verifySessionCookie: jest.fn(),
    },
    adminDb: {
      collection: jest.fn((name: string) => ({
        doc: jest.fn(() => {
          if (name === "users") return usersDoc;
          if (name === "courses") return coursesDoc;
          return {
            get: jest
              .fn()
              .mockResolvedValue({ exists: false, data: () => ({}) }),
          };
        }),
      })),
    },
  };
});

describe("issueCertificate action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when no session cookie is present", async () => {
    const { cookies } = require("next/headers");
    (cookies as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        get: jest.fn(() => undefined),
      }),
    );

    const result = await issueCertificate("course1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("propagates issuer errors", async () => {
    (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user123",
      role: "student",
    });
    (CertificateIssuer.issue as jest.Mock).mockResolvedValue({
      success: false,
      error: "PROGRESS_INCOMPLETE",
      details: { required: 10, completed: 8 },
    });

    const result = await issueCertificate("course1");

    expect(result).toEqual({
      error: "PROGRESS_INCOMPLETE",
      details: { required: 10, completed: 8 },
    });
  });

  it("returns success payload when issuer succeeds", async () => {
    (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user123",
      role: "student",
    });
    (CertificateIssuer.issue as jest.Mock).mockResolvedValue({
      success: true,
      certificateId: "cert_123",
      verificationCode: "FV-26-ABC123",
    });

    const result = await issueCertificate("course1");

    expect(result).toEqual({
      success: true,
      certificateId: "cert_123",
      certificateNumber: "FV-26-ABC123",
    });
    expect(CertificateIssuer.issue).toHaveBeenCalledWith(
      "course1",
      "user123",
      "user123",
      false,
    );
  });
});

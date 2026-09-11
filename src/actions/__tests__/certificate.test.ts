import { issueCertificate } from "@/actions/certificate";
import { verifySession } from "@/lib/auth/server";
import { issueCertificateSupabase } from "@/features/certificates/infrastructure/supabaseCertificateIssuer.server";

jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
}));

jest.mock(
  "@/features/certificates/infrastructure/supabaseCertificateIssuer.server",
  () => ({
    issueCertificateSupabase: jest.fn(),
  }),
);
jest.mock(
  "@/features/notifications/infrastructure/supabaseNotificationRepository.server",
  () => ({
    createNotification: jest.fn().mockResolvedValue("notification-1"),
  }),
);
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(() => ({})),
}));

describe("issueCertificate action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when no session cookie is present", async () => {
    (verifySession as jest.Mock).mockResolvedValueOnce(null);

    const result = await issueCertificate("course1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("propagates issuer errors", async () => {
    (verifySession as jest.Mock).mockResolvedValue({
      uid: "user123",
      role: "student",
    });
    (issueCertificateSupabase as jest.Mock).mockResolvedValue({
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
    (verifySession as jest.Mock).mockResolvedValue({
      uid: "user123",
      role: "student",
    });
    (issueCertificateSupabase as jest.Mock).mockResolvedValue({
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
    expect(issueCertificateSupabase).toHaveBeenCalledWith(
      "course1",
      "user123",
      "user123",
      false,
    );
  });
});

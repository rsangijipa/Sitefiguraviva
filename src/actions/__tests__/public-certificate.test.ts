/** @jest-environment node */
const rpc = jest.fn();
const result = jest.fn();
const service = jest.fn();
const limit = jest.fn();
jest.mock("server-only", () => ({}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAnonServerClient: () => ({ rpc }),
  createSupabaseServiceClient: () => service(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => limit(...args),
  getClientIdentifier: () => "test",
}));
jest.mock("@/lib/auth/server", () => ({ verifySession: jest.fn() }));
jest.mock(
  "@/features/notifications/infrastructure/supabaseNotificationRepository.server",
  () => ({ createNotification: jest.fn() }),
);
jest.mock(
  "@/features/certificates/infrastructure/supabaseCertificateRepository.server",
  () => ({ getCertificate: jest.fn(), getUserCertificates: jest.fn() }),
);
jest.mock(
  "@/features/certificates/infrastructure/supabaseCertificateIssuer.server",
  () => ({ issueCertificateSupabase: jest.fn() }),
);
import { renderToStaticMarkup } from "react-dom/server";
import { verifyCertificate } from "../certificate";
import CertificatePage from "@/app/certificado/[code]/page";
import VerifyPage from "@/app/certificates/verify/[code]/page";
beforeEach(() => {
  jest.clearAllMocks();
  rpc.mockReturnValue({ maybeSingle: result });
  limit.mockResolvedValue({ allowed: true });
});
it("verifies through the minimal public RPC", async () => {
  const certificate = {
    code: "FV-ABC123",
    issued_at: "2026-10-05",
    metadata: { studentName: "Aluno" },
  };
  result.mockResolvedValue({ data: certificate, error: null });
  expect(await verifyCertificate("FV-ABC123")).toEqual({
    valid: true,
    certificate,
  });
  expect(rpc).toHaveBeenCalledWith("verify_public_certificate", {
    p_code: "FV-ABC123",
  });
  expect(service).not.toHaveBeenCalled();
});
it.each([
  { data: null, error: null },
  { data: { code: "SECRET" }, error: new Error("private error") },
])(
  "handles missing or failed lookups without leaking details",
  async (response) => {
    result.mockResolvedValue(response);
    expect(await verifyCertificate("invalid")).toEqual({
      valid: false,
      message: "Certificado não encontrado",
    });
    for (const Page of [CertificatePage, VerifyPage]) {
      const html = renderToStaticMarkup(
        await Page({ params: Promise.resolve({ code: "invalid" }) }),
      );
      expect(html).toMatch(/Inválido|não foi encontrado/);
      expect(html).not.toContain("private error");
      expect(html).not.toContain("SECRET");
    }
    expect(service).not.toHaveBeenCalled();
  },
);
it("does not query when verification is rate limited", async () => {
  limit.mockResolvedValue({ allowed: false });
  expect((await verifyCertificate("FV-ABC123")).valid).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});

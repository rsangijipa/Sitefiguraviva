/** @jest-environment node */
import { NextRequest } from "next/server";
import sharp from "sharp";
const claims = jest.fn(),
  limit = jest.fn(),
  read = jest.fn(),
  upload = jest.fn();
jest.mock("@/lib/auth/supabase-session", () => ({
  getSupabaseSessionClaims: () => claims(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: () => limit(),
  getClientIdentifier: () => "student",
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ eq: () => ({ in: () => ({ maybeSingle: read }) }) }),
      }),
    }),
    storage: { from: () => ({ upload }) },
  }),
}));
import { POST } from "../route";
const submissionId = "11111111-1111-4111-8111-111111111111";
function request(content: Buffer, type = "image/jpeg", name = "answer.jpg") {
  const form = new FormData();
  form.set("submissionId", submissionId);
  form.set("answerId", "question_1");
  form.set("file", new Blob([new Uint8Array(content)], { type }), name);
  return new NextRequest("https://example.com/api/assessment-files", {
    method: "POST",
    body: form,
    headers: { Cookie: "session=verified-token" },
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  claims.mockResolvedValue({ uid: "student", isActive: true });
  limit.mockResolvedValue({ allowed: true });
  read.mockResolvedValue({ data: { id: submissionId }, error: null });
  upload.mockResolvedValue({ error: null });
});
it("compresses image evidence while preserving format and reporting stored size", async () => {
  const image = await sharp({
    create: { width: 3000, height: 2000, channels: 3, background: "#285936" },
  })
    .jpeg({ quality: 100 })
    .toBuffer();
  const response = await POST(request(image));
  expect(response.status).toBe(201);
  const result = await response.json();
  const stored = upload.mock.calls[0][1];
  expect(result.size).toBe(stored.length);
  expect(result.mimeType).toBe("image/jpeg");
  expect(stored.length).toBeLessThan(image.length);
  expect((await sharp(stored).metadata()).width).toBe(2560);
  expect(upload.mock.calls[0][2]).toEqual({
    contentType: "image/jpeg",
    upsert: false,
  });
});
it("rejects corrupt image content and does not store raw bytes", async () => {
  expect((await POST(request(Buffer.from("<html>")))).status).toBe(400);
  expect(upload).not.toHaveBeenCalled();
});
it("keeps non-image attachments unchanged", async () => {
  const pdf = Buffer.from("%PDF-1.7 fixture");
  const response = await POST(request(pdf, "application/pdf", "answer.pdf"));
  expect(response.status).toBe(201);
  expect(upload.mock.calls[0][1]).toEqual(pdf);
  expect((await response.json()).size).toBe(pdf.length);
});
it("checks submission ownership before processing or uploading", async () => {
  read.mockResolvedValue({ data: null, error: null });
  expect((await POST(request(Buffer.from("x")))).status).toBe(404);
  expect(upload).not.toHaveBeenCalled();
});

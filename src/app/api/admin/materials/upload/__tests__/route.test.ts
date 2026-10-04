/** @jest-environment node */
import { NextRequest } from "next/server";
const claims = jest.fn(),
  limit = jest.fn(),
  read = jest.fn(),
  upload = jest.fn(),
  bucket = jest.fn();
jest.mock("@/lib/auth/supabase-session", () => ({
  getBearerSupabaseSessionClaims: () => claims(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: () => limit(),
  RateLimitPresets: { CREATE_EVENT: {} },
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: read }) }) }),
    storage: { from: (...args: unknown[]) => bucket(...args) },
  }),
}));
import { POST } from "../route";
function req(
  content = "%PDF-1.7 fixture",
  type = "application/pdf",
  course = "c",
) {
  const form = new FormData();
  form.set("courseId", course);
  form.set("file", new Blob([content], { type }), "file.pdf");
  return new NextRequest("https://example.com/api/admin/materials/upload", {
    method: "POST",
    body: form,
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  claims.mockResolvedValue({ uid: "admin", isActive: true, admin: true });
  limit.mockResolvedValue({ allowed: true });
  read.mockResolvedValue({ data: { id: "c" }, error: null });
  bucket.mockReturnValue({ upload });
  upload.mockResolvedValue({ error: null });
});
it.each([null, { isActive: false, admin: true }])(
  "requires active identity",
  async (identity) => {
    claims.mockResolvedValue(identity);
    expect((await POST(req())).status).toBe(401);
    expect(upload).not.toHaveBeenCalled();
  },
);
it("requires administrator before upload", async () => {
  claims.mockResolvedValue({ uid: "student", isActive: true, admin: false });
  expect((await POST(req())).status).toBe(403);
  expect(read).not.toHaveBeenCalled();
});
it("checks rate limit", async () => {
  limit.mockResolvedValue({ allowed: false });
  expect((await POST(req())).status).toBe(429);
});
it.each([
  ["<html>", "application/pdf"],
  ["%PDF-1.7", "image/png"],
])("validates MIME and file signature", async (content, type) => {
  expect((await POST(req(content, type))).status).toBe(400);
  expect(upload).not.toHaveBeenCalled();
});
it("bounds streamed body before form parsing", async () => {
  const res = await POST(
    new NextRequest("https://example.com/api/admin/materials/upload", {
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=test" },
      body: new Uint8Array(10 * 1024 * 1024 + 20000),
    }),
  );
  expect(res.status).toBe(413);
  expect(upload).not.toHaveBeenCalled();
});
it("rejects nonexistent course", async () => {
  read.mockResolvedValue({ data: null, error: null });
  expect((await POST(req())).status).toBe(404);
  expect(upload).not.toHaveBeenCalled();
});
it("returns only canonical reference with no public URL", async () => {
  const res = await POST(req());
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({ url: "", bucket: "course-materials" });
  expect(bucket).toHaveBeenCalledWith("course-materials");
  expect(upload).toHaveBeenCalledWith(
    expect.stringMatching(/^courses\/c\/materials\/[0-9a-f-]+\.pdf$/),
    expect.anything(),
    { contentType: "application/pdf", upsert: false, cacheControl: "0" },
  );
});
it("reports SDK upload error without claiming success", async () => {
  upload.mockResolvedValue({ error: { message: "storage failure" } });
  expect((await POST(req())).status).toBe(400);
});
it("does not upload when shared protection is unavailable", async () => {
  const unavailable = new Error("unavailable");
  unavailable.name = "RateLimitUnavailableError";
  limit.mockRejectedValue(unavailable);
  expect((await POST(req())).status).toBe(503);
  expect(upload).not.toHaveBeenCalled();
});

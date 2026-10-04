/** @jest-environment node */
import { NextRequest } from "next/server";
const claims = jest.fn(),
  limit = jest.fn(),
  read = jest.fn(),
  upload = jest.fn(),
  remove = jest.fn(),
  rpc = jest.fn();
jest.mock("@/lib/auth/supabase-session", () => ({
  getBearerSupabaseSessionClaims: () => claims(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: () => limit(),
  RateLimitPresets: { APPLICATION_SUBMIT: {} },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: read }) }) }),
    }),
    storage: { from: () => ({ upload, remove }) },
    rpc,
  }),
}));
import { POST } from "../route";
const orderId = "11111111-1111-4111-8111-111111111111";
function request(
  content = "%PDF-1.7 fixture",
  type = "application/pdf",
  order = orderId,
) {
  const form = new FormData();
  form.set("orderId", order);
  form.set("receipt", new Blob([content], { type }), "file.pdf");
  return new NextRequest("https://example.com/api/pix/receipt", {
    method: "POST",
    body: form,
  });
}
describe("private Pix receipt upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    claims.mockResolvedValue({ uid: "verified-user", isActive: true });
    limit.mockResolvedValue({ allowed: true });
    read.mockResolvedValue({
      data: { id: orderId, status: "pending", course_id: "course-a" },
      error: null,
    });
    upload.mockResolvedValue({ error: null });
    remove.mockResolvedValue({ error: null });
    rpc.mockResolvedValue({ error: null });
  });
  it("requires an active identity and rate limit allowance", async () => {
    claims.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    claims.mockResolvedValue({ uid: "user", isActive: true });
    limit.mockResolvedValue({ allowed: false });
    expect((await POST(request())).status).toBe(429);
    expect(upload).not.toHaveBeenCalled();
  });
  it("rejects renamed HTML or mismatched MIME types", async () => {
    expect((await POST(request("<html>"))).status).toBe(400);
    expect((await POST(request("%PDF-1.7", "image/png"))).status).toBe(400);
    expect(upload).not.toHaveBeenCalled();
  });
  it("rejects oversized streamed bodies", async () => {
    expect(
      (
        await POST(
          new NextRequest("https://example.com/api/pix/receipt", {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data; boundary=fixture",
            },
            body: new Uint8Array(5 * 1024 * 1024 + 20000),
          }),
        )
      ).status,
    ).toBe(413);
    expect(upload).not.toHaveBeenCalled();
  });
  it("does not upload for another user's or finalized order", async () => {
    read.mockResolvedValue({ data: null, error: null });
    expect((await POST(request())).status).toBe(404);
    read.mockResolvedValue({ data: { status: "paid" }, error: null });
    expect((await POST(request())).status).toBe(409);
    expect(upload).not.toHaveBeenCalled();
  });
  it("stores a randomized private path and declares without approval", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(
        /^verified-user\/11111111-1111-4111-8111-111111111111\/[0-9a-f-]+\.pdf$/,
      ),
      expect.anything(),
      { contentType: "application/pdf", upsert: false },
    );
    expect(rpc).toHaveBeenCalledWith(
      "submit_manual_pix_receipt",
      expect.objectContaining({ p_user: "verified-user", p_order: orderId }),
    );
    expect(JSON.stringify(await response.json())).not.toMatch(
      /http|receipt_path/,
    );
  });
  it("cleans the private object when recording the declaration fails", async () => {
    rpc.mockResolvedValue({ error: { message: "race with approval" } });
    expect((await POST(request())).status).toBe(400);
    expect(remove).toHaveBeenCalledWith([expect.any(String)]);
  });
  it("does not accept receipt when shared protection is unavailable", async () => {
    limit.mockRejectedValue(new Error("unavailable"));
    expect((await POST(request())).status).toBe(503);
    expect(upload).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});

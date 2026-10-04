/** @jest-environment node */
import { NextRequest } from "next/server";
import sharp from "sharp";
const claims = jest.fn(),
  limit = jest.fn(),
  upload = jest.fn(),
  from = jest.fn();
jest.mock("@/lib/auth/supabase-session", () => ({
  getBearerSupabaseSessionClaims: () => claims(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: () => limit(),
  RateLimitUnavailableError: class extends Error {},
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ storage: { from } }),
}));
import { POST } from "../route";

async function request(
  overrides: {
    bucket?: string;
    folder?: string;
    content?: Buffer;
    type?: string;
  } = {},
) {
  const content =
    overrides.content ??
    (await sharp({
      create: {
        width: 2600,
        height: 1600,
        channels: 4,
        background: { r: 20, g: 90, b: 30, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer());
  const form = new FormData();
  form.set(
    "file",
    new Blob([new Uint8Array(content)], {
      type: overrides.type ?? "image/png",
    }),
    "capa.png",
  );
  form.set("bucket", overrides.bucket ?? "course-assets");
  form.set("folder", overrides.folder ?? "uploads/admin");
  return new NextRequest("https://example.com/api/admin/images/upload", {
    method: "POST",
    body: form,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  claims.mockResolvedValue({ uid: "admin", isActive: true, admin: true });
  limit.mockResolvedValue({ allowed: true });
  upload.mockResolvedValue({ error: null });
  from.mockReturnValue({
    upload,
    getPublicUrl: (path: string) => ({
      data: { publicUrl: `https://example.com/${path}` },
    }),
  });
});

it("requires an active administrator", async () => {
  claims.mockResolvedValue(null);
  expect(
    (await POST(await request({ content: Buffer.from("x") }))).status,
  ).toBe(401);
  claims.mockResolvedValue({ uid: "student", isActive: true, admin: false });
  expect(
    (await POST(await request({ content: Buffer.from("x") }))).status,
  ).toBe(403);
  expect(upload).not.toHaveBeenCalled();
});

it("compresses actual bytes before storing with the correct extension, MIME and metadata", async () => {
  const response = await POST(await request());
  expect(response.status).toBe(201);
  const result = await response.json();
  expect(result.bytes).toBeLessThan(result.originalBytes);
  expect(result.width).toBe(2048);
  expect(result.path).toMatch(/^uploads\/admin\/[0-9a-f-]+-capa\.webp$/);
  expect(result.name).toBe("capa.webp");
  expect(from).toHaveBeenCalledWith("course-assets");
  const stored = upload.mock.calls[0][1];
  expect(stored.length).toBe(result.bytes);
  expect((await sharp(stored).metadata()).format).toBe("webp");
  expect(upload.mock.calls[0][2]).toEqual({
    contentType: "image/webp",
    cacheControl: "3600",
    upsert: false,
  });
});

it.each(["public-avatars", "public-book-covers"])(
  "supports the existing %s bucket",
  async (bucket) => {
    expect((await POST(await request({ bucket }))).status).toBe(201);
    expect(from).toHaveBeenCalledWith(bucket);
  },
);

it.each([
  { bucket: "pix-receipts" },
  { bucket: "assessment-submissions" },
  { folder: "../private" },
  { folder: "courses/id/materials" },
  { folder: "courses/id/materials/images" },
])("rejects arbitrary or private destinations: %j", async (override) => {
  expect(
    (await POST(await request({ ...override, content: Buffer.from("x") })))
      .status,
  ).toBe(400);
  expect(upload).not.toHaveBeenCalled();
});

it("rejects MIME spoofing and corrupt files without storing raw input", async () => {
  expect(
    (
      await POST(
        await request({ content: Buffer.from("<html>"), type: "image/jpeg" }),
      )
    ).status,
  ).toBe(400);
  expect((await POST(await request({ type: "image/jpeg" }))).status).toBe(400);
  expect(upload).not.toHaveBeenCalled();
});

it("limits the streamed request body", async () => {
  const req = new NextRequest("https://example.com/api/admin/images/upload", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=fixture" },
    body: new Uint8Array(5 * 1024 * 1024 + 20000),
  });
  expect((await POST(req)).status).toBe(413);
  expect(upload).not.toHaveBeenCalled();
});

it("enforces the upload rate limit", async () => {
  limit.mockResolvedValue({ allowed: false });
  expect(
    (await POST(await request({ content: Buffer.from("x") }))).status,
  ).toBe(429);
  expect(upload).not.toHaveBeenCalled();
});

it("does not return a successful URL when storage fails", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  upload.mockResolvedValue({ error: new Error("storage down") });
  expect((await POST(await request())).status).toBe(500);
  jest.restoreAllMocks();
});

/** @jest-environment node */
import { NextRequest } from "next/server";
const verify = jest.fn(),
  rpc = jest.fn(),
  sign = jest.fn(),
  from = jest.fn();
jest.mock("@/lib/auth/server", () => ({ verifySession: () => verify() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc,
    storage: { from: (...args: unknown[]) => from(...args) },
  }),
}));
import { GET } from "../route";
const row = {
  type: "pdf",
  url: "",
  course_id: "c",
  storage_bucket: "course-materials",
  storage_path: "courses/c/materials/11111111-1111-4111-8111-111111111111.pdf",
};
const req = () =>
  new NextRequest("https://example.com/api/materials/material?p_user=admin");
const get = () =>
  GET(req(), { params: Promise.resolve({ materialId: "material" }) });
beforeEach(() => {
  jest.clearAllMocks();
  verify.mockResolvedValue({ uid: "actual-session" });
  rpc.mockResolvedValue({ data: row, error: null });
  from.mockReturnValue({ createSignedUrl: sign });
  sign.mockResolvedValue({
    data: { signedUrl: "https://storage.example.com/signed" },
    error: null,
  });
});
it("uses verified identity, short expiration and no cache", async () => {
  const res = await get();
  expect(res.status).toBe(302);
  expect(rpc).toHaveBeenCalledWith("resolve_course_material", {
    p_user: "actual-session",
    p_material: "material",
  });
  expect(from).toHaveBeenCalledWith("course-materials");
  expect(sign).toHaveBeenCalledWith(row.storage_path, 60, { download: true });
  expect(res.headers.get("cache-control")).toBe("private, no-store");
  expect(res.headers.get("referrer-policy")).toBe("no-referrer");
});
it("denies missing session before database", async () => {
  verify.mockResolvedValue(null);
  expect((await get()).status).toBe(401);
  expect(rpc).not.toHaveBeenCalled();
});
it.each([
  { data: null, error: null },
  { data: null, error: { message: "permission denied" } },
])("does not sign forbidden or missing material", async (result) => {
  rpc.mockResolvedValue(result);
  expect((await get()).status).toBe(404);
  expect(sign).not.toHaveBeenCalled();
});
it("does not fall back to an old public PDF", async () => {
  rpc.mockResolvedValue({
    data: {
      ...row,
      storage_bucket: null,
      storage_path: null,
      url: "https://example.com/file.pdf",
    },
    error: null,
  });
  expect((await get()).status).toBe(409);
  expect(sign).not.toHaveBeenCalled();
});
it("rejects cross-course references", async () => {
  rpc.mockResolvedValue({
    data: { ...row, storage_path: row.storage_path.replace("/c/", "/other/") },
    error: null,
  });
  expect((await get()).status).toBe(409);
  expect(sign).not.toHaveBeenCalled();
});
it("fails closed when signing fails", async () => {
  sign.mockResolvedValue({
    data: null,
    error: { message: "Storage unavailable" },
  });
  expect((await get()).status).toBe(404);
});
it.each([
  "javascript:alert(1)",
  "http://example.com",
  "https://user:password@example.com",
])("rejects unsafe external link %s", async (url) => {
  rpc.mockResolvedValue({
    data: {
      ...row,
      type: "link",
      url,
      storage_bucket: null,
      storage_path: null,
    },
    error: null,
  });
  expect((await get()).status).toBe(404);
});
it("authorizes an external link before redirect", async () => {
  rpc.mockResolvedValue({
    data: {
      ...row,
      type: "link",
      url: "https://example.com/resource",
      storage_bucket: null,
      storage_path: null,
    },
    error: null,
  });
  const res = await get();
  expect(res.status).toBe(302);
  expect(res.headers.get("location")).toBe("https://example.com/resource");
  expect(sign).not.toHaveBeenCalled();
});

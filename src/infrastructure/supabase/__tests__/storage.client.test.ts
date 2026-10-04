jest.mock("../client", () => ({ createSupabaseBrowserClient: jest.fn() }));
import { createSupabaseBrowserClient } from "../client";
import { uploadAdminAsset } from "../storage.client";
const client = jest.mocked(createSupabaseBrowserClient);
const fetchUpload = jest.fn();
const upload = jest.fn();
const from = jest.fn();
const getSession = jest.fn();
const imageOptions = {
  kind: "image" as const,
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ["image/jpeg"],
};
const image = () => new File(["cover"], "cover.jpg", { type: "image/jpeg" });

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchUpload;
  getSession.mockResolvedValue({
    data: { session: { access_token: "verified-token" } },
    error: null,
  });
  client.mockReturnValue({
    auth: { getSession },
    storage: { from },
  } as unknown as ReturnType<typeof createSupabaseBrowserClient>);
  fetchUpload.mockResolvedValue({
    ok: true,
    json: async () => ({
      url: "https://example.com/cover.webp",
      path: "uploads/admin/uuid-cover.webp",
      name: "cover.webp",
      size: "1 KB",
    }),
  });
});

it("sends images to the authenticated compression API, including generic image uploads", async () => {
  for (const kind of ["image", "generic"] as const) {
    const result = await uploadAdminAsset(image(), {
      ...imageOptions,
      kind,
      folder: "mediators",
      bucket: "public-avatars",
    });
    expect(result.path).toMatch(/\.webp$/);
  }
  expect(fetchUpload).toHaveBeenCalledWith(
    "/api/admin/images/upload",
    expect.objectContaining({
      method: "POST",
      headers: { Authorization: "Bearer verified-token" },
    }),
  );
  const form = fetchUpload.mock.calls[0][1].body as FormData;
  expect(form.get("file")).toBeInstanceOf(File);
  expect(form.get("bucket")).toBe("public-avatars");
  expect(form.get("folder")).toBe("mediators");
  expect(from).not.toHaveBeenCalled();
});

it("propagates API errors and does not fall back to raw storage uploads", async () => {
  fetchUpload.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Imagem inválida." }),
  });
  await expect(uploadAdminAsset(image(), imageOptions)).rejects.toThrow(
    "Imagem inválida.",
  );
  expect(from).not.toHaveBeenCalled();
});

it("requires a session before sending images", async () => {
  getSession.mockResolvedValue({ data: { session: null }, error: null });
  await expect(uploadAdminAsset(image(), imageOptions)).rejects.toThrow(
    "Faça login novamente.",
  );
  expect(fetchUpload).not.toHaveBeenCalled();
});

it("rejects oversized and unsupported inputs before sending", async () => {
  await expect(
    uploadAdminAsset(image(), { ...imageOptions, maxBytes: 2 }),
  ).rejects.toThrow("máximo 2 B");
  await expect(
    uploadAdminAsset(
      new File(["oops"], "file.txt", { type: "text/plain" }),
      imageOptions,
    ),
  ).rejects.toThrow("Apenas arquivos de imagem");
  expect(fetchUpload).not.toHaveBeenCalled();
});

it("keeps public PDF uploads unchanged", async () => {
  upload.mockResolvedValue({ error: null });
  from.mockReturnValue({
    upload,
    getPublicUrl: () => ({
      data: { publicUrl: "https://example.com/guide.pdf" },
    }),
  });
  await expect(
    uploadAdminAsset(
      new File(["%PDF"], "guide.pdf", { type: "application/pdf" }),
      { kind: "pdf", maxBytes: 1024, mimeTypes: ["application/pdf"] },
    ),
  ).resolves.toMatchObject({ name: "guide.pdf", size: "4 B" });
  expect(upload).toHaveBeenCalled();
  expect(fetchUpload).not.toHaveBeenCalled();
});

it("rejects private destinations", async () => {
  await expect(
    uploadAdminAsset(image(), { ...imageOptions, bucket: "pix-receipts" }),
  ).rejects.toThrow("Materiais privados");
  await expect(
    uploadAdminAsset(image(), {
      ...imageOptions,
      folder: "courses/id/materials/cover",
    }),
  ).rejects.toThrow("Materiais privados");
  expect(fetchUpload).not.toHaveBeenCalled();
});

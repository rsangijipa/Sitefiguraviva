jest.mock("../client", () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

import { createSupabaseBrowserClient } from "../client";
import { uploadAdminAsset } from "../storage.client";

const mockedCreateSupabaseBrowserClient = jest.mocked(
  createSupabaseBrowserClient,
);

describe("uploadAdminAsset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads a valid admin image to Supabase storage and returns the public url", async () => {
    const upload = jest.fn().mockResolvedValue({
      data: { path: "uploads/admin/cover.jpg" },
      error: null,
    });
    const getPublicUrl = jest.fn().mockReturnValue({
      data: {
        publicUrl:
          "https://project.supabase.co/storage/v1/object/public/uploads/uploads/admin/cover.jpg",
      },
    });
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    mockedCreateSupabaseBrowserClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    await expect(
      uploadAdminAsset(
        new File(["cover"], "cover.jpg", { type: "image/jpeg" }),
        {
          folder: "uploads/admin",
          maxBytes: 5 * 1024 * 1024,
          mimeTypes: ["image/jpeg"],
        },
      ),
    ).resolves.toEqual({
      url: "https://project.supabase.co/storage/v1/object/public/uploads/uploads/admin/cover.jpg",
      path: "uploads/admin/cover.jpg",
      name: "cover.jpg",
      size: "5 B",
    });

    expect(from).toHaveBeenCalledWith("uploads");
    expect(upload).toHaveBeenCalledWith(
      "uploads/admin/cover.jpg",
      expect.any(File),
      { cacheControl: "3600", upsert: true },
    );
    expect(getPublicUrl).toHaveBeenCalledWith("uploads/admin/cover.jpg");
  });

  it("rejects a file larger than the configured limit before uploading", async () => {
    const upload = jest.fn();
    const getPublicUrl = jest.fn();
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    mockedCreateSupabaseBrowserClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    await expect(
      uploadAdminAsset(
        new File([new Uint8Array(6)], "cover.jpg", { type: "image/jpeg" }),
        {
          folder: "uploads/admin",
          kind: "image",
          maxBytes: 5,
          mimeTypes: ["image/jpeg"],
        },
      ),
    ).rejects.toThrow("A imagem deve ter no máximo 5 B.");

    expect(upload).not.toHaveBeenCalled();
    expect(getPublicUrl).not.toHaveBeenCalled();
  });

  it("rejects a file with an unsupported mime type before uploading", async () => {
    const upload = jest.fn();
    const getPublicUrl = jest.fn();
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    mockedCreateSupabaseBrowserClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    await expect(
      uploadAdminAsset(
        new File(["oops"], "cover.txt", { type: "text/plain" }),
        {
          folder: "uploads/admin",
          maxBytes: 5 * 1024 * 1024,
          mimeTypes: ["image/jpeg"],
        },
      ),
    ).rejects.toThrow("Apenas arquivos image/jpeg são permitidos.");

    expect(upload).not.toHaveBeenCalled();
    expect(getPublicUrl).not.toHaveBeenCalled();
  });
});

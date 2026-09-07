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
    jest.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1");

    const upload = jest.fn().mockResolvedValue({
      data: { path: "uploads/admin/uuid-1-cover.jpg" },
      error: null,
    });
    const getPublicUrl = jest.fn().mockReturnValue({
      data: {
        publicUrl:
          "https://project.supabase.co/storage/v1/object/public/uploads/uploads/admin/uuid-1-cover.jpg",
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
      url: "https://project.supabase.co/storage/v1/object/public/uploads/uploads/admin/uuid-1-cover.jpg",
      path: "uploads/admin/uuid-1-cover.jpg",
      name: "cover.jpg",
      size: "5 B",
    });

    expect(from).toHaveBeenCalledWith("uploads");
    expect(upload).toHaveBeenCalledWith(
      "uploads/admin/uuid-1-cover.jpg",
      expect.any(File),
      { cacheControl: "3600", upsert: true },
    );
    expect(getPublicUrl).toHaveBeenCalledWith("uploads/admin/uuid-1-cover.jpg");
    jest.restoreAllMocks();
  });

  it("generates distinct object paths for repeated uploads of the same file name", async () => {
    const randomUUID = jest
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("uuid-a")
      .mockReturnValueOnce("uuid-b");

    const upload = jest.fn().mockResolvedValue({
      data: { path: "uploads/admin/uuid-a-cover.jpg" },
      error: null,
    });
    const getPublicUrl = jest.fn().mockImplementation((path: string) => ({
      data: {
        publicUrl: `https://project.supabase.co/storage/v1/object/public/uploads/${path}`,
      },
    }));
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    mockedCreateSupabaseBrowserClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    const first = uploadAdminAsset(
      new File(["cover"], "cover.jpg", { type: "image/jpeg" }),
      {
        folder: "uploads/admin",
        kind: "image",
        maxBytes: 5 * 1024 * 1024,
        mimeTypes: ["image/jpeg"],
      },
    );
    const second = uploadAdminAsset(
      new File(["cover"], "cover.jpg", { type: "image/jpeg" }),
      {
        folder: "uploads/admin",
        kind: "image",
        maxBytes: 5 * 1024 * 1024,
        mimeTypes: ["image/jpeg"],
      },
    );

    await expect(first).resolves.toMatchObject({
      path: "uploads/admin/uuid-a-cover.jpg",
    });
    await expect(second).resolves.toMatchObject({
      path: "uploads/admin/uuid-b-cover.jpg",
    });

    expect(upload).toHaveBeenNthCalledWith(
      1,
      "uploads/admin/uuid-a-cover.jpg",
      expect.any(File),
      { cacheControl: "3600", upsert: true },
    );
    expect(upload).toHaveBeenNthCalledWith(
      2,
      "uploads/admin/uuid-b-cover.jpg",
      expect.any(File),
      { cacheControl: "3600", upsert: true },
    );
    expect(randomUUID).toHaveBeenCalledTimes(2);
    jest.restoreAllMocks();
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

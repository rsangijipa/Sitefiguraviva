jest.mock("../server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));

import { createSupabaseServiceClient } from "../server";
import {
  deleteStorageObject,
  uploadPublicCourseAsset,
} from "../storage.server";

const mockedCreateSupabaseServiceClient = jest.mocked(
  createSupabaseServiceClient,
);

describe("uploadPublicCourseAsset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads a public course asset with a stable public URL", async () => {
    const upload = jest.fn().mockResolvedValue({
      data: { path: "courses/co-visar/capa.jpeg" },
      error: null,
    });
    const getPublicUrl = jest.fn().mockReturnValue({
      data: {
        publicUrl:
          "https://project.supabase.co/storage/v1/object/public/course-assets/courses/co-visar/capa.jpeg",
      },
    });
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    mockedCreateSupabaseServiceClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseServiceClient>);

    await expect(
      uploadPublicCourseAsset({
        path: "courses/co-visar/capa.jpeg",
        body: Buffer.from("cover"),
        contentType: "image/jpeg",
      }),
    ).resolves.toBe(
      "https://project.supabase.co/storage/v1/object/public/course-assets/courses/co-visar/capa.jpeg",
    );

    expect(from).toHaveBeenCalledWith("course-assets");
    expect(upload).toHaveBeenCalledWith(
      "courses/co-visar/capa.jpeg",
      Buffer.from("cover"),
      { contentType: "image/jpeg", upsert: true },
    );
    expect(getPublicUrl).toHaveBeenCalledWith("courses/co-visar/capa.jpeg");
  });

  it("rejects with the storage error before producing a public URL", async () => {
    const storageError = new Error("upload failed");
    const upload = jest.fn().mockResolvedValue({
      data: null,
      error: storageError,
    });
    const getPublicUrl = jest.fn();
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    mockedCreateSupabaseServiceClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseServiceClient>);

    await expect(
      uploadPublicCourseAsset({
        path: "courses/co-visar/capa.jpeg",
        body: Buffer.from("cover"),
        contentType: "image/jpeg",
      }),
    ).rejects.toBe(storageError);
    expect(getPublicUrl).not.toHaveBeenCalled();
  });

  it("deletes a stored object from the configured bucket", async () => {
    const remove = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ remove });

    mockedCreateSupabaseServiceClient.mockReturnValue({
      storage: { from },
    } as unknown as ReturnType<typeof createSupabaseServiceClient>);

    await expect(
      deleteStorageObject({
        bucket: "uploads",
        path: "uploads/admin/uuid-guide.pdf",
      }),
    ).resolves.toBeUndefined();

    expect(from).toHaveBeenCalledWith("uploads");
    expect(remove).toHaveBeenCalledWith(["uploads/admin/uuid-guide.pdf"]);
  });
});

import { uploadAdminAsset } from "@/infrastructure/supabase/storage.client";
export async function uploadFiles(
  files: File[],
  folder = "avatars",
): Promise<string[]> {
  return Promise.all(
    files.map(
      async (file) =>
        (
          await uploadAdminAsset(file, {
            bucket: "public-avatars",
            folder,
            kind: "image",
            maxBytes: 5 * 1024 * 1024,
            mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          })
        ).url,
    ),
  );
}
export const uploadService = { uploadFiles };

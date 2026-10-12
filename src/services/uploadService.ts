import { uploadAdminAsset } from "@/infrastructure/supabase/storage.client";
import { MAX_ADMIN_IMAGE_BYTES } from "@/lib/admin-upload-limits";
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
            maxBytes: MAX_ADMIN_IMAGE_BYTES,
            mimeTypes: ["image/jpeg", "image/png", "image/webp"],
          })
        ).url,
    ),
  );
}
export const uploadService = { uploadFiles };

import "server-only";

import { createSupabaseServiceClient } from "./server";

const PUBLIC_COURSE_ASSETS_BUCKET = "course-assets";

export async function deleteStorageObject(input: {
  bucket: string;
  path: string;
}): Promise<void> {
  const storage = createSupabaseServiceClient().storage.from(input.bucket);
  const { error } = await storage.remove([input.path]);

  if (error) {
    throw error;
  }
}

export async function uploadPublicCourseAsset(input: {
  path: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const storage = createSupabaseServiceClient().storage.from(
    PUBLIC_COURSE_ASSETS_BUCKET,
  );
  const { error } = await storage.upload(input.path, input.body, {
    contentType: input.contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return storage.getPublicUrl(input.path).data.publicUrl;
}

export async function uploadPublicAsset(input: {
  bucket: string;
  path: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const storage = createSupabaseServiceClient().storage.from(input.bucket);
  const { error } = await storage.upload(input.path, input.body, {
    contentType: input.contentType,
    upsert: true,
  });
  if (error) throw error;
  return storage.getPublicUrl(input.path).data.publicUrl;
}

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export const uploadFiles = async (
  files: File[],
  folder: string = "uploads",
): Promise<string[]> => {
  const supabase = createSupabaseBrowserClient();

  const uploadPromises = files.map(async (file) => {
    const timestamp = Date.now();

    // Slugify the filename to avoid issues with special characters and spaces
    const cleanName = file.name
      .toLowerCase()
      .normalize("NFD") // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9.]/g, "_") // Replace anything not alphanumeric or dot with underscore
      .replace(/_{2,}/g, "_"); // Collapse multiple underscores

    const path = `${folder}/${timestamp}-${cleanName}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("[UploadService] Error uploading file to Supabase:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const uploadService = {
  uploadFiles,
};

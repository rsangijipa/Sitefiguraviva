import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * Uploads multiple files to Supabase Storage
 * @param {File[]} files - Array of File objects
 * @param {string} bucketName - Storage bucket name
 * @returns {Promise<string[]>} - Array of public download URLs
 */
export const uploadFiles = async (files, bucketName = 'courses') => {
    console.log(`[Supabase Upload] Starting upload of ${files.length} files to bucket: ${bucketName}...`);

    const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error(`[Supabase Upload] Error uploading ${file.name}:`, error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

        console.log(`[Supabase Upload] Success ${file.name}: ${publicUrl}`);
        return publicUrl;
    });

    try {
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("[Supabase Upload] Bulk upload error:", error);
        throw error;
    }
};

/**
 * Uploads a single file to Supabase
 */
export const uploadFile = async (file, bucketName = 'courses') => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

    return publicUrl;
};

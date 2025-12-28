import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads multiple files to Firebase Storage.
 * @param {File[]} files - An array of File objects to upload.
 * @param {string} folderPath - The folder path in storage (e.g., 'courses').
 * @returns {Promise<string[]>} - A promise that resolves to an array of public download URLs.
 */
export async function uploadFiles(files, folderPath = 'courses') {
    if (!files || files.length === 0) return [];

    const uploadPromises = Array.from(files).map(async (file) => {
        // Create a unique filename using timestamp
        const timestamp = Date.now();
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storagePath = `${folderPath}/${timestamp}_${safeFilename}`;
        const storageRef = ref(storage, storagePath);

        // Upload the file
        await uploadBytes(storageRef, file);

        // Get the download URL
        return await getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
}

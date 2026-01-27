
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFiles = async (files: File[], folder: string = 'uploads'): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();

        // Slugify the filename to avoid issues with special characters and spaces
        const cleanName = file.name
            .toLowerCase()
            .normalize('NFD') // Decompose accented characters
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9.]/g, '_') // Replace anything not alphanumeric or dot with underscore
            .replace(/_{2,}/g, '_'); // Collapse multiple underscores

        const path = `${folder}/${timestamp}-${cleanName}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
};

export const uploadService = {
    uploadFiles
};

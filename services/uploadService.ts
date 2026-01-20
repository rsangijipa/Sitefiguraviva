
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFiles = async (files: File[], folder: string = 'uploads'): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const path = `${folder}/${timestamp}-${file.name}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
};

export const uploadService = {
    uploadFiles
};

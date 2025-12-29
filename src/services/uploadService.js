import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase"; // Ensure this exports the initialized app

const storage = getStorage(app);

/**
 * Uploads multiple files to Firebase Storage
 * @param {File[]} files - Array of File objects
 * @param {string} pathPrefix - Storage path prefix (e.g. 'courses/course-id')
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadFiles = async (files, pathPrefix) => {
    const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
    });

    return Promise.all(uploadPromises);
};

/**
 * Uploads a single file
 * @param {File} file 
 * @param {string} pathPrefix 
 * @returns {Promise<string>}
 */
export const uploadFile = async (file, pathPrefix) => {
    const storageRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

import { db } from './firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

export const blogService = {
    getAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    },
    getBySlug: async (slug) => {
        try {
            const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }

            // Fallback: try to find by ID if slug lookup fails
            return null;
        } catch (error) {
            console.error("Error fetching post by slug:", error);
            throw error;
        }
    },
    create: async (data) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, data);
            return { id, ...data };
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }
};

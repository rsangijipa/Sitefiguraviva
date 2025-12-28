import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
            return [];
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
            return null;
        } catch (error) {
            console.error("Error fetching post by slug:", error);
            return null;
        }
    }
};

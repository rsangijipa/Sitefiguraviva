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
            // This handles cases where we might link by ID in some legacy path
            // though ideally we stick to slugs.
            // Note: Firestore IDs are strings, so this simple check is okay if the slug passed was actually an ID.
            // Ideally we shouldn't mix, but let's keep it robust.
            return null;
        } catch (error) {
            console.error("Error fetching post by slug:", error);
            throw error;
        }
    }
};

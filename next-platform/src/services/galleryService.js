import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const COLLECTION_NAME = 'gallery';

export const galleryService = {
    getAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching gallery from Firestore:", error);
            return [];
        }
    }
};


import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, increment, updateDoc } from 'firebase/firestore';

export const interactionService = {
    async getTreeCount(): Promise<number> {
        try {
            const docRef = doc(db, 'stats', 'tree');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().count || 0;
            } else {
                return 1243; // Default/Fallback
            }
        } catch (error) {
            console.error("Error fetching tree count:", error);
            return 1243;
        }
    },

    async incrementTreeCount(): Promise<void> {
        try {
            const docRef = doc(db, 'stats', 'tree');
            // Use setDoc with merge to ensure doc exists, or update if it does.
            // Actually setDoc with merge doesn't support increment atomically on create well without prep?
            // Safer to Update if exists, Set if not.
            // Or just set with merge: true for initial, but increment needs update.

            // Simple approach:
            await setDoc(docRef, { count: increment(1) }, { merge: true });
        } catch (error) {
            console.error("Error incrementing tree count:", error);
        }
    }
};

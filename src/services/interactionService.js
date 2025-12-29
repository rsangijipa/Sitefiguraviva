import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

const COUNTER_DOC_REF = doc(db, "counters", "feelings_tree");

export const interactionService = {
    // Get current count
    async getTreeCount() {
        try {
            const docSnap = await getDoc(COUNTER_DOC_REF);
            if (docSnap.exists()) {
                return docSnap.data().count || 0;
            } else {
                // Initialize if not exists
                await setDoc(COUNTER_DOC_REF, { count: 1243 }); // Starting base
                return 1243;
            }
        } catch (error) {
            console.error("Error fetching tree count:", error);
            return 1243; // Fallback
        }
    },

    // Increment count
    async incrementTreeCount() {
        try {
            await updateDoc(COUNTER_DOC_REF, {
                count: increment(1)
            });
            return true;
        } catch (error) {
            // If doc doesn't exist (e.g. first run), create it
            try {
                await setDoc(COUNTER_DOC_REF, { count: 1244 });
                return true;
            } catch (e) {
                console.error("Error incrementing tree count:", e);
                return false;
            }
        }
    }
};

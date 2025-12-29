import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'courses';

export const courseService = {
    getAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching courses from Firestore:", error);
            return [];
        }
    },
    getById: async (id) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching course by ID:", error);
            return null;
        }
    },
    create: async (data) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error("Error creating course:", error);
            if (error.code === 'permission-denied') {
                console.error("PERMISSION DENIED: Check your Firestore Security Rules in the Firebase Console.");
            }
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, data);
            return { id, ...data };
        } catch (error) {
            console.error("Error updating course:", error);
            if (error.code === 'permission-denied') {
                console.error("PERMISSION DENIED: Check your Firestore Security Rules in the Firebase Console.");
            }
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting course:", error);
            throw error;
        }
    },
};

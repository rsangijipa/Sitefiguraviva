import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { staticCourses } from '../data/staticCourses';

const COLLECTION_NAME = 'courses';

export const courseService = {
    getAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            const firebaseCourses = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Merge: Static first (so they are always at top or bottom? Let's put static first)
            // Or prioritize Firebase if ID conflict? Assume distinct IDs.
            return [...staticCourses, ...firebaseCourses];
        } catch (error) {
            console.error("Error fetching courses from Firestore:", error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            // 1. Check static
            const staticCourse = staticCourses.find(c => c.id === id);
            if (staticCourse) return staticCourse;

            // 2. Check Firebase
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error("Course not found");
            }
        } catch (error) {
            console.error("Error fetching course by ID:", error);
            throw error;
        }
    },
    create: async (data) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error("Error creating course:", error);
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

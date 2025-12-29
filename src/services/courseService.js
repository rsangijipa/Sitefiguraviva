import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { staticCourses } from '../data/staticCourses';
import localCourses from '../data/courses.json';

const COLLECTION_NAME = 'courses';

export const courseService = {
    getAll: async () => {
        try {
            // STRICT MODE: Returning only local courses from file system as requested.
            // This ensures the admin panel reflects exactly what is in 'public/cursos'.
            console.log("Loading courses from File System...", localCourses);
            return [...(localCourses || [])];
        } catch (error) {
            console.error("Error fetching courses:", error);
            return [];
        }
    },
    getById: async (id) => {
        try {
            // 1. Check local first
            const local = (localCourses || []).find(c => String(c.id) === String(id));
            if (local) return local;

            // 2. Check Static (Legacy)
            const staticCourse = staticCourses.find(c => String(c.id) === String(id));
            if (staticCourse) return staticCourse;

            // 3. Check Firebase (Legacy)
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
        // This is handled by the API middleware now for file system
        // But if creating in firebase:
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

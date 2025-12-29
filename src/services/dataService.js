import { collection, getDocs, doc, getDoc, query, orderBy, where, limit, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// Helper to sanitize data
const docToData = (doc) => ({ id: doc.id, ...doc.data() });

// --- GALLERY SERVICE ---
export const getGalleryItems = async () => {
    try {
        const q = collection(db, "gallery");
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToData);
    } catch (error) {
        console.error("Error fetching gallery:", error);
        if (error.code === 'permission-denied') {
            console.error("CRITICAL: Permission denied for 'gallery'. Check Firestore Rules.");
        }
        return [];
    }
};

// --- COURSES SERVICE ---
export const getCourses = async () => {
    try {
        const q = collection(db, "courses");
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToData);
    } catch (error) {
        console.error("Error fetching courses:", error);
        if (error.code === 'permission-denied') {
            console.error("CRITICAL: Permission denied for 'courses'. Check Firestore Rules.");
        }
        return [];
    }
};

export const getCourseBySlug = async (slug) => {
    try {
        const docRef = doc(db, "courses", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docToData(docSnap);
        return null;
    } catch (error) {
        console.error(`Error fetching course ${slug}:`, error);
        return null;
    }
};

// --- MEDIATORS SERVICE ---
export const getMediators = async () => {
    try {
        const snapshot = await getDocs(collection(db, "mediators"));
        return snapshot.docs.map(docToData);
    } catch (error) {
        console.error("Error fetching mediators:", error);
        if (error.code === 'permission-denied') {
            console.error("CRITICAL: Permission denied for 'mediators'. Check Firestore Rules.");
        }
        return [];
    }
};

// --- CRUD OPERATIONS (ADMIN) ---
export const addCourse = async (courseData) => {
    try {
        const docRef = await addDoc(collection(db, "courses"), {
            ...courseData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...courseData };
    } catch (error) {
        console.error("Error adding course:", error);
        throw error;
    }
};

export const updateCourse = async (courseId, courseData) => {
    try {
        const courseRef = doc(db, "courses", courseId);
        await updateDoc(courseRef, {
            ...courseData,
            updatedAt: new Date().toISOString()
        });
        return { id: courseId, ...courseData };
    } catch (error) {
        console.error("Error updating course:", error);
        throw error;
    }
};

export const deleteCourse = async (courseId) => {
    try {
        const courseRef = doc(db, "courses", courseId);
        await deleteDoc(courseRef);
        return true;
    } catch (error) {
        console.error("Error deleting course:", error);
        throw error;
    }
};

// --- HELPERS ---
export const resolveMediator = async (mediatorRef, allMediators = []) => {
    if (allMediators.length > 0) {
        const nameToFind = (typeof mediatorRef === 'string' ? mediatorRef : mediatorRef.name).toLowerCase();
        return allMediators.find(m => m.name.toLowerCase().includes(nameToFind) || m.id.includes(nameToFind)) || mediatorRef;
    }
    return mediatorRef;
};

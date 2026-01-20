import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    limit,
    addDoc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// --- Types (Basic) ---
export interface Course {
    id: string;
    title: string;
    isPublished: boolean;
    // ... other fields
    [key: string]: any;
}

export interface Post {
    id: string;
    title: string;
    isPublished: boolean;
    // ... other fields
    [key: string]: any;
}

// --- Fetchers ---
const fetchCollection = async (colName: string, publishedOnly = true) => {
    const constraints = [];
    if (publishedOnly) {
        constraints.push(where("isPublished", "==", true));
    }
    // Default Sort
    // constraints.push(orderBy("createdAt", "desc")); // Requires index if mixed with where()

    const q = query(collection(db, colName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Hooks ---

export const useCourses = (isAdmin = false, options?: { initialData?: any[] }) => {
    return useQuery({
        queryKey: ['courses', isAdmin],
        queryFn: () => fetchCollection('courses', !isAdmin),
        initialData: options?.initialData
    });
};

export const useBlogPosts = (isAdmin = false, options?: { initialData?: any[] }) => {
    return useQuery({
        queryKey: ['posts', isAdmin],
        queryFn: () => fetchCollection('posts', !isAdmin),
        initialData: options?.initialData
    });
};

export const useGallery = (options?: { initialData?: any[] }) => {
    return useQuery({
        queryKey: ['gallery'],
        queryFn: async () => {
            const q = query(collection(db, 'gallery'), orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        initialData: options?.initialData
    });
};

export const usePageContent = (key: string) => {
    return useQuery({
        queryKey: ['content', key],
        queryFn: async () => {
            const docRef = doc(db, 'pages', key);
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? snapshot.data() : null;
        }
    });
};

export const useTeamMembers = () => {
    return useQuery({
        queryKey: ['team'],
        queryFn: () => fetchCollection('team_members', false) // assuming public always
    });
};

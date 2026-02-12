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
  deleteDoc,
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
const fetchCollection = async (
  colName: string,
  publishedOnly = true,
): Promise<any[]> => {
  const constraints = [];
  if (publishedOnly) {
    constraints.push(where("isPublished", "==", true));
  }
  // Default Sort
  // constraints.push(orderBy("createdAt", "desc")); // Requires index if mixed with where()

  const q = query(collection(db, colName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const normalizeGalleryItem = (item: any) => ({
  ...item,
  src: item?.src || item?.url || "",
  url: item?.url || item?.src || "",
});

const fetchPublicGalleryCollection = async (): Promise<any[]> => {
  const publicSnap = await getDocs(query(collection(db, "publicGallery")));
  if (!publicSnap.empty) {
    return publicSnap.docs.map((doc) =>
      normalizeGalleryItem({ id: doc.id, ...doc.data() }),
    );
  }

  const legacySnap = await getDocs(query(collection(db, "gallery")));
  return legacySnap.docs.map((doc) =>
    normalizeGalleryItem({ id: doc.id, ...doc.data() }),
  );
};

// --- Hooks ---

export const useCourses = (
  isAdmin = false,
  options?: { initialData?: any[] },
) => {
  return useQuery({
    queryKey: ["courses", isAdmin],
    queryFn: () => fetchCollection("courses", !isAdmin),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBlogPosts = (
  isAdmin = false,
  options?: { initialData?: any[] },
) => {
  return useQuery({
    queryKey: ["posts", isAdmin],
    queryFn: () => fetchCollection("posts", !isAdmin),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGallery = (options?: { initialData?: any[] }) => {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: () => fetchCollection("gallery", false), // Use helper
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePublicGallery = (options?: { initialData?: any[] }) => {
  return useQuery({
    queryKey: ["publicGallery"],
    queryFn: fetchPublicGalleryCollection,
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const usePublicLibrary = (options?: { initialData?: any[] }) => {
  return useQuery({
    queryKey: ["publicLibrary"],
    queryFn: () => fetchCollection("publicLibrary", false),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const usePageContent = (key: string) => {
  return useQuery({
    queryKey: ["content", key],
    queryFn: async () => {
      const docRef = doc(db, "pages", key);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },
  });
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team"],
    queryFn: () => fetchCollection("team_members", false), // assuming public always
  });
};

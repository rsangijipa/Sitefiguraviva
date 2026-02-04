
import { db } from '@/lib/firebase/client';
import { doc, getDoc, collection, getDocs, query, where, documentId } from 'firebase/firestore';

export interface Course {
    id: string;
    title: string;
    description: string;
    image?: string;
    totalLessons?: number;
    modulesCount?: number;
    isPublished: boolean;
}

export const courseService = {
    // Get single course details
    async getCourse(courseId: string): Promise<Course | null> {
        if (!courseId) return null;
        const snap = await getDoc(doc(db, 'courses', courseId));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : null;
    },

    // Get list of courses by IDs (for "My Courses" view)
    async getCoursesByIds(ids: string[]): Promise<Course[]> {
        if (!ids || ids.length === 0) return [];

        // Firestore 'in' query supports up to 10 items. Chunking needed for production.
        // MVP: Limit to 10 or fetch individually if > 10.
        const chunks = [];
        const chunkSize = 10;

        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunk = ids.slice(i, i + chunkSize);
            const q = query(collection(db, 'courses'), where(documentId(), 'in', chunk));
            chunks.push(getDocs(q));
        }

        const snapshots = await Promise.all(chunks);
        return snapshots.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
    },

    // Get materials for a course
    async getCourseMaterials(courseId: string): Promise<any[]> {
        if (!courseId) return [];
        try {
            const materialsRef = collection(db, 'courses', courseId, 'materials');
            const snap = await getDocs(materialsRef);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error fetching materials for course ${courseId}:`, error);
            return [];
        }
    }
};

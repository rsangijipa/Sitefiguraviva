
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface CourseProgress {
    userId: string;
    courseId: string;
    lastLessonId?: string;
    lessonProgress: Record<string, {
        completed: boolean;
        completedAt?: any;
        seekPosition?: number;
    }>;
    lastAccessedAt: any;
}

export const progressService = {
    // Get progress for a specific course
    async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
        if (!userId || !courseId) return null;

        try {
            const docRef = doc(db, 'progress', `${userId}_${courseId}`);
            const snap = await getDoc(docRef);
            return snap.exists() ? (snap.data() as CourseProgress) : null;
        } catch (error) {
            console.error("Error fetching progress:", error);
            return null;
        }
    },

    // Get last accessed lesson (Resume capability)
    async getLastAccessedLesson(userId: string, courseId: string): Promise<string | null> {
        const progress = await this.getCourseProgress(userId, courseId);
        return progress?.lastLessonId || null;
    }
};

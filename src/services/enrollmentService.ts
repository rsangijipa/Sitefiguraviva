
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export interface Enrollment {
    id: string;
    courseId: string;
    userId: string;
    status: 'active' | 'expired' | 'completed' | 'pending';
    progressSummary?: {
        percent: number;
        completedLessons: string[];
        lastUpdated: any;
    };
    lastAccessedAt?: any;
    enrolledAt: any;
}

export const enrollmentService = {
    // Get all enrollments for a user
    async getUserEnrollments(userId: string): Promise<Enrollment[]> {
        if (!userId) return [];

        try {
            // Query ROOT collection 'enrollments'
            const q = query(
                collection(db, 'enrollments'),
                where('userId', '==', userId),
                orderBy('enrolledAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            throw error;
        }
    },

    // Get specific enrollment
    async getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
        if (!userId || !courseId) return null;

        const docRef = doc(db, 'enrollments', `${userId}_${courseId}`);
        const snap = await getDoc(docRef);

        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Enrollment) : null;
    },

    // Get active enrollments only
    async getActiveEnrollments(userId: string): Promise<Enrollment[]> {
        const all = await this.getUserEnrollments(userId);
        return all.filter(e => e.status === 'active');
    }
};

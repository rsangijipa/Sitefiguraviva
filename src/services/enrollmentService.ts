
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
            // We removed orderBy to avoid index requirement
            const q = query(
                collection(db, 'enrollments'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            const enrollments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));

            // Sort in memory (Newest first)
            return enrollments.sort((a, b) => {
                const tA = a.enrolledAt?.seconds || 0;
                const tB = b.enrolledAt?.seconds || 0;
                return tB - tA;
            });
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

import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface EventDoc {
    id: string;
    title: string;
    description?: string;
    startsAt: Timestamp;
    endsAt?: Timestamp;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    isPublic: boolean;
    courseId?: string; // Optional linkage
    meetingUrl?: string;
    coverImage?: string;
}

export const eventService = {
    async getUpcomingEvents(limitCount = 3): Promise<EventDoc[]> {
        const now = new Date();
        const q = query(
            collection(db, 'events'),
            where('status', 'in', ['scheduled', 'live']),
            where('startsAt', '>=', now),
            orderBy('startsAt', 'asc'),
            limit(limitCount)
        );

        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventDoc));
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    },

    async getCourseEvents(courseId: string): Promise<EventDoc[]> {
        const now = new Date();
        const q = query(
            collection(db, 'events'),
            where('courseId', '==', courseId),
            where('startsAt', '>=', now),
            orderBy('startsAt', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventDoc));
    }
};

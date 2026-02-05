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
        // Removed orderBy and complex where to avoid index complexity
        const q = query(
            collection(db, 'events'),
            where('status', 'in', ['scheduled', 'live'])
        );

        try {
            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventDoc));

            // Filter by date and sort in memory
            return events
                .filter(e => e.startsAt?.toDate() >= now)
                .sort((a, b) => {
                    const tA = a.startsAt?.seconds || 0;
                    const tB = b.startsAt?.seconds || 0;
                    return tA - tB; // Chronological order
                })
                .slice(0, limitCount);
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    },

    async getCourseEvents(courseId: string): Promise<EventDoc[]> {
        const now = new Date();
        const q = query(
            collection(db, 'events'),
            where('courseId', '==', courseId)
        );

        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventDoc));

        return events
            .filter(e => e.startsAt?.toDate() >= now)
            .sort((a, b) => {
                const tA = a.startsAt?.seconds || 0;
                const tB = b.startsAt?.seconds || 0;
                return tA - tB;
            });
    }
};

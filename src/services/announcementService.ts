import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, getDocs, Timestamp, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { AnnouncementDoc } from '@/types/lms';

export const announcementService = {
    async getCourseAnnouncements(courseId: string): Promise<AnnouncementDoc[]> {
        const q = query(
            collection(db, 'courses', courseId, 'announcements'),
            orderBy('publishAt', 'desc'), // Show future ones? Maybe filter client side or separate method for admin
            orderBy('isPinned', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnnouncementDoc));
    },

    async getPublishedAnnouncements(courseId: string): Promise<AnnouncementDoc[]> {
        const now = Timestamp.now();
        const q = query(
            collection(db, 'courses', courseId, 'announcements'),
            where('publishAt', '<=', now),
            orderBy('publishAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnnouncementDoc));
    },

    async createAnnouncement(courseId: string, data: Omit<AnnouncementDoc, 'id' | 'createdAt'>): Promise<string> {
        const docData = {
            ...data,
            courseId,
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'courses', courseId, 'announcements'), docData);
        return docRef.id;
    },

    async updateAnnouncement(courseId: string, announcementId: string, data: Partial<AnnouncementDoc>): Promise<void> {
        const docRef = doc(db, 'courses', courseId, 'announcements', announcementId);
        await updateDoc(docRef, data);
    },

    async deleteAnnouncement(courseId: string, announcementId: string): Promise<void> {
        const docRef = doc(db, 'courses', courseId, 'announcements', announcementId);
        await deleteDoc(docRef);
    }
};

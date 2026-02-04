import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs, Timestamp, addDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { NotificationDoc } from '@/types/lms';

export const notificationService = {
    async getUserNotifications(userId: string, limitCount = 20): Promise<NotificationDoc[]> {
        const q = query(
            collection(db, 'users', userId, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDoc));
    },

    async getUnreadCount(userId: string): Promise<number> {
        const q = query(
            collection(db, 'users', userId, 'notifications'),
            where('isRead', '==', false)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    },

    async markAsRead(userId: string, notificationId: string): Promise<void> {
        const docRef = doc(db, 'users', userId, 'notifications', notificationId);
        await updateDoc(docRef, {
            isRead: true,
            readAt: Timestamp.now()
        });
    },

    async markAllAsRead(userId: string): Promise<void> {
        const q = query(
            collection(db, 'users', userId, 'notifications'),
            where('isRead', '==', false)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true, readAt: Timestamp.now() });
        });

        await batch.commit();
    },

    // Usually called by server actions or Cloud Functions, but accessible here for MVP
    async createNotification(userId: string, notification: Omit<NotificationDoc, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
        const docData = {
            ...notification,
            isRead: false,
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'users', userId, 'notifications'), docData);
        return docRef.id;
    }
};

import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs, Timestamp, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { CommunityThreadDoc, CommunityReplyDoc } from '@/types/lms';

export const communityService = {
    async getCourseThreads(courseId: string, limitCount = 10): Promise<CommunityThreadDoc[]> {
        try {
            const q = query(
                collection(db, 'courses', courseId, 'communityThreads'),
                orderBy('isPinned', 'desc'),
                orderBy('lastReplyAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityThreadDoc));
        } catch (error) {
            console.error("Error fetching threads:", error);
            // Fallback for missing index or collection
            return [];
        }
    },

    async createThread(courseId: string, user: { uid: string, displayName: string, photoURL?: string }, title: string, content: string): Promise<string> {
        const threadData: Omit<CommunityThreadDoc, 'id'> = {
            courseId,
            authorId: user.uid,
            authorName: user.displayName || 'Usuário',
            authorAvatar: user.photoURL,
            title,
            content,
            replyCount: 0,
            likeCount: 0,
            viewCount: 0,
            isPinned: false,
            isLocked: false,
            isDeleted: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            lastReplyAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'courses', courseId, 'communityThreads'), threadData);
        return docRef.id;
    },

    async getThread(courseId: string, threadId: string): Promise<CommunityThreadDoc | null> {
        const snap = await getDocs(query(collection(db, 'courses', courseId, 'communityThreads'), where('__name__', '==', threadId)));
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as CommunityThreadDoc;
    },

    async getReplies(courseId: string, threadId: string): Promise<CommunityReplyDoc[]> {
        const q = query(
            collection(db, 'courses', courseId, 'communityThreads', threadId, 'replies'),
            orderBy('createdAt', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityReplyDoc));
    },

    async createReply(courseId: string, threadId: string, user: { uid: string, displayName: string, photoURL?: string }, content: string): Promise<string> {
        // 1. Create Reply
        const replyData: Omit<CommunityReplyDoc, 'id'> = {
            threadId,
            authorId: user.uid,
            authorName: user.displayName || 'Usuário',
            authorAvatar: user.photoURL,
            content,
            likeCount: 0,
            isDeleted: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const replyRef = await addDoc(collection(db, 'courses', courseId, 'communityThreads', threadId, 'replies'), replyData);

        // 2. Update Thread (Reply Count + Last Reply At)
        const threadRef = doc(db, 'courses', courseId, 'communityThreads', threadId);
        await updateDoc(threadRef, {
            replyCount: increment(1),
            lastReplyAt: Timestamp.now()
        });

        return replyRef.id;
    },

    async togglePin(courseId: string, threadId: string, isPinned: boolean): Promise<void> {
        const threadRef = doc(db, 'courses', courseId, 'communityThreads', threadId);
        await updateDoc(threadRef, { isPinned });
    },

    async toggleLock(courseId: string, threadId: string, isLocked: boolean): Promise<void> {
        const threadRef = doc(db, 'courses', courseId, 'communityThreads', threadId);
        await updateDoc(threadRef, { isLocked });
    },

    async softDeleteThread(courseId: string, threadId: string): Promise<void> {
        const threadRef = doc(db, 'courses', courseId, 'communityThreads', threadId);
        await updateDoc(threadRef, { isDeleted: true });
    }
};

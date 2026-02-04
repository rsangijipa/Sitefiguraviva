"use server";

import { auth, db } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface CreatePostData {
    title: string;
    content: string;
    channel: string;
}

export async function createPost(data: CreatePostData) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { error: 'Unauthorized' };

    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        const uid = claims.uid;

        // Fetch user profile for author info display
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        const postsRef = db.collection('posts');

        await postsRef.add({
            title: data.title,
            content: data.content,
            channel: data.channel,
            author: {
                uid: uid,
                displayName: userData?.displayName || 'Aluno',
                role: claims.role || 'student',
                avatarUrl: userData?.photoURL || null
            },
            likesCount: 0,
            commentsCount: 0,
            isPinned: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        revalidatePath('/portal/community');
        return { success: true };

    } catch (error) {
        console.error("Create Post Error:", error);
        return { error: 'Failed to create post' };
    }
}

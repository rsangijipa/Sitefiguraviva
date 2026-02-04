"use server";

import { auth, db } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface CreateEventData {
    title: string;
    description: string;
    startsAt: string; // ISO string from form
    endsAt: string;
    type: 'webinar' | 'in_person';
    joinUrl?: string;
    location?: string;
}

export async function createEvent(data: CreateEventData) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { error: 'Unauthorized' };

    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        if (claims.role !== 'admin' && claims.admin !== true) {
            return { error: 'Forbidden: Admins only' };
        }

        const eventsRef = db.collection('events');

        await eventsRef.add({
            title: data.title,
            description: data.description,
            startsAt: Timestamp.fromDate(new Date(data.startsAt)),
            endsAt: Timestamp.fromDate(new Date(data.endsAt)),
            type: data.type,
            provider: 'zoom', // Default for now
            status: 'scheduled',
            joinUrl: data.joinUrl || null,
            location: data.location || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: claims.uid
        });

        revalidatePath('/admin/events');
        revalidatePath('/portal/events');
        return { success: true };

    } catch (error) {
        console.error("Create Event Error:", error);
        return { error: 'Failed to create event' };
    }
}

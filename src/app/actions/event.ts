
"use server";

import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { publishEvent } from '@/lib/events/bus';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function checkInEvent(checkInCode: string) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) throw new Error("Unauthorized");

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch {
        throw new Error("Unauthorized");
    }

    // 1. Find Event by Code
    // In a real app, this code should be rotated or mapped in a separate secure collection.
    // For MVP, we assume the event document has a `checkInCode` field.
    const eventsSnap = await db.collection('events')
        .where('checkInCode', '==', checkInCode)
        .where('status', 'in', ['live', 'scheduled']) // Only allow if live or about to start
        .limit(1)
        .get();

    if (eventsSnap.empty) {
        return { success: false, message: "Código inválido ou evento expirado." };
    }

    const eventDoc = eventsSnap.docs[0];
    const eventId = eventDoc.id;
    const eventData = eventDoc.data();

    // 2. Check strict time window (Optional, simplified here)
    // const now = Date.now();
    // if (now < eventData.startsAt.toMillis() - 3600000) return { success: false, message: "Muito cedo para check-in." };

    // 3. Register Presence (Idempotent)
    const checkInRef = db.collection('events').doc(eventId).collection('attendance').doc(uid);
    const existingCheckIn = await checkInRef.get();

    if (existingCheckIn.exists) {
        return { success: true, message: "Presença já confirmada anteriormente.", alreadyRegistered: true, eventTitle: eventData.title };
    }

    await checkInRef.set({
        userId: uid,
        timestamp: FieldValue.serverTimestamp(),
        method: 'qr_code'
    });

    // 4. Publish Event (For Certificates/Analytics)
    await publishEvent({
        type: 'LESSON_COMPLETED', // Reusing this type or adding EVENT_ATTENDED
        actorUserId: uid,
        targetId: eventId,
        context: {
            assessmentId: undefined, // Or log as an 'activity'
            courseId: eventData.courseId
        },
        payload: {
            method: 'qr_checkin',
            eventTitle: eventData.title
        }
    });

    return { success: true, message: "Presença confirmada com sucesso!", eventTitle: eventData.title };
}

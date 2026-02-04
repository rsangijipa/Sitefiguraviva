
import { db } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type EventType =
    | 'LESSON_COMPLETED'
    | 'ASSESSMENT_SUBMITTED'
    | 'ASSESSMENT_GRADED'
    | 'COURSE_ENROLLED'
    | 'CERTIFICATE_ISSUED';

export interface DomainEvent {
    id?: string;
    type: EventType;
    actorUserId: string;
    targetId: string; // The primary entity ID (e.g., submissionId, progressId)
    context: {
        courseId?: string;
        moduleId?: string;
        lessonId?: string;
        assessmentId?: string;
    };
    payload: Record<string, any>; // Minimal necessary data
    occurredAt: Timestamp;
    processed?: boolean;
}

/**
 * Publishes a domain event to Firestore.
 * This acts as the "Write Side" of our Event-Sourcing-lite pattern.
 */
export async function publishEvent(eventData: Omit<DomainEvent, 'occurredAt' | 'id'>) {
    const eventRef = db.collection('domain_events').doc();

    // Idempotency could be handled here by using a deterministic ID if passed
    // For now, we use auto-ID and trust the caller or 'targetId' for de-dupe

    const event: DomainEvent = {
        ...eventData,
        occurredAt: Timestamp.now(),
        processed: false
    };

    await eventRef.set(event);

    // In a real serverless env, Firestore Triggers would pick this up.
    // Since we are likely in a limited Next.js env without background triggers setup easily,
    // we might want to "Inline" the processing for critical paths or have a separate Cron/Queue.
    // For P1.4, we will implement an "Inline Dispatcher" purely to simulate the worker 
    // immediately after publish, to ensure UX consistency without complex infra.

    await dispatchToWorkers(event);

    return eventRef.id;
}

// --- Inline Dispatcher (To replace Cloud Functions for MVP) ---
// This ensures that when an action happens, the side-effects run "eventually" (or immediately here)
import { handleProgressUpdate } from './workers/progress';

async function dispatchToWorkers(event: DomainEvent) {
    try {
        console.log(`[EventBus] Dispatching ${event.type}...`);

        switch (event.type) {
            case 'LESSON_COMPLETED':
            case 'ASSESSMENT_GRADED':
                await handleProgressUpdate(event);
                break;
            default:
                break;
        }

        // Mark processed
        // await db.collection('domain_events').doc(event.id!).update({ processed: true });
    } catch (error) {
        console.error(`[EventBus] Worker failed for ${event.type}:`, error);
        // Do not block the main flow, let it fail silently (log only)
    }
}

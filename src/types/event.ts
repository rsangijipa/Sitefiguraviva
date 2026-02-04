


export type EventType = 'webinar' | 'hybrid' | 'in_person';
export type EventProvider = 'zoom' | 'youtube' | 'google_meet' | 'other';

export interface LiveEvent {
    id: string;
    courseId?: string; // Optional: linked to a specific course
    title: string;
    description?: string;

    // Schedule
    startsAt: any;
    endsAt: any;
    timezone: string; // e.g. 'America/Sao_Paulo'

    // Configuration
    type: EventType;
    provider?: EventProvider;

    // Access
    joinUrl?: string; // Direct link for external tools
    embedCode?: string; // For YouTube/Vimeo live embeds
    location?: string; // Physical address for hybrid/in-person

    // Access Control
    isPublic?: boolean; // If true, all active students can see
    enrolledOnly?: boolean; // If true, only students of courseId

    // Status
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    recordingUrl?: string; // Post-event recording

    createdAt: any;
    updatedAt: any;
}

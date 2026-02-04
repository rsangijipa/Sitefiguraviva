
import Dexie, { type EntityTable } from 'dexie';

// --- Interfaces ---

export interface OfflineProgress {
    id?: number; // Auto-increment
    userId: string;
    courseId: string;
    lessonId: string;
    timestamp: number;
    seekPosition: number; // Seconds
    completed: boolean;
    synced: boolean; // True if pushed to Firestore
}

export interface DraftSubmission {
    id?: number;
    userId: string;
    assessmentId: string;
    questionId: string;
    answer: string;
    lastUpdated: number;
}

// --- Database Definition ---

const db = new Dexie('FiguraVivaLMS') as Dexie & {
    progress: EntityTable<OfflineProgress, 'id'> & {
        // Composite Index for efficient "Resume" query
        findByLesson: (userId: string, lessonId: string) => Promise<OfflineProgress | undefined>;
    };
    drafts: EntityTable<DraftSubmission, 'id'>;
};

// Schema Definition
db.version(1).stores({
    progress: '++id, [userId+courseId], [userId+lessonId], synced', // Indices for fast lookup
    drafts: '++id, [userId+assessmentId], [userId+assessmentId+questionId]'
});

export { db };


import { db, auth } from '@/lib/firebase/admin';
import { updateLessonProgress } from '@/actions/progress';

// --- MOCK SETUP ---

// In-memory Mock Store (Pattern: Map<path, data>)
const mockStore = new Map<string, any>();

// Helper to seed store
const seed = (path: string, data: any) => mockStore.set(path, data);
const clearStore = () => mockStore.clear();

// Mock Firestore Factory
const mockCollection = (name: string) => ({
    doc: jest.fn((id: string) => mockDoc(`${name}/${id}`)),
});

const mockDoc = (path: string) => ({
    path,
    get: jest.fn(async () => {
        const data = mockStore.get(path);
        return {
            exists: !!data,
            data: () => data || {},
            ref: { path }
        };
    }),
    set: jest.fn(async (data: any, options?: { merge: boolean }) => {
        const existing = mockStore.get(path) || {};
        if (options?.merge) {
            mockStore.set(path, { ...existing, ...data });
        } else {
            mockStore.set(path, data);
        }
    }),
    update: jest.fn(async (data: any) => {
        const existing = mockStore.get(path);
        if (existing) {
            mockStore.set(path, { ...existing, ...data });
        }
    }),
});

// Mock Transaction
const mockRunTransaction = jest.fn(async (callback) => {
    // Transaction Context
    const t = {
        get: async (ref: any) => {
            // Read directly from current store state
            const data = mockStore.get(ref.path);
            return {
                exists: !!data,
                data: () => data || {},
                ref
            };
        },
        set: jest.fn((ref: any, data: any, options?: { merge: boolean }) => {
            // Write to mock store
            const path = ref.path;
            const existing = mockStore.get(path) || {};
            if (options?.merge) {
                mockStore.set(path, { ...existing, ...data });
            } else {
                mockStore.set(path, data);
            }
        }),
        update: jest.fn((ref: any, data: any) => {
            const path = ref.path;
            const existing = mockStore.get(path);
            if (existing) {
                mockStore.set(path, { ...existing, ...data });
            }
        }),
    };
    await callback(t);
    return t; // Expose t for spying if needed, though side-effects on store are better
});

// Mock Implementation for Firebase Admin
jest.mock('@/lib/firebase/admin', () => ({
    db: {
        runTransaction: jest.fn(async (cb) => mockRunTransaction(cb)),
        doc: jest.fn((path) => mockDoc(path)),
        collection: jest.fn((name) => mockCollection(name)),
    },
    auth: {
        verifySessionCookie: jest.fn(),
    },
}));

// Mock Next.js Headers (Synchronous Mock as requested)
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => Promise.resolve({
        get: jest.fn((name) => {
            if (name === 'session') return { value: 'valid-token' };
            return undefined;
        }),
    })),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
    FieldValue: {
        serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP'),
        increment: jest.fn((n) => `INCREMENT_${n}`),
    },
}));

// --- TESTS ---

describe('updateLessonProgress (Audit Certified)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        clearStore();
        // Default Auth
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({ uid: 'user123' });
    });

    // TEST 1: Unauthorized
    it('should return 401 if no session cookie', async () => {
        require('next/headers').cookies.mockImplementationOnce(() => Promise.resolve({
            get: jest.fn(() => undefined),
        }));

        const result = await updateLessonProgress('c1', 'm1', 'l1', { status: 'completed' });
        expect(result).toEqual({ error: 'Unauthorized', status: 401 });
    });

    // TEST 2: Anti-Spoof (PRG-02)
    it('should reject if lesson is not in hierarchy', async () => {
        // Don't seed the lesson doc, so it won't exist
        const result = await updateLessonProgress('c1', 'm1', 'l1', { status: 'completed' }); // path: courses/c1/modules/m1/lessons/l1

        expect(result).toEqual({ error: 'Invalid lesson context', status: 400 });
    });

    // TEST 3: VP-02 (Merge maxWatchedSecond & Non-Regression)
    it('should merge maxWatchedSecond and not regress', async () => {
        const uid = 'user123';
        const courseId = 'c1';
        const moduleId = 'm1';
        const lessonId = 'l1';

        // Seed Prerequisites
        seed(`courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, { title: 'Lesson 1' });
        seed(`enrollments/${uid}_${courseId}`, { status: 'active' });
        seed(`progress/${uid}_${courseId}_${lessonId}`, {
            status: 'in_progress',
            maxWatchedSecond: 50
        }); // Existing progress

        // Action: Try to update with LESS progress (30s)
        await updateLessonProgress(courseId, moduleId, lessonId, {
            status: 'in_progress',
            maxWatchedSecond: 30
        });

        // Assert: Store should keep 50, not downgrade to 30
        const updatedDoc = mockStore.get(`progress/${uid}_${courseId}_${lessonId}`);
        expect(updatedDoc).toBeDefined();
        expect(updatedDoc.maxWatchedSecond).toBe(50); // Preserved High Watermark

        // Action: Update with MORE progress (100s)
        await updateLessonProgress(courseId, moduleId, lessonId, {
            status: 'in_progress',
            maxWatchedSecond: 100
        });

        // Assert: Store should update to 100
        const finalDoc = mockStore.get(`progress/${uid}_${courseId}_${lessonId}`);
        expect(finalDoc.maxWatchedSecond).toBe(100);
    });
});

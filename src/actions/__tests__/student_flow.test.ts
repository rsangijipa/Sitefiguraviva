
import { updateProfile, uploadAvatar } from '@/actions/profile';
import { updateLessonProgress } from '@/actions/progress';
import { generateCertificate } from '@/actions/certificate';
import { db, auth, storage } from '@/lib/firebase/admin';

// --- MOCK SETUP ---

// Mock Next.js Headers/Cache
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => Promise.resolve({
        get: jest.fn((name) => {
            if (name === 'session') return { value: 'valid-session-token' };
            return undefined;
        }),
    })),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock Firebase Admin
jest.mock('@/lib/firebase/admin', () => {
    // Audit Log Mock
    const mockAuditCollection = {
        add: jest.fn().mockResolvedValue({ id: 'audit_log_id' }),
    };

    const mockStatsCollection = {
        add: jest.fn(),
        doc: jest.fn(() => ({ set: jest.fn(), update: jest.fn() }))
    };

    // DB Mocks
    const mockDocFn = jest.fn((path) => ({
        path,
        get: jest.fn().mockImplementation(() => {
            if (path.includes('users/student1')) {
                return Promise.resolve({ exists: true, data: () => ({ displayName: 'Original Name', role: 'student' }) });
            }
            if (path.includes('courses/course1')) {
                return Promise.resolve({ exists: true, data: () => ({ title: 'Course 1' }) });
            }
            // Anti-Spoof check for Lesson
            if (path.includes('lessons/lesson1')) {
                return Promise.resolve({ exists: true, data: () => ({ title: 'Lesson 1' }) });
            }
            if (path.includes('enrollments/student1_course1')) {
                return Promise.resolve({
                    exists: true,
                    data: () => ({ status: 'active', userId: 'student1', courseId: 'course1' })
                });
            }
            // Certificate check (initially empty)
            return Promise.resolve({ exists: false, data: () => ({}) });
        }),
        set: jest.fn(),
        update: jest.fn(),
    }));

    const mockCollectionFn = jest.fn((name) => {
        if (name === 'audit_logs') return mockAuditCollection;
        return {
            doc: jest.fn((id) => mockDocFn(`${name}/${id}`)),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({ empty: true, docs: [] }), // Default empty search
            add: jest.fn().mockResolvedValue({ id: 'new_doc_id' }),
        };
    });

    const mockRunTransaction = jest.fn(async (callback) => {
        const t = {
            get: jest.fn((ref) => {
                // Simulate read inside transaction
                if (ref.path.includes('progress')) {
                    // Simulate existing progress or empty
                    return Promise.resolve({ exists: false, data: () => ({}) });
                }
                return mockDocFn(ref.path).get();
            }),
            set: jest.fn(),
            update: jest.fn(),
        };
        await callback(t);
        return t;
    });

    // Auth Mock
    const mockAuth = {
        verifySessionCookie: jest.fn(),
        updateUser: jest.fn(),
    };

    // Storage Mock
    const mockFile = {
        save: jest.fn(),
        makePublic: jest.fn(),
        publicUrl: jest.fn(() => 'https://storage.googleapis.com/avatar.jpg'),
    };
    const mockBucket = {
        file: jest.fn(() => mockFile),
    };

    return {
        db: {
            collection: mockCollectionFn,
            doc: mockDocFn,
            runTransaction: mockRunTransaction,
        },
        auth: mockAuth,
        storage: {
            bucket: jest.fn(() => mockBucket),
        },
    };
});

jest.mock('firebase-admin/firestore', () => ({
    FieldValue: {
        serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP'),
        increment: jest.fn(),
    },
}));

jest.mock('@/lib/audit', () => ({
    logAudit: jest.fn(),
}));

jest.mock('sharp', () => {
    const mockSharp = jest.fn(() => ({
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-sanitized-buffer')),
    }));
    return mockSharp;
});

// --- TESTS ---

describe('E2E Student Flow Integration', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Default Auth User
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
            uid: 'student1',
            email: 'student@test.com'
        });
    });

    it('Scenario 1: Update Profile (Avatar & Bio)', async () => {
        // 1. Upload Avatar
        const formData = new FormData();
        const blob = new Blob(['dummy binary content'], { type: 'image/jpeg' });
        formData.append('file', blob, 'avatar.jpg');

        const uploadRes = await uploadAvatar(formData);

        console.log('DEBUG: uploadRes', uploadRes);

        if (uploadRes.error) {
            throw new Error(`Upload Failed: ${uploadRes.error}`);
        }

        expect(uploadRes).toEqual({ success: true, url: expect.stringContaining('avatar.jpg') });

        // Verify Storage calls
        expect(storage.bucket).toHaveBeenCalled();
        expect(auth.updateUser).toHaveBeenCalledWith('student1', expect.objectContaining({ photoURL: expect.any(String) }));

        // 2. Update Bio
        const updateRes = await updateProfile({ displayName: 'New Name', bio: 'I am learning!' });
        console.log('DEBUG: updateRes', updateRes);

        expect(updateRes).toEqual({ success: true });

        // Verify Firestore update
        expect(db.doc).toHaveBeenCalledWith('users/student1');
    });

    it('Scenario 2: Make Progress & Finish Course', async () => {
        const courseId = 'course1';
        const moduleId = 'module1';
        const lessonId = 'lesson1';

        // 1. Watch 50%
        await updateLessonProgress(courseId, moduleId, lessonId, { status: 'in_progress', percent: 50, maxWatchedSecond: 30 });

        // Verify Transaction usage
        expect(db.runTransaction).toHaveBeenCalled();

        // 2. Finish Lesson (100%)
        const progressRes = await updateLessonProgress(courseId, moduleId, lessonId, { status: 'completed' });
        expect(progressRes).toEqual({ success: true });
    });

    it('Scenario 3: Issue Certificate', async () => {
        // 1. Attempt generation
        const certRes = await generateCertificate('course1');

        // Expect success
        expect(certRes).toEqual(expect.objectContaining({
            success: true,
            certificateId: 'new_doc_id'
        }));

        // Verify DB calls
        // Should query for existing cert
        // Should check enrollment
        // Should add to certificates collection
        expect(db.collection).toHaveBeenCalledWith('certificates');
    });

});

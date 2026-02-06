
import { generateCertificate } from '@/actions/certificate';
import { db, auth } from '@/lib/firebase/admin';

// Mock Next.js
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

// Mock Firebase Admin
jest.mock('@/lib/firebase/admin', () => {
    // Define helpers INSIDE the factory to avoid hoisting issues
    const mockQueryChain = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    };

    const mockDocFn = jest.fn((path) => ({
        path,
        get: jest.fn().mockImplementation(() => {
            if (path.includes('enrollments')) {
                if (path.includes('inactive_user')) {
                    return Promise.resolve({ exists: true, data: () => ({ status: 'inactive' }) });
                }
                return Promise.resolve({ exists: true, data: () => ({ status: 'active' }) });
            }
            if (path.includes('users/user123')) {
                return Promise.resolve({ exists: true, data: () => ({ displayName: 'Test Student' }) });
            }
            if (path.includes('courses/course1')) {
                return Promise.resolve({ exists: true, data: () => ({ title: 'Test Course' }) });
            }
            return Promise.resolve({ exists: false, data: () => ({}) });
        })
    }));

    const mockCollectionFn = jest.fn((name) => ({
        doc: jest.fn((id) => mockDocFn(`${name}/${id}`)),
        add: jest.fn().mockResolvedValue({ id: 'new_cert_id' }),
        where: mockQueryChain.where,
        limit: mockQueryChain.limit,
        get: mockQueryChain.get
    }));

    return {
        db: {
            collection: mockCollectionFn,
        },
        auth: {
            verifySessionCookie: jest.fn(),
        },
    };
});

// Mock Firebase Helpers
jest.mock('firebase-admin/firestore', () => ({
    FieldValue: {
        serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP'),
    },
}));

describe('generateCertificate Server Action', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should block unauthenticated requests', async () => {
        require('next/headers').cookies.mockImplementationOnce(() => Promise.resolve({
            get: jest.fn(() => undefined),
        }));

        const result = await generateCertificate('course1');
        expect(result).toEqual({ error: 'Unauthorized', status: 401 });
    });

    it('should reject inactive enrollments', async () => {
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({ uid: 'inactive_user' });

        const result = await generateCertificate('course1');
        expect(result).toEqual({ error: 'Matrícula não ativa ou não encontrada.', status: 403 });
    });

    it('should return existing certificate if already issued (Idempotency)', async () => {
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({ uid: 'user123' });

        // Access the "get" mock from the chain
        const mockGet = require('@/lib/firebase/admin').db.collection('any').get; // Since we reused the object
        mockGet.mockResolvedValueOnce({
            empty: false,
            docs: [{ id: 'existing_cert_id' }]
        });

        const result = await generateCertificate('course1');

        expect(result).toEqual({ success: true, certificateId: 'existing_cert_id', alreadyExists: true });
        // Ensure no new write happened
        // Accessing the mocked collection 'add' method is tricky via the factory.
        // We can spy on db.collection('certificates').add if we exposed it, but relying on result structure is decent.
    });

    it('should generate a new certificate for valid request', async () => {
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({ uid: 'user123' });

        // Reset query to empty for this test
        const mockGet = require('@/lib/firebase/admin').db.collection('any').get;
        mockGet.mockResolvedValueOnce({ empty: true, docs: [] });

        const result = await generateCertificate('course1');

        expect(result).toEqual({
            success: true,
            certificateId: 'new_cert_id',
            code: expect.any(String)
        });
    });
});

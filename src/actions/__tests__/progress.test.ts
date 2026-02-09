import { db, auth } from "@/lib/firebase/admin";
import { updateLessonProgress } from "@/app/actions/progress";

// --- MOCK SETUP ---

// In-memory Mock Store (Pattern: Map<path, data>)
const mockStore = new Map<string, any>();

// Helper to seed store
const seed = (path: string, data: any) => mockStore.set(path, data);
const clearStore = () => mockStore.clear();

// Mock Firestore Factory
const mockCollection = (name: string) => ({
  doc: jest.fn((id: string) => mockDoc(`${name}/${id}`)),
  where: jest.fn(() => ({
    get: jest.fn(async () => ({ docs: [] })),
  })),
  orderBy: jest.fn(() => ({
    get: jest.fn(async () => ({ docs: [] })),
  })),
});

const mockDoc = (path: string) => ({
  path,
  get: jest.fn(async () => {
    const data = mockStore.get(path);
    return {
      exists: !!data,
      data: () => data || {},
      ref: {
        path,
        collection: (name: string) => mockCollection(`${path}/${name}`),
      },
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
  collection: (name: string) => mockCollection(`${path}/${name}`),
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
        ref,
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

const mockDb = {
  runTransaction: jest.fn(async (cb) => mockRunTransaction(cb)),
  doc: jest.fn((path) => mockDoc(path)),
  collection: jest.fn((name) => mockCollection(name)),
};

const mockAuth = {
  verifySessionCookie: jest.fn(),
};

// Mock Implementation for Firebase Admin
jest.mock("@/lib/firebase/admin", () => ({
  db: mockDb,
  adminDb: mockDb,
  auth: mockAuth,
  adminAuth: mockAuth,
}));

// Mock Next.js Headers (Synchronous Mock as requested)
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name) => {
        if (name === "session") return { value: "valid-token" };
        return undefined;
      }),
    }),
  ),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
    increment: jest.fn((n) => `INCREMENT_${n}`),
  },
}));

// --- TESTS ---

describe("updateLessonProgress (Audit Certified)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearStore();
    // Default Auth
    (mockAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user123",
    });
  });

  // TEST 1: Unauthorized
  it("should return error if no session cookie", async () => {
    require("next/headers").cookies.mockImplementationOnce(() =>
      Promise.resolve({
        get: jest.fn(() => undefined),
      }),
    );

    const result = await updateLessonProgress("c1", "m1", "l1", {
      status: "completed",
    });
    expect(result).toEqual({ success: false, error: "Unauthenticated" });
  });

  // TEST 2: Anti-Spoof (PRG-02) - Enrollment Check
  // The new action checks assertCanAccessCourse which checks enrollment
  it("should reject if user is not enrolled (access denied)", async () => {
    // We need to mock the enrollment check if it's done via DB
    // assertCanAccessCourse queries 'enrollments/{uid}_{courseId}'
    // We ensure it doesn't exist

    const result = await updateLessonProgress("c1", "m1", "l1", {
      status: "completed",
    });
    // Since we didn't seed enrollment, assertCanAccessCourse should fail
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Access Denied/i);
  });

  // TEST 3: VP-02 (Merge maxWatchedSecond & Non-Regression)
  it("should merge maxWatchedSecond and not regress", async () => {
    const uid = "user123";
    const courseId = "c1";
    const moduleId = "m1";
    const lessonId = "l1";

    // Seed Prerequisites
    seed(`courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      title: "Lesson 1",
    });
    seed(`enrollments/${uid}_${courseId}`, { status: "active" });
    seed(`progress/${uid}_${courseId}_${lessonId}`, {
      status: "in_progress",
      maxWatchedSecond: 50,
    }); // Existing progress

    // Action: Try to update with LESS progress (30s)
    await updateLessonProgress(courseId, moduleId, lessonId, {
      status: "in_progress",
      maxWatchedSecond: 30,
    });

    // Assert: Store should keep 50, not downgrade to 30
    const updatedDoc = mockStore.get(`progress/${uid}_${courseId}_${lessonId}`);
    expect(updatedDoc).toBeDefined();
    expect(updatedDoc.maxWatchedSecond).toBe(50); // Preserved High Watermark

    // Action: Update with MORE progress (100s)
    await updateLessonProgress(courseId, moduleId, lessonId, {
      status: "in_progress",
      maxWatchedSecond: 100,
    });

    // Assert: Store should update to 100
    const finalDoc = mockStore.get(`progress/${uid}_${courseId}_${lessonId}`);
    expect(finalDoc.maxWatchedSecond).toBe(100);
  });
});

import { updateProfile, uploadAvatar } from "@/actions/profile";
import { updateLessonProgress } from "@/app/actions/progress";
import { issueCertificate } from "@/actions/certificate";
import { db, auth, storage, adminAuth } from "@/lib/firebase/admin";
import { progressService } from "@/lib/progress/progressService";
import { gamificationService } from "@/lib/gamification/gamificationService";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { verifySession } from "@/lib/auth/server";
import { CertificateIssuer } from "@/lib/certificates/issuer";
import { awardXp } from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name) => {
        if (name === "session") return { value: "valid-session-token" };
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
    increment: jest.fn(),
  },
  Timestamp: {
    now: jest.fn(() => "MOCK_TIMESTAMP"),
  },
}));

jest.mock("@/lib/audit", () => ({
  logAudit: jest.fn(),
}));

jest.mock("sharp", () => {
  const mockSharp = jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from("mock-sanitized-buffer")),
  }));
  return mockSharp;
});

jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: jest.fn(),
}));

jest.mock("@/lib/progress/progressService", () => ({
  progressService: {
    updateLessonProgress: jest.fn(),
  },
}));

jest.mock("@/lib/gamification/gamificationService", () => ({
  gamificationService: {
    onLessonCompletion: jest.fn(),
  },
}));

jest.mock("@/lib/certificates/issuer", () => ({
  CertificateIssuer: {
    issue: jest.fn(),
  },
}));

jest.mock(
  "@/features/certificates/infrastructure/supabaseCertificateIssuer.server",
  () => ({
    issueCertificateSupabase: jest.fn().mockResolvedValue({
      success: true,
      certificateId: "new_doc_id",
      verificationCode: "FV-26-AAAAAA",
    }),
  }),
);
jest.mock(
  "@/features/notifications/infrastructure/supabaseNotificationRepository.server",
  () => ({
    createNotification: jest.fn().mockResolvedValue(undefined),
  }),
);
const mockLessonsData = [
  {
    id: "lesson1",
    course_id: "course1",
    module_id: "module1",
    is_published: true,
  },
];
const mockModulesData = [
  { id: "module1", course_id: "course1", is_published: true },
];

function createMockSupabaseQuery(data: any = null) {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(() => query),
    update: jest.fn(() => query),
    upsert: jest.fn(() => query),
    maybeSingle: jest.fn(async () => ({ data, error: null })),
    single: jest.fn(async () => ({ data, error: null })),
    then: (resolve: any) =>
      Promise.resolve({ data, error: null }).then(resolve),
  };
  return query;
}

jest.mock("@/lib/auth/supabase-session", () => ({
  getSupabaseSessionClaims: jest.fn().mockResolvedValue({
    uid: "student1",
    email: "student1@figura.viva",
    role: "student",
  }),
}));

jest.mock("@/infrastructure/supabase/storage.server", () => ({
  uploadPublicAvatar: jest
    .fn()
    .mockResolvedValue(
      "https://example.supabase.co/storage/v1/object/public/avatars/avatar.jpg",
    ),
}));

jest.mock(
  "@/features/gamification/infrastructure/supabaseGamificationRepository.server",
  () => ({
    awardXp: jest.fn().mockResolvedValue({ awarded: true, amount: 50 }),
  }),
);

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === "lessons") {
        const q = createMockSupabaseQuery(mockLessonsData[0]);
        q.then = (resolve: any) =>
          Promise.resolve({ data: mockLessonsData, error: null }).then(resolve);
        return q;
      }
      if (table === "course_modules") {
        return createMockSupabaseQuery(mockModulesData[0]);
      }
      if (table === "lesson_progress") {
        const q = createMockSupabaseQuery(null);
        q.then = (resolve: any) =>
          Promise.resolve({
            data: [{ lesson_id: "lesson1" }],
            error: null,
          }).then(resolve);
        return q;
      }
      return createMockSupabaseQuery({});
    }),
    auth: {
      admin: {
        updateUserById: jest.fn().mockResolvedValue({ error: null }),
      },
    },
  })),
}));

jest.mock("@/lib/firebase/admin", () => {
  const mockUserDoc = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ displayName: "Original Name", role: "student" }),
    }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({ id: "notification_id" }),
    })),
  };

  const mockCourseDoc = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ title: "Course 1" }),
    }),
  };

  const mockCollection = jest.fn((name: string) => ({
    doc: jest.fn((id: string) => {
      if (name === "users") return mockUserDoc;
      if (name === "courses") return mockCourseDoc;
      return {
        get: jest.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      };
    }),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    add: jest.fn().mockResolvedValue({ id: "new_doc_id" }),
  }));

  const authMock = {
    verifySessionCookie: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockFile = {
    save: jest.fn().mockResolvedValue(undefined),
    makePublic: jest.fn().mockResolvedValue(undefined),
    publicUrl: jest.fn(() => "https://storage.googleapis.com/avatar.jpg"),
  };

  return {
    db: {
      collection: mockCollection,
    },
    adminDb: {
      collection: mockCollection,
    },
    auth: authMock,
    adminAuth: authMock,
    storage: {
      bucket: jest.fn(() => ({
        file: jest.fn(() => mockFile),
      })),
    },
  };
});

describe("Student Flow Smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (verifySession as jest.Mock).mockResolvedValue({
      uid: "student1",
      email: "student@test.com",
      role: "student",
      isAdmin: false,
      isStaff: false,
      isActive: true,
    });
    (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "student1",
      email: "student@test.com",
      role: "student",
    });
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "student1",
      email: "student@test.com",
      role: "student",
    });
    (assertCanAccessCourse as jest.Mock).mockResolvedValue({
      uid: "student1",
      courseId: "course1",
      enrollmentId: "student1_course1",
      paymentMethod: "pix",
    });
    (progressService.updateLessonProgress as jest.Mock).mockResolvedValue(
      undefined,
    );
    (gamificationService.onLessonCompletion as jest.Mock).mockResolvedValue(
      undefined,
    );
    (CertificateIssuer.issue as jest.Mock).mockResolvedValue({
      success: true,
      certificateId: "new_doc_id",
      verificationCode: "FV-26-AAAAAA",
    });
  });

  it("updates profile and avatar", async () => {
    const fileMock = {
      type: "image/jpeg",
      size: 1200,
      arrayBuffer: jest.fn().mockResolvedValue(Buffer.from("dummy-content")),
    };
    const formData = {
      get: jest.fn((key: string) => (key === "file" ? fileMock : null)),
    } as unknown as FormData;

    const uploadRes = await uploadAvatar(formData);
    expect(uploadRes).toEqual({
      success: true,
      url: expect.stringContaining("avatar.jpg"),
    });

    const updateRes = await updateProfile({
      displayName: "New Name",
      bio: "I am learning!",
    });

    expect(updateRes).toEqual({ success: true });
  });

  it("updates lesson progress and marks completion", async () => {
    const inProgress = await updateLessonProgress(
      "course1",
      "module1",
      "lesson1",
      {
        status: "in_progress",
        percent: 50,
        maxWatchedSecond: 30,
      },
    );
    expect(inProgress).toEqual({ success: true });

    const completed = await updateLessonProgress(
      "course1",
      "module1",
      "lesson1",
      {
        status: "completed",
      },
    );
    expect(completed).toEqual({ success: true });
    expect(awardXp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "student1",
        reason: "lesson_completed",
      }),
    );
  });

  it("issues certificate", async () => {
    const certRes = await issueCertificate("course1");

    expect(certRes).toEqual({
      success: true,
      certificateId: "new_doc_id",
      certificateNumber: "FV-26-AAAAAA",
    });
    // The action now uses the canonical Supabase issuer directly.
  });
});

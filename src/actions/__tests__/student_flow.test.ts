import { updateProfile, uploadAvatar } from "@/actions/profile";
import { updateLessonProgress } from "@/app/actions/progress";
import { issueCertificate } from "@/actions/certificate";
import { db, auth, storage, adminAuth } from "@/lib/firebase/admin";
import { progressService } from "@/lib/progress/progressService";
import { gamificationService } from "@/lib/gamification/gamificationService";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { CertificateIssuer } from "@/lib/certificates/issuer";

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
    expect(storage.bucket).toHaveBeenCalled();
    expect(auth.updateUser).toHaveBeenCalledWith(
      "student1",
      expect.objectContaining({ photoURL: expect.any(String) }),
    );

    const updateRes = await updateProfile({
      displayName: "New Name",
      bio: "I am learning!",
    });

    expect(updateRes).toEqual({ success: true });
    expect(db.collection).toHaveBeenCalledWith("users");
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

    expect(progressService.updateLessonProgress).toHaveBeenCalledTimes(2);
    expect(gamificationService.onLessonCompletion).toHaveBeenCalledTimes(1);
  });

  it("issues certificate", async () => {
    const certRes = await issueCertificate("course1");

    expect(certRes).toEqual({
      success: true,
      certificateId: "new_doc_id",
      certificateNumber: "FV-26-AAAAAA",
    });
    expect(CertificateIssuer.issue).toHaveBeenCalledWith(
      "course1",
      "student1",
      "student1",
      false,
    );
  });
});

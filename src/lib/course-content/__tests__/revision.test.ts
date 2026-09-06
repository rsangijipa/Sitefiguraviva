import { touchCourseRevision } from "../revision";
import { adminDb } from "@/lib/firebase/admin";
import { logAuditInTransaction } from "@/lib/audit";

jest.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
}));

jest.mock("@/lib/audit", () => ({
  logAuditInTransaction: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: jest.fn(() => "SERVER_TIME") },
}));

describe("touchCourseRevision", () => {
  const courseRef = { id: "course-1" };
  const transaction = {
    get: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn(() => courseRef),
    });
    (adminDb.runTransaction as jest.Mock).mockImplementation(async (callback) =>
      callback(transaction),
    );
  });

  it("increments the persisted revision and audits the structural change", async () => {
    transaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ contentRevision: 4 }),
    });

    await expect(
      touchCourseRevision("course-1", "lesson-created", {
        uid: "admin-1",
        email: "admin@example.com",
        role: "admin",
      }),
    ).resolves.toEqual({ previousRevision: 4, revision: 5 });

    expect(transaction.update).toHaveBeenCalledWith(
      courseRef,
      expect.objectContaining({ contentRevision: 5 }),
    );
    expect(logAuditInTransaction).toHaveBeenCalledWith(
      transaction,
      expect.objectContaining({
        action: "COURSE_CONTENT_CHANGED",
        actor: expect.objectContaining({ uid: "admin-1" }),
        target: { collection: "courses", id: "course-1" },
      }),
    );
  });

  it("treats a legacy course as revision one", async () => {
    transaction.get.mockResolvedValue({ exists: true, data: () => ({}) });

    await expect(
      touchCourseRevision("course-1", "module-updated", { uid: "admin-1" }),
    ).resolves.toEqual({ previousRevision: 1, revision: 2 });
  });

  it("rejects a missing course without writing an audit event", async () => {
    transaction.get.mockResolvedValue({ exists: false });

    await expect(
      touchCourseRevision("missing", "lesson-deleted", { uid: "admin-1" }),
    ).rejects.toThrow("Course not found");

    expect(logAuditInTransaction).not.toHaveBeenCalled();
  });
});

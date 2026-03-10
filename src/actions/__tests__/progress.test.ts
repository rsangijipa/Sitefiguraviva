import { updateLessonProgress } from "@/app/actions/progress";
import { adminAuth } from "@/lib/firebase/admin";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { progressService } from "@/lib/progress/progressService";
import { gamificationService } from "@/lib/gamification/gamificationService";
import { revalidatePath } from "next/cache";

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

jest.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifySessionCookie: jest.fn(),
  },
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

describe("updateLessonProgress action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user123",
    });
    (assertCanAccessCourse as jest.Mock).mockResolvedValue({
      uid: "user123",
      courseId: "c1",
      enrollmentId: "user123_c1",
      paymentMethod: "pix",
    });
    (progressService.updateLessonProgress as jest.Mock).mockResolvedValue(
      undefined,
    );
    (gamificationService.onLessonCompletion as jest.Mock).mockResolvedValue(
      undefined,
    );
  });

  it("returns unauthenticated when session cookie is missing", async () => {
    const { cookies } = require("next/headers");
    (cookies as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        get: jest.fn(() => undefined),
      }),
    );

    const result = await updateLessonProgress("c1", "m1", "l1", {
      status: "completed",
    });

    expect(result).toEqual({ success: false, error: "Unauthenticated" });
  });

  it("returns error when access gate denies enrollment", async () => {
    (assertCanAccessCourse as jest.Mock).mockRejectedValueOnce(
      new Error("You are not enrolled in this course"),
    );

    const result = await updateLessonProgress("c1", "m1", "l1", {
      status: "completed",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("enrolled");
  });

  it("updates in-progress state without completion side effects", async () => {
    const result = await updateLessonProgress("c1", "m1", "l1", {
      status: "in_progress",
      percent: 42,
      maxWatchedSecond: 38,
    });

    expect(result).toEqual({ success: true });
    expect(progressService.updateLessonProgress).toHaveBeenCalledWith(
      "user123",
      "c1",
      "m1",
      "l1",
      { status: "in_progress", percent: 42, maxWatchedSecond: 38 },
    );
    expect(gamificationService.onLessonCompletion).not.toHaveBeenCalled();
  });

  it("triggers completion side effects when lesson is completed", async () => {
    const result = await updateLessonProgress("c1", "m1", "l1", {
      status: "completed",
    });

    expect(result).toEqual({ success: true });
    expect(gamificationService.onLessonCompletion).toHaveBeenCalledWith(
      "user123",
      "c1",
      "l1",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/portal/course/c1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/enrollments");
  });
});

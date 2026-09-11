import { updateLessonProgress } from "@/app/actions/progress";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { verifySession } from "@/lib/auth/server";
import { updateLessonProgressSupabase } from "@/features/progress/infrastructure/supabaseProgressService.server";
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

jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: jest.fn(),
}));

jest.mock(
  "@/features/progress/infrastructure/supabaseProgressService.server",
  () => ({
    updateLessonProgressSupabase: jest.fn(),
    markLessonCompletedSupabase: jest.fn(),
    recalculateProgressSupabase: jest.fn(),
  }),
);

jest.mock(
  "@/features/progress/infrastructure/supabaseProgressRepository.server",
  () => ({
    upsertLessonProgress: jest.fn(),
  }),
);

jest.mock("@/lib/gamification/gamificationService", () => ({
  gamificationService: {
    onLessonCompletion: jest.fn(),
  },
}));

describe("updateLessonProgress action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifySession as jest.Mock).mockResolvedValue({
      uid: "user123",
      email: "user@example.com",
      role: "student",
      isAdmin: false,
      isStaff: false,
      isActive: true,
    });
    (assertCanAccessCourse as jest.Mock).mockResolvedValue({
      uid: "user123",
      courseId: "c1",
      enrollmentId: "user123_c1",
      paymentMethod: "pix",
    });
    (updateLessonProgressSupabase as jest.Mock).mockResolvedValue(undefined);
    (gamificationService.onLessonCompletion as jest.Mock).mockResolvedValue(
      undefined,
    );
  });

  it("returns unauthenticated when session cookie is missing", async () => {
    (verifySession as jest.Mock).mockResolvedValueOnce(null);

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
    expect(updateLessonProgressSupabase).toHaveBeenCalledWith(
      "user123",
      "c1",
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

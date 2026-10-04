jest.mock("@/lib/auth/access-gate", () => ({
  assertCurrentCourseAccess: jest.fn(),
  assertCanAccessCourse: jest.fn(),
}));
jest.mock("@/lib/auth/authoring-gate", () => ({
  assertCanAuthorCourse: jest.fn(),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({
    getAdminCourse: jest.fn(),
    listAdminModules: jest.fn(),
    listAdminLessons: jest.fn(),
  }),
);
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import { assertCurrentCourseAccess } from "@/lib/auth/access-gate";
import { assertCanAuthorCourse } from "@/lib/auth/authoring-gate";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  listAdminModules,
  listAdminLessons,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { getLessonContentAction, updateLessonBlocksAction } from "../lms";
import { revalidatePath } from "next/cache";
const rpc = jest.fn();
beforeEach(() => {
  jest.resetAllMocks();
  jest
    .mocked(assertCurrentCourseAccess)
    .mockResolvedValue({
      uid: "student",
      courseId: "course",
      enrollmentId: "e",
      paymentMethod: "pix",
    });
  jest
    .mocked(assertCanAuthorCourse)
    .mockResolvedValue({
      uid: "admin",
      isActive: true,
      isAdmin: true,
      isStaff: true,
    });
  jest
    .mocked(listAdminModules)
    .mockResolvedValue([{ id: "module", isPublished: true }] as any);
  jest.mocked(listAdminLessons).mockResolvedValue([
    {
      id: "lesson",
      moduleId: "module",
      courseId: "course",
      isPublished: true,
      blocks: [
        { id: "public", content: { text: "ok" } },
        { id: "secret", isPublished: false, content: { text: "SECRET_DRAFT" } },
      ],
    },
  ] as any);
  jest.mocked(createSupabaseServiceClient).mockReturnValue({ rpc } as any);
  rpc.mockResolvedValue({ error: null });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
it.each(["visitor", "foreign-course", "pending-payment", "inactive"])(
  "rejects %s before privileged content reads",
  async () => {
    jest
      .mocked(assertCurrentCourseAccess)
      .mockRejectedValue(new Error("denied"));
    expect(
      await getLessonContentAction("course", "module", "lesson"),
    ).toMatchObject({ success: false });
    expect(listAdminModules).not.toHaveBeenCalled();
    expect(listAdminLessons).not.toHaveBeenCalled();
  },
);
it("cannot leak hidden blocks through the nested lesson object", async () => {
  const result = await getLessonContentAction("course", "module", "lesson");
  expect(result.success).toBe(true);
  expect(JSON.stringify(result)).not.toContain("SECRET_DRAFT");
  expect(JSON.stringify(result)).not.toContain('"secret"');
});
it("denies a published lesson under a draft module", async () => {
  jest
    .mocked(listAdminModules)
    .mockResolvedValue([{ id: "module", isPublished: false }] as any);
  expect(
    await getLessonContentAction("course", "module", "lesson"),
  ).toMatchObject({ success: false });
  expect(listAdminLessons).not.toHaveBeenCalled();
});
it("denies a draft lesson and a forged module identifier", async () => {
  jest
    .mocked(listAdminLessons)
    .mockResolvedValue([{ id: "lesson", isPublished: false }] as any);
  expect(
    await getLessonContentAction("course", "module", "lesson"),
  ).toMatchObject({ success: false });
  expect(
    await getLessonContentAction("course", "foreign-module", "lesson"),
  ).toMatchObject({ success: false });
});
it("blocks an unauthorized content edit before the privileged RPC", async () => {
  jest.mocked(assertCanAuthorCourse).mockRejectedValue(new Error("denied"));
  expect(
    await updateLessonBlocksAction("course", "module", "lesson", []),
  ).toMatchObject({ success: false });
  expect(rpc).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});
it("checks module ownership before saving", async () => {
  expect(
    await updateLessonBlocksAction("course", "foreign", "lesson", []),
  ).toMatchObject({ success: false });
  expect(rpc).not.toHaveBeenCalled();
});
it("saves with all three scoped identifiers and reports RPC failures", async () => {
  expect(
    await updateLessonBlocksAction("course", "module", "lesson", []),
  ).toMatchObject({ success: true });
  expect(rpc).toHaveBeenCalledWith("save_lesson_content", {
    p_course_id: "course",
    p_module_id: "module",
    p_lesson_id: "lesson",
    p_blocks: [],
  });
  rpc.mockResolvedValue({ error: new Error("missing lesson") });
  expect(
    await updateLessonBlocksAction("course", "module", "foreign-lesson", []),
  ).toMatchObject({ success: false });
});

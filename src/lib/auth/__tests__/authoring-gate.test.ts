import { assertCanAuthorCourse } from "../authoring-gate";
import { requireStaff } from "../server";
import { getAdminCourse } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
jest.mock("../server", () => ({ requireStaff: jest.fn() }));
jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({ getAdminCourse: jest.fn() }),
);
beforeEach(() => {
  jest.resetAllMocks();
  jest
    .mocked(requireStaff)
    .mockResolvedValue({
      uid: "tutor",
      isActive: true,
      isStaff: true,
      isAdmin: false,
    });
  jest
    .mocked(getAdminCourse)
    .mockResolvedValue({
      id: "course",
      team: { tutor: { role: "author" } },
    } as any);
});
it("allows a tutor assigned to the course", async () => {
  expect(await assertCanAuthorCourse("course")).toMatchObject({ uid: "tutor" });
});
it("rejects an unassigned tutor", async () => {
  jest
    .mocked(getAdminCourse)
    .mockResolvedValue({
      id: "course",
      team: { other: { role: "tutor" } },
    } as any);
  await expect(assertCanAuthorCourse("course")).rejects.toThrow(
    "Access denied",
  );
});
it("allows an active administrator", async () => {
  jest
    .mocked(requireStaff)
    .mockResolvedValue({
      uid: "admin",
      isActive: true,
      isStaff: true,
      isAdmin: true,
    });
  expect(await assertCanAuthorCourse("course")).toMatchObject({ uid: "admin" });
});
it("rejects visitors before reading the course", async () => {
  jest.mocked(requireStaff).mockRejectedValue(new Error("Unauthorized"));
  await expect(assertCanAuthorCourse("course")).rejects.toThrow();
  expect(getAdminCourse).not.toHaveBeenCalled();
});
it("rejects inactive accounts even if marked as staff", async () => {
  jest
    .mocked(requireStaff)
    .mockResolvedValue({
      uid: "admin",
      isActive: false,
      isStaff: true,
      isAdmin: true,
    });
  await expect(assertCanAuthorCourse("course")).rejects.toThrow();
  expect(getAdminCourse).not.toHaveBeenCalled();
});
it("does not accept a missing course", async () => {
  jest.mocked(getAdminCourse).mockResolvedValue(null);
  await expect(assertCanAuthorCourse("course")).rejects.toThrow(
    "Course not found",
  );
});

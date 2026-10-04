/** @jest-environment node */
const getAdminCourse = jest.fn();
jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({ getAdminCourse: (...args: unknown[]) => getAdminCourse(...args) }),
);
jest.mock("../CourseEditorClient", () => ({
  __esModule: true,
  default: () => null,
}));
import AdminCourseEditorPage from "../page";

it("loads normalized Supabase data for the editor instead of a legacy Firebase record", async () => {
  const course = {
    id: "course",
    title: "Curso",
    mediators: [
      { name: "Ana", role: "Mediadora", image: "/ana.webp", bio: "Currículo" },
    ],
  };
  getAdminCourse.mockResolvedValue(course);
  const result = await AdminCourseEditorPage({
    params: Promise.resolve({ id: "course" }),
  });
  expect(getAdminCourse).toHaveBeenCalledWith("course");
  expect(result.props.initialCourse).toEqual(course);
});

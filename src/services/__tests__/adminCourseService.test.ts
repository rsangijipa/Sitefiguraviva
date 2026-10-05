jest.mock("@/app/actions/admin/course-mutations", () => ({
  deleteMaterialAction: jest.fn(),
  createCourseResultAction: jest.fn(),
}));

import {
  createCourseResultAction,
  deleteMaterialAction,
} from "@/app/actions/admin/course-mutations";
import { adminCourseService } from "@/services/adminCourseService";

describe("adminCourseService.deleteMaterial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards the storage path to the delete action", async () => {
    await adminCourseService.deleteMaterial(
      "course-1",
      "material-1",
      "uploads/admin/uuid-guide.pdf",
    );

    expect(deleteMaterialAction).toHaveBeenCalledWith(
      "course-1",
      "material-1",
      "uploads/admin/uuid-guide.pdf",
    );
  });
});

describe("adminCourseService.createCourse", () => {
  it("returns the saved ID", async () => {
    jest.mocked(createCourseResultAction).mockResolvedValueOnce({
      success: true,
      courseId: "course-1",
    });
    await expect(
      adminCourseService.createCourse({ title: "Curso" }),
    ).resolves.toBe("course-1");
  });

  it("keeps the safe action error visible to the form", async () => {
    jest.mocked(createCourseResultAction).mockResolvedValueOnce({
      success: false,
      message: "Selecione mediadores cadastrados.",
    });
    await expect(
      adminCourseService.createCourse({ title: "Curso" }),
    ).rejects.toThrow("Selecione mediadores cadastrados.");
  });
});

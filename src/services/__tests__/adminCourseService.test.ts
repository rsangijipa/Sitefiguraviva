jest.mock("@/app/actions/admin/course-mutations", () => ({
  deleteMaterialAction: jest.fn(),
}));

import { deleteMaterialAction } from "@/app/actions/admin/course-mutations";
import { adminCourseService } from "../adminCourseService";

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

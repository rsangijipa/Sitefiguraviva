jest.mock("@/services/adminCourseService", () => ({
  adminCourseService: {
    getMaterials: jest.fn(),
    getModules: jest.fn().mockResolvedValue([]),
    addMaterial: jest.fn(),
    deleteMaterial: jest.fn().mockResolvedValue({ success: true }),
    updateMaterial: jest.fn(),
  },
}));

jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: jest.fn() }),
}));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { adminCourseService } from "@/services/adminCourseService";
import CourseMaterialsTab from "../CourseMaterialsTab";

describe("CourseMaterialsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it("passes the material file path to the delete service", async () => {
    const initialMaterials = [
      {
        id: "material-1",
        title: "Guide",
        type: "pdf",
        url: "https://example.com/file.pdf",
        filePath: "uploads/admin/uuid-guide.pdf",
        description: "2 MB",
        visibility: "enrolled",
      },
    ];

    (adminCourseService.getMaterials as jest.Mock).mockResolvedValue(
      initialMaterials,
    );

    render(
      <CourseMaterialsTab
        courseId="course-1"
        initialMaterials={initialMaterials}
      />,
    );

    await waitFor(() => expect(screen.getByText("Guide")).toBeInTheDocument());

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(adminCourseService.deleteMaterial).toHaveBeenCalledWith(
      "course-1",
      "material-1",
      "uploads/admin/uuid-guide.pdf",
    );
  });
});

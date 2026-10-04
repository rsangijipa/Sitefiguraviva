jest.mock("@/services/adminCourseService", () => ({
  adminCourseService: {
    getMaterials: jest.fn(),
    getModules: jest.fn().mockResolvedValue([]),
    addMaterial: jest.fn(),
    deleteMaterial: jest.fn().mockResolvedValue({ success: true }),
    updateMaterial: jest.fn(),
  },
}));

const toast = jest.fn();
jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: (...args: unknown[]) => toast(...args) }),
}));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { adminCourseService } from "@/services/adminCourseService";
import CourseMaterialsTab from "../CourseMaterialsTab";

describe("CourseMaterialsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it("deletes material metadata without trusting the caller file path", async () => {
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

    render(<CourseMaterialsTab courseId="course-1" />);

    await waitFor(() => expect(screen.getByText("Guide")).toBeInTheDocument());

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(adminCourseService.deleteMaterial).toHaveBeenCalledWith(
      "course-1",
      "material-1",
    );
  });
});

it("keeps visibility unchanged and reports failed persistence", async () => {
  jest
    .mocked(adminCourseService.getMaterials)
    .mockResolvedValue([
      {
        id: "m",
        title: "Guide",
        type: "link",
        url: "/api/materials/m",
        visibility: "enrolled",
        isPublished: true,
      },
    ] as any);
  jest
    .mocked(adminCourseService.updateMaterial)
    .mockRejectedValueOnce(new Error("write failed"));
  render(<CourseMaterialsTab courseId="c" />);
  fireEvent.click(await screen.findByRole("button", { name: "Alunos" }));
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      "Não foi possível alterar a visibilidade.",
      "error",
    ),
  );
  expect(screen.getByRole("button", { name: "Alunos" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Pós-Curso" }),
  ).not.toBeInTheDocument();
});
it("reloads persisted visibility after a successful change", async () => {
  jest
    .mocked(adminCourseService.getMaterials)
    .mockResolvedValueOnce([
      {
        id: "m",
        title: "Guide",
        type: "link",
        url: "/api/materials/m",
        visibility: "enrolled",
      },
    ] as any)
    .mockResolvedValue([
      {
        id: "m",
        title: "Guide",
        type: "link",
        url: "/api/materials/m",
        visibility: "after_completion",
      },
    ] as any);
  jest
    .mocked(adminCourseService.updateMaterial)
    .mockResolvedValueOnce(undefined);
  render(<CourseMaterialsTab courseId="c" />);
  fireEvent.click(await screen.findByRole("button", { name: "Alunos" }));
  expect(
    await screen.findByRole("button", { name: "Pós-Curso" }),
  ).toBeInTheDocument();
  expect(adminCourseService.updateMaterial).toHaveBeenCalledWith("c", "m", {
    visibility: "after_completion",
  });
});

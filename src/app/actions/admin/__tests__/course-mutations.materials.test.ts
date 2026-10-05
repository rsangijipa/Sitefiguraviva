jest.mock("@/lib/auth/server", () => ({
  requireAdmin: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/server-feature-flags", () => ({
  SERVER_FEATURES: {
    supabaseAdminCourses: true,
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const addAdminMaterial = jest.fn();
const bumpAdminCourseRevision = jest.fn();
const deleteAdminMaterial = jest.fn();
const listAdminMaterials = jest.fn();
const createAdminCourse = jest.fn();
const createAdminLesson = jest.fn();
const createAdminModule = jest.fn();
const deleteAdminCourse = jest.fn();
const deleteAdminLesson = jest.fn();
const deleteAdminThread = jest.fn();
const deleteAdminModule = jest.fn();
const getAdminCourse = jest.fn();
const listAdminCourseEnrollments = jest.fn();
const listAdminCourseThreads = jest.fn();
const listAdminCourses = jest.fn();
const listAdminLessons = jest.fn();
const listAdminModules = jest.fn();
const syncAdminLessonsCount = jest.fn();
const toggleAdminEnrollmentStatus = jest.fn();
const updateAdminCourse = jest.fn();
const updateAdminLesson = jest.fn();
const updateAdminMaterial = jest.fn();
const updateAdminModule = jest.fn();
const updateAdminThread = jest.fn();
const listCourseEnrollments = jest.fn();
const listCourseThreads = jest.fn();
const listCourses = jest.fn();
const listLessons = jest.fn();
const listMaterials = jest.fn();
const listModules = jest.fn();
const getCourse = jest.fn();

jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({
    addAdminMaterial: (...args: unknown[]) => addAdminMaterial(...args),
    bumpAdminCourseRevision: (...args: unknown[]) =>
      bumpAdminCourseRevision(...args),
    createAdminCourse: (...args: unknown[]) => createAdminCourse(...args),
    createAdminLesson: (...args: unknown[]) => createAdminLesson(...args),
    createAdminModule: (...args: unknown[]) => createAdminModule(...args),
    deleteAdminCourse: (...args: unknown[]) => deleteAdminCourse(...args),
    deleteAdminLesson: (...args: unknown[]) => deleteAdminLesson(...args),
    deleteAdminMaterial: (...args: unknown[]) => deleteAdminMaterial(...args),
    deleteAdminModule: (...args: unknown[]) => deleteAdminModule(...args),
    deleteAdminThread: (...args: unknown[]) => deleteAdminThread(...args),
    getAdminCourse: (...args: unknown[]) => getAdminCourse(...args),
    listAdminCourseEnrollments: (...args: unknown[]) =>
      listAdminCourseEnrollments(...args),
    listAdminCourseThreads: (...args: unknown[]) =>
      listAdminCourseThreads(...args),
    listAdminCourses: (...args: unknown[]) => listAdminCourses(...args),
    listAdminLessons: (...args: unknown[]) => listAdminLessons(...args),
    listAdminMaterials: (...args: unknown[]) => listAdminMaterials(...args),
    listAdminModules: (...args: unknown[]) => listAdminModules(...args),
    syncAdminLessonsCount: (...args: unknown[]) =>
      syncAdminLessonsCount(...args),
    toggleAdminEnrollmentStatus: (...args: unknown[]) =>
      toggleAdminEnrollmentStatus(...args),
    updateAdminCourse: (...args: unknown[]) => updateAdminCourse(...args),
    updateAdminLesson: (...args: unknown[]) => updateAdminLesson(...args),
    updateAdminMaterial: (...args: unknown[]) => updateAdminMaterial(...args),
    updateAdminModule: (...args: unknown[]) => updateAdminModule(...args),
    updateAdminThread: (...args: unknown[]) => updateAdminThread(...args),
    listCourseEnrollments: (...args: unknown[]) =>
      listCourseEnrollments(...args),
    listCourseThreads: (...args: unknown[]) => listCourseThreads(...args),
    listCourses: (...args: unknown[]) => listCourses(...args),
    listLessons: (...args: unknown[]) => listLessons(...args),
    listMaterials: (...args: unknown[]) => listMaterials(...args),
    listModules: (...args: unknown[]) => listModules(...args),
    getCourse: (...args: unknown[]) => getCourse(...args),
  }),
);

import {
  addMaterialAction,
  createCourseAction,
  createCourseResultAction,
  deleteMaterialAction,
  updateCourseAction,
} from "@/app/actions/admin/course-mutations";
import { requireAdmin } from "@/lib/auth/server";
import { z } from "zod";

describe("course-mutations material actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preserves the uploaded file path when adding a material", async () => {
    await addMaterialAction("course-1", {
      title: "Guide",
      type: "pdf",
      url: "https://example.com/file.pdf",
      description: "2 MB",
      filePath: "uploads/admin/uuid-guide.pdf",
      isPublished: true,
    });

    expect(addAdminMaterial).toHaveBeenCalledWith("course-1", {
      title: "Guide",
      type: "pdf",
      url: "https://example.com/file.pdf",
      description: "2 MB",
      filePath: "uploads/admin/uuid-guide.pdf",
      isPublished: true,
    });
  });

  it("ignores caller storage paths and qualifies deletion by course", async () => {
    await deleteMaterialAction(
      "course-1",
      "material-1",
      "uploads/admin/uuid-guide.pdf",
    );

    expect(deleteAdminMaterial).toHaveBeenCalledWith("course-1", "material-1");
  });

  it("creates courses only through the canonical Supabase repository", async () => {
    createAdminCourse.mockResolvedValue("course-1");
    await expect(
      createCourseAction({ title: "Curso", image: "/cover.jpg" }),
    ).resolves.toBe("course-1");
    expect(createAdminCourse).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Curso",
        image: "/cover.jpg",
        coverImage: "/cover.jpg",
        status: "draft",
        isPublished: false,
      }),
    );
  });

  it("increments the canonical revision after a course edit", async () => {
    await updateCourseAction("course-1", { title: "Novo título" });
    expect(updateAdminCourse).toHaveBeenCalledWith("course-1", {
      title: "Novo título",
    });
    expect(bumpAdminCourseRevision).toHaveBeenCalledWith("course-1");
  });

  it("returns the new course ID with a draft payload", async () => {
    createAdminCourse.mockResolvedValueOnce("new-course");
    await expect(
      createCourseResultAction({ title: "Novo curso" }),
    ).resolves.toEqual({
      success: true,
      courseId: "new-course",
    });
    expect(createAdminCourse).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "draft",
        isPublished: false,
      }),
    );
  });

  it("rejects a blank title before reaching the database", async () => {
    await expect(createCourseResultAction({ title: " " })).resolves.toEqual({
      success: false,
      message: "Informe o título do curso.",
    });
    expect(createAdminCourse).not.toHaveBeenCalled();
  });

  it("returns an actionable slug conflict without database details", async () => {
    createAdminCourse.mockRejectedValueOnce({
      code: "23505",
      details: "private database details",
    });
    const result = await createCourseResultAction({ title: "Curso" });
    expect(result).toEqual({
      success: false,
      message: expect.stringContaining("slug"),
    });
    expect(JSON.stringify(result)).not.toContain("private database details");
  });

  it("returns mediator validation instead of a production exception", async () => {
    const validation = z
      .string()
      .uuid("Selecione mediadores cadastrados.")
      .safeParse("legacy-id");
    if (validation.success) throw new Error("Expected invalid mediator ID");
    createAdminCourse.mockRejectedValueOnce(validation.error);
    await expect(createCourseResultAction({ title: "Curso" })).resolves.toEqual(
      {
        success: false,
        message: "Selecione mediadores cadastrados.",
      },
    );
  });

  it("hides unexpected database errors from the client and logs them on the server", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("private database details");
    try {
      createAdminCourse.mockRejectedValueOnce(error);
      const result = await createCourseResultAction({ title: "Curso" });
      expect(result.success).toBe(false);
      expect(JSON.stringify(result)).not.toContain(error.message);
      expect(spy).toHaveBeenCalledWith(
        "[createCourse] Failed to save course",
        error,
      );
    } finally {
      spy.mockRestore();
    }
  });

  it("preserves authentication redirects and never inserts unauthorized data", async () => {
    const redirect = new Error("NEXT_REDIRECT");
    jest.mocked(requireAdmin).mockRejectedValueOnce(redirect);
    await expect(createCourseResultAction({ title: "Curso" })).rejects.toBe(
      redirect,
    );
    expect(createAdminCourse).not.toHaveBeenCalled();
  });
});

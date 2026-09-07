jest.mock("@/lib/firebase/admin", () => ({
  adminDb: {},
}));

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
  deleteMaterialAction,
} from "@/app/actions/admin/course-mutations";

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

  it("passes the storage path through when deleting a material", async () => {
    await deleteMaterialAction(
      "course-1",
      "material-1",
      "uploads/admin/uuid-guide.pdf",
    );

    expect(deleteAdminMaterial).toHaveBeenCalledWith(
      "material-1",
      "uploads/admin/uuid-guide.pdf",
    );
  });
});

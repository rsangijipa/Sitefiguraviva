import {
  CommunityThreadDoc,
  CourseDoc,
  EnrollmentDoc,
  LessonDoc,
  MaterialDoc,
  ModuleDoc,
} from "@/types/lms";
import {
  addMaterialAction,
  createCourseAction,
  createLessonAction,
  createModuleAction,
  deleteCourseAction,
  deleteLessonAction,
  deleteMaterialAction,
  deleteModuleAction,
  deleteThreadAction,
  getAllCoursesAction,
  getCourseAction,
  getCourseEnrollmentsAction,
  getCourseThreadsAction,
  getLessonsAction,
  getMaterialsAction,
  getModulesAction,
  syncLessonsCountAction,
  toggleEnrollmentStatusAction,
  updateCourseAction,
  updateLessonAction,
  updateMaterialAction,
  updateModuleAction,
  updateThreadAction,
} from "@/app/actions/admin/course-mutations";

export const adminCourseService = {
  // --- COURSES ---

  async getAllCourses(): Promise<CourseDoc[]> {
    return getAllCoursesAction();
  },

  async getCourse(courseId: string): Promise<CourseDoc | null> {
    return getCourseAction(courseId);
  },

  async createCourse(data: Partial<CourseDoc>): Promise<string> {
    return createCourseAction(data);
  },

  async updateCourse(
    courseId: string,
    data: Partial<CourseDoc>,
  ): Promise<void> {
    return updateCourseAction(courseId, data);
  },

  async deleteCourse(courseId: string): Promise<void> {
    return deleteCourseAction(courseId);
  },

  // --- MODULES ---

  async getModules(courseId: string): Promise<ModuleDoc[]> {
    return getModulesAction(courseId);
  },

  async createModule(
    courseId: string,
    title: string,
    order: number,
  ): Promise<string> {
    return createModuleAction(courseId, title, order);
  },

  async updateModule(
    courseId: string,
    moduleId: string,
    data: Partial<ModuleDoc>,
  ): Promise<void> {
    return updateModuleAction(courseId, moduleId, data);
  },

  async deleteModule(courseId: string, moduleId: string): Promise<void> {
    return deleteModuleAction(courseId, moduleId);
  },

  // --- LESSONS ---

  async getLessons(courseId: string, moduleId: string): Promise<LessonDoc[]> {
    return getLessonsAction(courseId, moduleId);
  },

  async createLesson(
    courseId: string,
    moduleId: string,
    title: string,
    order: number,
  ): Promise<string> {
    return createLessonAction(courseId, moduleId, title, order);
  },

  async updateLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: Partial<LessonDoc>,
  ): Promise<void> {
    return updateLessonAction(courseId, moduleId, lessonId, data);
  },

  async deleteLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
  ): Promise<void> {
    return deleteLessonAction(courseId, moduleId, lessonId);
  },

  // --- ENROLLMENTS ---

  async getCourseEnrollments(
    courseId: string,
  ): Promise<Array<EnrollmentDoc & { id: string }>> {
    return getCourseEnrollmentsAction(courseId);
  },

  async toggleEnrollmentStatus(
    enrollmentId: string,
    currentStatus: string,
  ): Promise<void> {
    return toggleEnrollmentStatusAction(enrollmentId, currentStatus);
  },

  // --- COMMUNITY ---

  async getCourseThreads(courseId: string): Promise<CommunityThreadDoc[]> {
    return getCourseThreadsAction(courseId);
  },

  async updateThread(
    courseId: string,
    threadId: string,
    updates: Record<string, unknown>,
  ): Promise<void> {
    return updateThreadAction(courseId, threadId, updates);
  },

  async deleteThread(courseId: string, threadId: string): Promise<void> {
    return deleteThreadAction(courseId, threadId);
  },

  // --- MATERIALS ---

  async getMaterials(courseId: string): Promise<MaterialDoc[]> {
    return getMaterialsAction(courseId);
  },

  async addMaterial(
    courseId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return addMaterialAction(courseId, data);
  },

  async updateMaterial(
    courseId: string,
    materialId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return updateMaterialAction(courseId, materialId, data);
  },

  async deleteMaterial(
    courseId: string,
    materialId: string,
    filePath?: string,
  ): Promise<void> {
    return deleteMaterialAction(courseId, materialId);
  },

  // --- UTILS ---

  async syncLessonsCount(courseId: string): Promise<number> {
    return syncLessonsCountAction(courseId);
  },
};

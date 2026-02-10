// DTOs: Data Transfer Objects
// Clean, serializable interfaces that the Frontend can consume without fear.

export interface CourseDTO {
  id: string;
  title: string;
  subtitle?: string;
  description?: string; // HTML allowed?
  category: string;
  image?: string;
  coverImage?: string;

  // Status
  isPublished: boolean;
  status: "draft" | "published" | "archived";

  // Meta
  updatedAt: string; // ISO
  publishedAt?: string; // ISO

  // Calculated (not in DB directly)
  totalLessons?: number;
  duration?: string;
}

export interface EnrollmentDTO {
  id: string;
  status: "active" | "completed" | "expired" | "cancelled";
  enrolledAt: string;

  // Progress Snapshot
  progressSummary: {
    completedLessonsCount: number;
    totalLessons: number;
    percent: number;
    lastAccessedLessonId?: string;
    lastAccessedAt?: string;
  };
}

export interface LessonDTO {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  duration?: number; // minutes
  thumbnail?: string;

  // User Context
  isCompleted: boolean;
  isLocked: boolean;
  progressPercent: number; // 0-100 (for video watch time)

  // Meta
  updatedAt: string;
}

export interface ModuleDTO {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonDTO[];
}

export interface CourseFullDTO {
  course: CourseDTO;
  enrollment?: EnrollmentDTO;
  modules: ModuleDTO[];
  isAccessDenied: boolean;
}

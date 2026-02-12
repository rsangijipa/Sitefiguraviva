import {
  CourseDTO,
  EnrollmentDTO,
  LessonDTO,
  ModuleDTO,
  CourseFullDTO,
} from "./types";
import { deepSafeSerialize } from "@/lib/utils";
import { canConsumeCourse } from "@/lib/auth/access-policy";

// Mapper Helper: Firestore Timestamp to ISO String
function toISO(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val; // Already ISO?
  if (typeof val.toDate === "function") return val.toDate().toISOString();
  if (val._seconds !== undefined)
    return new Date(val._seconds * 1000).toISOString();
  if (val.seconds !== undefined)
    return new Date(val.seconds * 1000).toISOString();
  return new Date().toISOString(); // Fallback
}

export function toCourseDTO(doc: any): CourseDTO {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;

  return {
    id,
    title: data.title || "Sem título",
    subtitle: data.subtitle,
    description: data.description,
    category: data.category || "Geral",
    image: data.image || data.coverImage, // Normalize 'image' vs 'coverImage'
    coverImage: data.coverImage || data.image,

    isPublished: data.isPublished !== false,
    status: data.status || (data.isPublished !== false ? "published" : "draft"),

    updatedAt: toISO(data.updatedAt),
    publishedAt: toISO(data.publishedAt || data.createdAt),

    // Default safe values
    totalLessons: 0,
    duration: data.duration,
  };
}

export function toEnrollmentDTO(doc: any): EnrollmentDTO {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;

  return {
    id,
    status: data.status || "expired", // Safe default
    enrolledAt: toISO(data.enrolledAt || data.createdAt),
    progressSummary: {
      completedLessonsCount: data.progressSummary?.completedLessonsCount || 0,
      totalLessons: data.progressSummary?.totalLessons || 0,
      percent: data.progressSummary?.percent || 0,
      lastAccessedLessonId: data.lastAccessedLessonId,
      lastAccessedAt: data.lastAccessedAt
        ? toISO(data.lastAccessedAt)
        : undefined,
    },
  };
}

export function toLessonDTO(doc: any, progress?: any): LessonDTO {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;

  return {
    id,
    moduleId: data.moduleId,
    title: data.title || "Aula sem título",
    description: data.description,
    order: typeof data.order === "number" ? data.order : 999,
    duration:
      typeof data.duration === "string"
        ? parseInt(data.duration)
        : data.duration || 0,
    thumbnail: data.thumbnail,

    isCompleted: progress?.status === "completed",
    isLocked: !!data.isLocked, // Future feature
    progressPercent: progress?.percent || 0,

    updatedAt: toISO(data.updatedAt),
  };
}

export function toModuleDTO(doc: any, lessons: LessonDTO[] = []): ModuleDTO {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;

  return {
    id,
    title: data.title || "Módulo",
    description: data.description,
    order: typeof data.order === "number" ? data.order : 999,
    lessons,
  };
}

// Aggregation Mapper for the main page
export function toCourseFullDTO(
  courseRaw: any,
  modulesRaw: any[],
  lessonsMap: Map<string, any[]>,
  progressMap: Map<string, any>,
  enrollmentRaw?: any,
  isAdmin: boolean = false,
): CourseFullDTO {
  const course = toCourseDTO(courseRaw);

  // Map Modules -> Lessons (with progress injected)
  const modules = modulesRaw
    .map((mDoc) => {
      const mId = mDoc.id;
      const rawLessons = lessonsMap.get(mId) || [];

      const lessonsDTO = rawLessons
        .map((lDoc) => {
          const lId = lDoc.id;
          const progress = progressMap.get(lId);
          return toLessonDTO(lDoc, progress);
        })
        .sort((a, b) => a.order - b.order); // Ensure order

      return toModuleDTO(mDoc, lessonsDTO);
    })
    .sort((a, b) => a.order - b.order);

  // Calculate live totals
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => l.isCompleted).length;
  const percent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Update Course Aggregate Stats
  course.totalLessons = totalLessons;

  // Enhance Enrollment with live stats
  let enrollment: EnrollmentDTO | undefined;
  if (enrollmentRaw) {
    enrollment = toEnrollmentDTO(enrollmentRaw);
    enrollment.progressSummary = {
      ...enrollment.progressSummary,
      completedLessonsCount: completedCount,
      totalLessons: totalLessons,
      percent: percent,
    };
  }

  // Safe serialization one last time just in case (e.g. undefineds)
  // But strictly, our DTOs should already be safe.
  // Using deepSafeSerialize here is a redundant safety net.
  const isAccessDenied = !canConsumeCourse(
    courseRaw.data ? courseRaw.data() : courseRaw,
    enrollmentRaw
      ? enrollmentRaw.data
        ? enrollmentRaw.data()
        : enrollmentRaw
      : null,
    isAdmin,
  );

  return deepSafeSerialize({
    course,
    modules,
    enrollment,
    isAccessDenied,
  });
}

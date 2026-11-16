import { getCourseLastDate, todayInBrazil } from "./course-timeline";

/**
 * Pending items the admin must fix before a course is offered: the institute
 * has no free courses, so an offered course needs a price, and an open course
 * whose dates already passed needs a new date or to be closed.
 */

export type CourseOfferIssue =
  | { kind: "missing_price"; message: string }
  | { kind: "marked_free"; message: string }
  | { kind: "past_date"; message: string; lastDate: string };

type AlertCourse = {
  id: string;
  title: string;
  status?: string;
  isPublished?: boolean;
  totalPriceCents?: number | null;
  pixPriceCents?: number | null;
  billing?: { type?: string | null } | null;
  billingType?: string | null;
  date?: unknown;
  details?: unknown;
};

const isOffered = (course: AlertCourse) =>
  course.status === "open" ||
  (course.isPublished === true &&
    course.status !== "closed" &&
    course.status !== "archived" &&
    course.status !== "draft");

export function getCourseOfferIssues(
  course: AlertCourse,
  today: string = todayInBrazil(),
): CourseOfferIssue[] {
  if (!isOffered(course)) return [];
  const issues: CourseOfferIssue[] = [];
  const billingType = course.billing?.type ?? course.billingType;

  if (billingType === "free")
    issues.push({
      kind: "marked_free",
      message: "Cobrança marcada como gratuita. O instituto não oferece cursos gratuitos.",
    });
  if (!course.totalPriceCents || course.totalPriceCents <= 0)
    issues.push({
      kind: "missing_price",
      message: course.pixPriceCents
        ? "Falta o valor integral do curso."
        : "Sem valor definido (integral e Pix da inscrição).",
    });

  const lastDate = getCourseLastDate(course);
  if (lastDate && lastDate < today)
    issues.push({
      kind: "past_date",
      lastDate,
      message: "As datas já passaram e o curso continua com inscrições abertas.",
    });

  return issues;
}

export function listCourseOfferAlerts<T extends AlertCourse>(
  courses: T[],
  today: string = todayInBrazil(),
): Array<{ course: T; issues: CourseOfferIssue[] }> {
  return courses
    .map((course) => ({ course, issues: getCourseOfferIssues(course, today) }))
    .filter((entry) => entry.issues.length > 0);
}

import "server-only";

import { requireStaff } from "@/lib/auth/server";
import { getAdminCourse } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { ForbiddenError, NotFoundError } from "./access-types";

/**
 * Strict Guard for Content Authoring Actions.
 * Allows only 'admin' or 'tutor' roles.
 */
export async function assertIsTutorOrAdmin() {
  return await requireStaff();
}

/** A global tutor role does not grant authorship of every course. */
export async function assertCanAuthorCourse(courseId: string) {
  const actor = await requireStaff();
  if (!actor.isActive) throw new ForbiddenError();
  if (typeof courseId !== "string" || !courseId.trim() || courseId.length > 200)
    throw new ForbiddenError();
  const course = await getAdminCourse(courseId);
  if (!course) throw new NotFoundError("Course");
  const assignedRole = course.team?.[actor.uid]?.role;
  if (
    !actor.isAdmin &&
    !["author", "tutor", "admin"].includes(assignedRole || "")
  )
    throw new ForbiddenError();
  return actor;
}

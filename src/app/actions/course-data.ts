"use server";

import { verifySession } from "@/lib/auth/server";
import { getReadableCourseMaterialsAction } from "./course-materials";
import { getCourseData } from "@/lib/courseService";

export async function getEnrolledCourseDataAction(courseId: string) {
  if (!courseId) return null;

  const session = await verifySession();
  if (!session) return null;

  const course = await getCourseData(courseId, session.uid, session.isAdmin);
  if (!course) return null;
  return {
    ...course,
    materials: await getReadableCourseMaterialsAction(courseId),
  };
}

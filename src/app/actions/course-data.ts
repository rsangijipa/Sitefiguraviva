"use server";

import { verifySession } from "@/lib/auth/server";
import { getCourseData } from "@/lib/courseService";

export async function getEnrolledCourseDataAction(courseId: string) {
  if (!courseId) return null;

  const session = await verifySession();
  if (!session) return null;

  return getCourseData(courseId, session.uid, session.isAdmin);
}

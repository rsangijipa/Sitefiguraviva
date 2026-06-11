import { redirect } from "next/navigation";
import { getCourseData } from "@/lib/courseService";
import { deepSafeSerialize } from "@/lib/utils";
import CourseClient from "./CourseClient";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { AccessError } from "@/lib/auth/access-types";
import { requireSession } from "@/lib/auth/server";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireSession("/auth");
  const uid = session.uid;
  const isAdmin = session.isAdmin;

  // ORBITAL 01 & 05: Single Source of Truth Access Gate
  try {
    await assertCanAccessCourse(uid, courseId, { isAdmin });
  } catch (error) {
    if (error instanceof AccessError) {
      // If the course is not available/published, restrict access completely
      if (error.code === "COURSE_NOT_AVAILABLE") {
        redirect("/portal?error=course_unavailable");
      }
      // Other access errors (expired, pending) might still allow partial view or specific error page
      // For now, continue to fetch data which contains isAccessDenied flag
    } else {
      throw error;
    }
  }

  // Server-Side Data Fetch
  const data = await getCourseData(courseId, uid, isAdmin);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-serif text-primary">
          Curso não encontrado.
        </h1>
      </div>
    );
  }

  // Access Control handled in Client or via middleware, but strictly we could redirect here if we want no-render
  if (data.isAccessDenied) {
    // We pass data to Client to show "Paywall" UI properly
  }

  // Serialize
  const serializedData = deepSafeSerialize(data);

  return <CourseClient initialData={serializedData} />;
}

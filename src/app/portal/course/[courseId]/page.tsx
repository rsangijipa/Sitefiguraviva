import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, adminDb } from "@/lib/firebase/admin";
import { getCourseData } from "@/lib/courseService";
import { deepSafeSerialize } from "@/lib/utils";
import CourseClient from "./CourseClient";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { AccessError } from "@/lib/auth/access-types";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
  const uid = decodedClaims.uid;

  // Orbit 05: Robust Admin Detection (Claims + Firestore Backup)
  const userDoc = await adminDb.collection("users").doc(uid).get();
  const userRole = userDoc.data()?.role?.toLowerCase().trim();
  const isAdmin =
    decodedClaims.admin === true ||
    decodedClaims.role === "admin" ||
    userRole === "admin";

  // ORBITAL 01 & 05: Single Source of Truth Access Gate
  try {
    await assertCanAccessCourse(uid, courseId);
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

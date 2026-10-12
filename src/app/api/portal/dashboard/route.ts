import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";

export async function GET(request: Request) {
  try {
    const claims = await getBearerSupabaseSessionClaims(request);
    if (!claims || !claims.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id,course_id,status,payment_status,enrolled_at,access_until")
      .eq("user_id", claims.uid)
      .order("enrolled_at", { ascending: false });
    if (enrollmentError) throw enrollmentError;
    if (!enrollments?.length) {
      return NextResponse.json({ enrolledCourses: [] });
    }

    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("id,title,subtitle,description,image_url,slug")
      .in("id", enrollments.map((row) => row.course_id));
    if (courseError) throw courseError;

    const byId = new Map((courses ?? []).map((course) => [course.id, course]));
    // Iterate the already ordered enrollments, preserving ISO dates from Postgres.
    const enrolledCourses = enrollments.flatMap((row) => {
      const course = byId.get(row.course_id);
      if (!course) return [];
      return [{
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        image: course.image_url,
        slug: course.slug,
        enrollment: {
          id: row.id,
          courseId: row.course_id,
          status: row.status,
          paymentStatus: row.payment_status,
          enrolledAt: row.enrolled_at,
          accessExpiresAt: row.access_until,
        },
      }];
    });

    return NextResponse.json({ enrolledCourses });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

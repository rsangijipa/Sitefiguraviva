import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";

export async function GET(request: Request) {
  try {
    const claims = await getBearerSupabaseSessionClaims(request);
    if (!claims || !claims.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = claims.uid;

    // 1. Fetch User Enrollments (Server-side)
    const supabase = createSupabaseServiceClient();
    const { data: enrollmentRows, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", uid)
      .order("enrolled_at", { ascending: false });
    if (enrollmentError) throw enrollmentError;
    const enrollments = (enrollmentRows ?? []).map((row: any) => ({
      id: row.id,
      ...row,
      courseId: row.course_id,
      enrolledAt: row.enrolled_at || row.created_at,
      accessExpiresAt: row.access_until,
    }));

    if (enrollments.length === 0) {
      return NextResponse.json({ enrolledCourses: [] });
    }

    // 2. Fetch Course Details (Optimized)
    const courseIds = enrollments.map((e: any) => e.courseId);

    const { data: courseRows, error: courseError } = await supabase
      .from("courses")
      .select("id,title,subtitle,description,image_url,slug")
      .in("id", courseIds);
    if (courseError) throw courseError;
    const coursesData = (courseRows ?? []).map((data: any) => ({
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      image: data.image_url,
      slug: data.slug,
    }));

    // Merge
    const merged = coursesData.map((course) => {
      // @ts-ignore
      const enrollment = enrollments.find((e: any) => e.courseId === course.id);
      // Serialize timestamps for JSON
      const serializedEnrollment = {
        ...enrollment,
        // Postgres timestamps are already ISO strings. Keeping them intact is
        // important for clients that sort or display enrollment validity.
        enrolledAt: enrollment?.enrolledAt ?? null,
        accessExpiresAt: enrollment?.accessExpiresAt ?? null,
      };
      return { ...course, enrollment: serializedEnrollment };
    });

    // re-sort based on enrollment date (coursesData query doesn't preserve order of IDs)
    // We can sort by the enrollment order found in 'enrollments' array which was already sorted.
    const sorted = merged.sort((a, b) => {
      const dateA = new Date(a.enrollment.enrolledAt ?? 0).getTime();
      const dateB = new Date(b.enrollment.enrolledAt ?? 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ enrolledCourses: sorted });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

"use server";

import { listCourseEnrollments } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";
import { recalculateProgressSupabase } from "@/features/progress/infrastructure/supabaseProgressService.server";

/**
 * Admin Action to Backfill/Recalculate Progress for ALL enrollments.
 * Use with caution on large datasets. Run in batches if needed.
 */
export async function backfillProgress() {
  console.log("Starting Progress Backfill...");

  try {
    const courseIds = (
      await import("@/features/courses/infrastructure/supabaseAdminCourseRepository.server")
    ).listAdminCourses();
    const courses = await courseIds;
    const enrollments = (
      await Promise.all(
        courses.map((course: any) => listCourseEnrollments(course.id)),
      )
    )
      .flat()
      .filter((enrollment: any) =>
        ["active", "completed"].includes(String(enrollment.status)),
      );
    const total = enrollments.length;
    console.log(`Found ${total} enrollments to process.`);

    let processed = 0;
    let errors = 0;

    // Process in chunks to avoid timeout if possible, though Server Actions have timeout limits.
    // For Vercel Pro (Serverless), limit is usually 60s. For Edge, 30s.
    // We do it serially for safety in this script, or parallel with limit.

    const results = [];

    for (const data of enrollments) {
      const { userId, courseId } = data;

      if (!userId || !courseId) {
        console.warn(`skipping invalid enrollment ${data.id}`);
        continue;
      }

      try {
        await recalculateProgressSupabase(userId, courseId);
        processed++;
      } catch (err: any) {
        console.error(`Failed to recalc ${data.id}:`, err);
        errors++;
        results.push({ id: data.id, error: err.message });
      }
    }

    console.log(
      `Backfill Complete. Processed: ${processed}, Errors: ${errors}`,
    );
    return { success: true, processed, errors, details: results };
  } catch (error: any) {
    console.error("Backfill Fatal Error:", error);
    return { success: false, error: error.message };
  }
}

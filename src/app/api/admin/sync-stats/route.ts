import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    if (decodedClaims.role !== "admin")
      return NextResponse.json({ error: "Admins only" }, { status: 403 });

    const coursesSnap = await adminDb.collection("courses").get();
    const batch = adminDb.batch();
    let batchCount = 0;
    let syncedCourses = 0;

    for (const courseDoc of coursesSnap.docs) {
      const courseId = courseDoc.id;
      const modulesSnap = await courseDoc.ref
        .collection("modules")
        .where("isPublished", "==", true)
        .get();
      let totalPublishedLessons = 0;

      for (const modDoc of modulesSnap.docs) {
        const lessonsSnap = await modDoc.ref
          .collection("lessons")
          .where("isPublished", "==", true)
          .get();
        totalPublishedLessons += lessonsSnap.size;
      }

      // Update course stats
      batch.update(courseDoc.ref, {
        "stats.lessonsCount": totalPublishedLessons,
        updatedAt: FieldValue.serverTimestamp(),
      });
      batchCount++;

      // Sync all enrollments for this course
      const enrollmentsSnap = await adminDb
        .collection("enrollments")
        .where("courseId", "==", courseId)
        .get();
      for (const enrollmentDoc of enrollmentsSnap.docs) {
        const enrollmentRef = enrollmentDoc.ref;
        const uid = enrollmentDoc.data().uid || enrollmentDoc.data().userId;

        batch.update(enrollmentRef, {
          "progressSummary.totalLessons": totalPublishedLessons,
          updatedAt: FieldValue.serverTimestamp(),
        });
        batchCount++;

        // Also update the mirror
        if (uid) {
          try {
            const mirrorRef = adminDb
              .collection("users")
              .doc(uid)
              .collection("enrollments")
              .doc(courseId);
            batch.update(mirrorRef, {
              "progressSummary.totalLessons": totalPublishedLessons,
              updatedAt: FieldValue.serverTimestamp(),
            });
            batchCount++;
          } catch (e) {
            // ignore if mirror doesn't exist to update
          }
        }

        if (batchCount > 400) {
          await batch.commit();
          batchCount = 0;
        }
      }
      syncedCourses++;
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Synced lessons count for ${syncedCourses} courses and their enrollments.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifySession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // The `session` cookie carries a Supabase JWT, not a Firebase session
    // cookie, so admin checks go through verifySession() (Supabase-based)
    // rather than adminAuth.verifySessionCookie, which always threw here.
    const claims = await verifySession();
    if (!claims) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 },
      );
    }
    if (!claims.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admins only" },
        { status: 403 },
      );
    }

    const coursesSnap = await adminDb.collection("courses").get();
    let migratedCount = 0;
    const batch = adminDb.batch();
    let batchCount = 0;

    for (const courseDoc of coursesSnap.docs) {
      const courseId = courseDoc.id;
      const modulesSnap = await courseDoc.ref.collection("modules").get();

      for (const modDoc of modulesSnap.docs) {
        const lessonsSnap = await modDoc.ref.collection("lessons").get();

        for (const lessonDoc of lessonsSnap.docs) {
          const lessonData = lessonDoc.data();

          // IF it has legacy string content but no blocks explicitly created yet
          if (lessonData.content && typeof lessonData.content === "string") {
            // Check if it already has blocks to avoid duplicating
            const blocksSnap = await lessonDoc.ref.collection("blocks").get();

            if (blocksSnap.empty) {
              const newBlockRef = lessonDoc.ref.collection("blocks").doc();
              batch.set(newBlockRef, {
                type: "text",
                order: 1,
                isPublished: true,
                content: {
                  text: lessonData.content,
                },
                createdAt: FieldValue.serverTimestamp(),
              });

              // Backup legacy and remove main string
              batch.update(lessonDoc.ref, {
                legacyContent: lessonData.content,
                content: FieldValue.delete(),
                updatedAt: FieldValue.serverTimestamp(),
              });

              migratedCount++;
              batchCount += 2; // Two operations per lesson

              // Commit if batch is getting large (limit is 500)
              if (batchCount > 400) {
                await batch.commit();
                batchCount = 0;
              }
            }
          }
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${migratedCount} legacy lessons to blocks.`,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

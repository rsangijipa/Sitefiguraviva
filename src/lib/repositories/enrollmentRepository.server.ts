import { adminDb } from "@/lib/firebase/admin";
import { EnrollmentDoc } from "@/types/lms";

export type EnrollmentLookupResult = {
  id: string;
  data: EnrollmentDoc;
  snapshot: FirebaseFirestore.DocumentSnapshot;
};

export async function findEnrollmentForCourse(
  uid: string,
  courseId: string,
): Promise<EnrollmentLookupResult | null> {
  if (!uid || !courseId) return null;

  const deterministicId = `${uid}_${courseId}`;
  const alternateId = `${courseId}_${uid}`;

  for (const enrollmentId of [deterministicId, alternateId]) {
    const snapshot = await adminDb
      .collection("enrollments")
      .doc(enrollmentId)
      .get();

    if (snapshot.exists) {
      return {
        id: snapshot.id,
        data: snapshot.data() as EnrollmentDoc,
        snapshot,
      };
    }
  }

  const uidQuery = await adminDb
    .collection("enrollments")
    .where("uid", "==", uid)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();

  if (!uidQuery.empty) {
    const snapshot = uidQuery.docs[0];
    return {
      id: snapshot.id,
      data: snapshot.data() as EnrollmentDoc,
      snapshot,
    };
  }

  const legacyUserIdQuery = await adminDb
    .collection("enrollments")
    .where("userId", "==", uid)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();

  if (!legacyUserIdQuery.empty) {
    const snapshot = legacyUserIdQuery.docs[0];
    return {
      id: snapshot.id,
      data: snapshot.data() as EnrollmentDoc,
      snapshot,
    };
  }

  return null;
}

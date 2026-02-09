import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { CertificateDoc, EnrollmentDoc } from "@/types/lms";

export const certificateService = {
  async getCertificate(
    userId: string,
    courseId: string,
  ): Promise<CertificateDoc | null> {
    const q = query(
      collection(db, "certificates"),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as CertificateDoc;
  },

  async getUserCertificates(userId: string): Promise<CertificateDoc[]> {
    const q = query(
      collection(db, "certificates"),
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as CertificateDoc,
    );
  },
};

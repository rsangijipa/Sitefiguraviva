import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { AnnouncementDoc } from "@/types/lms";

export const announcementService = {
  async getCourseAnnouncements(courseId: string): Promise<AnnouncementDoc[]> {
    const q = query(
      collection(db, "courses", courseId, "announcements"),
      orderBy("publishAt", "desc"),
      orderBy("isPinned", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AnnouncementDoc,
    );
  },

  async getPublishedAnnouncements(
    courseId: string,
    tenantId?: string,
  ): Promise<AnnouncementDoc[]> {
    const now = Timestamp.now();
    let q = query(
      collection(db, "courses", courseId, "announcements"),
      where("publishAt", "<=", now),
      orderBy("publishAt", "desc"),
    );

    if (tenantId) {
      q = query(q, where("tenantId", "==", tenantId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AnnouncementDoc,
    );
  },

  /**
   * Real-time subscription for published announcements
   */
  subscribeToPublishedAnnouncements(
    courseId: string,
    callback: (announcements: AnnouncementDoc[]) => void,
    tenantId?: string,
  ) {
    const now = Timestamp.now();
    let q = query(
      collection(db, "courses", courseId, "announcements"),
      where("publishAt", "<=", now),
      orderBy("publishAt", "desc"),
    );

    if (tenantId) {
      q = query(q, where("tenantId", "==", tenantId));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const announcements = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as AnnouncementDoc,
        );
        callback(announcements);
      },
      (error) => {
        console.error("Announcements sub error:", error);
      },
    );
  },

  async createAnnouncement(
    courseId: string,
    data: Omit<AnnouncementDoc, "id" | "createdAt">,
  ): Promise<string> {
    const docData = {
      ...data,
      courseId,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(
      collection(db, "courses", courseId, "announcements"),
      docData,
    );
    return docRef.id;
  },

  async updateAnnouncement(
    courseId: string,
    announcementId: string,
    data: Partial<AnnouncementDoc>,
  ): Promise<void> {
    const docRef = doc(
      db,
      "courses",
      courseId,
      "announcements",
      announcementId,
    );
    await updateDoc(docRef, data);
  },

  async deleteAnnouncement(
    courseId: string,
    announcementId: string,
  ): Promise<void> {
    const docRef = doc(
      db,
      "courses",
      courseId,
      "announcements",
      announcementId,
    );
    await deleteDoc(docRef);
  },
};

import { db } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";

export interface Course {
  id: string;
  tenantId: string; // v3 Multi-tenancy
  title: string;
  description: string;
  image?: string;
  totalLessons?: number;
  modulesCount?: number;
  isPublished: boolean;
}

export const courseService = {
  // Get single course details
  async getCourse(courseId: string): Promise<Course | null> {
    if (!courseId) return null;
    const snap = await getDoc(doc(db, "courses", courseId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : null;
  },

  /**
   * Get list of courses by IDs (for "My Courses" view)
   * In Multi-tenant v0, we ensure they belong to the correct tenant context if needed.
   */
  async getCoursesByIds(ids: string[], tenantId?: string): Promise<Course[]> {
    if (!ids || ids.length === 0) return [];

    const chunks = [];
    const chunkSize = 10;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      let q = query(
        collection(db, "courses"),
        where(documentId(), "in", chunk),
      );

      // v3: Isolation layer
      if (tenantId) {
        q = query(q, where("tenantId", "==", tenantId));
      }

      chunks.push(getDocs(q));
    }

    const snapshots = await Promise.all(chunks);
    const results = snapshots.flatMap((snap) =>
      snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course),
    );

    // Log telemetry for course access (SSoT)
    // trackEvent('courses_fetched', { count: results.length });

    return results;
  },

  // Get materials for a course
  async getCourseMaterials(courseId: string): Promise<any[]> {
    if (!courseId) return [];
    try {
      const materialsRef = collection(db, "courses", courseId, "materials");
      const snap = await getDocs(materialsRef);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching materials for course ${courseId}:`, error);
      return [];
    }
  },
};

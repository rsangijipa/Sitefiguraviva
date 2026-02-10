import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface EventDoc {
  id: string;
  title: string;
  description?: string;
  startsAt: Timestamp;
  endsAt?: Timestamp;
  status: "scheduled" | "live" | "ended" | "cancelled";
  isPublic: boolean;
  courseId?: string; // Optional linkage
  type: "webinar" | "in_person" | "hybrid";
  joinUrl?: string;
  location?: string;
  coverImage?: string;
}

export const eventService = {
  async getUpcomingEvents(limitCount = 3): Promise<EventDoc[]> {
    const now = new Date();
    // Added isPublic == true to satisfy Firestore Rules for unauthenticated/general access
    const q = query(
      collection(db, "events"),
      where("status", "in", ["scheduled", "live"]),
      where("isPublic", "==", true),
    );

    try {
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Timestamps to Date objects for serialization
          startsAt: data.startsAt?.toDate
            ? data.startsAt.toDate()
            : data.startsAt,
          endsAt: data.endsAt?.toDate ? data.endsAt.toDate() : data.endsAt,
        } as unknown as EventDoc;
      });

      // Filter by date and sort in memory
      return events
        .filter((e) => {
          const start =
            e.startsAt instanceof Date
              ? e.startsAt
              : new Date(e.startsAt as any);
          return start >= now;
        })
        .sort((a, b) => {
          const dateA =
            a.startsAt instanceof Date
              ? a.startsAt.getTime()
              : new Date(a.startsAt as any).getTime();
          const dateB =
            b.startsAt instanceof Date
              ? b.startsAt.getTime()
              : new Date(b.startsAt as any).getTime();
          return dateA - dateB;
        })
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  async getCourseEvents(courseId: string): Promise<EventDoc[]> {
    const now = new Date();
    const q = query(
      collection(db, "events"),
      where("courseId", "==", courseId),
    );

    try {
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Timestamps to Date objects for serialization
          startsAt: data.startsAt?.toDate
            ? data.startsAt.toDate()
            : data.startsAt,
          endsAt: data.endsAt?.toDate ? data.endsAt.toDate() : data.endsAt,
        } as unknown as EventDoc;
      });

      return events
        .filter((e) => {
          const start =
            e.startsAt instanceof Date
              ? e.startsAt
              : new Date(e.startsAt as any);
          return start >= now;
        })
        .sort((a, b) => {
          const dateA =
            a.startsAt instanceof Date
              ? a.startsAt.getTime()
              : new Date(a.startsAt as any).getTime();
          const dateB =
            b.startsAt instanceof Date
              ? b.startsAt.getTime()
              : new Date(b.startsAt as any).getTime();
          return dateA - dateB;
        });
    } catch (error) {
      console.error("Error fetching course events:", error);
      return [];
    }
  },
};

import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { CommunityThreadDoc, CommunityReplyDoc } from "@/types/lms";
import { trackEvent } from "@/lib/telemetry/events";

export const communityService = {
  // --- Global Community (Root Level) ---
  async getGlobalThreads(limitCount = 10): Promise<CommunityThreadDoc[]> {
    try {
      const q = query(
        collection(db, "community_threads"),
        where("status", "==", "active"),
        orderBy("isPinned", "desc"),
        orderBy("lastReplyAt", "desc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CommunityThreadDoc,
      );
    } catch (error) {
      console.error("Error fetching global threads:", error);
      return [];
    }
  },

  /**
   * Real-time subscription for global threads with status filter and telemetry
   */
  subscribeToGlobalThreads(
    callback: (threads: CommunityThreadDoc[]) => void,
    limitCount = 15,
  ) {
    const q = query(
      collection(db, "community_threads"),
      where("status", "==", "active"),
      orderBy("isPinned", "desc"),
      orderBy("lastReplyAt", "desc"),
      limit(limitCount),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const threads = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as CommunityThreadDoc,
        );
        callback(threads);
      },
      (error) => {
        console.error("Global threads subscription error:", error);
        trackEvent("error_boundary_triggered", {
          component: "CommunityGlobal",
          error: error.message,
        });
      },
    );
  },

  // --- Course Specific ---
  async getCourseThreads(
    courseId: string,
    limitCount = 10,
  ): Promise<CommunityThreadDoc[]> {
    try {
      const q = query(
        collection(db, "courses", courseId, "communityThreads"),
        where("status", "==", "active"),
        orderBy("isPinned", "desc"),
        orderBy("lastReplyAt", "desc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CommunityThreadDoc,
      );
    } catch (error) {
      console.error("Error fetching threads:", error);
      return [];
    }
  },

  /**
   * Real-time subscription for course specific threads (v2 paginated style)
   */
  subscribeToCourseThreads(
    courseId: string,
    callback: (threads: CommunityThreadDoc[]) => void,
    limitCount = 20,
  ) {
    const q = query(
      collection(db, "courses", courseId, "communityThreads"),
      where("status", "==", "active"),
      orderBy("isPinned", "desc"),
      orderBy("lastReplyAt", "desc"),
      limit(limitCount),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const threads = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as CommunityThreadDoc,
        );
        callback(threads);
      },
      (error) => {
        console.error(`Course threads sub error (${courseId}):`, error);
        trackEvent("error_boundary_triggered", {
          component: "CommunityCourse",
          error: error.message,
        });
      },
    );
  },

  async createThread(
    courseId: string,
    user: { uid: string; displayName: string; photoURL?: string },
    title: string,
    content: string,
    tenantId: string = "viva", // v3 Multi-tenancy
  ): Promise<string> {
    const threadData: Omit<CommunityThreadDoc, "id"> & {
      status: string;
      tenantId: string;
    } = {
      courseId,
      authorId: user.uid,
      authorName: user.displayName || "Usuário",
      authorAvatar: user.photoURL,
      title,
      content,
      replyCount: 0,
      likeCount: 0,
      viewCount: 0,
      isPinned: false,
      isLocked: false,
      isDeleted: false,
      status: "active", // Default status v2
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastReplyAt: Timestamp.now(),
      tenantId, // Injection for rules
    };

    const docRef = await addDoc(
      collection(db, "courses", courseId, "communityThreads"),
      threadData,
    );

    // Telemetry v2
    trackEvent("community_post_created", { courseId, type: "thread" });

    return docRef.id;
  },

  async getThread(
    courseId: string,
    threadId: string,
  ): Promise<CommunityThreadDoc | null> {
    const snap = await getDocs(
      query(
        collection(db, "courses", courseId, "communityThreads"),
        where("__name__", "==", threadId),
      ),
    );
    if (snap.empty) return null;
    return {
      id: snap.docs[0].id,
      ...snap.docs[0].data(),
    } as CommunityThreadDoc;
  },

  async getReplies(
    courseId: string,
    threadId: string,
  ): Promise<CommunityReplyDoc[]> {
    const q = query(
      collection(
        db,
        "courses",
        courseId,
        "communityThreads",
        threadId,
        "replies",
      ),
      where("status", "==", "active"),
      orderBy("createdAt", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as CommunityReplyDoc,
    );
  },

  /**
   * Real-time subscription for thread replies with status filter
   */
  subscribeToReplies(
    courseId: string,
    threadId: string,
    callback: (replies: CommunityReplyDoc[]) => void,
    limitCount = 50,
  ) {
    const q = query(
      collection(
        db,
        "courses",
        courseId,
        "communityThreads",
        threadId,
        "replies",
      ),
      where("status", "==", "active"),
      orderBy("createdAt", "asc"),
      limit(limitCount),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const replies = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as CommunityReplyDoc,
        );
        callback(replies);
      },
      (error) => {
        console.error(`Replies sub error (${threadId}):`, error);
      },
    );
  },

  async createReply(
    courseId: string,
    threadId: string,
    user: { uid: string; displayName: string; photoURL?: string },
    content: string,
  ): Promise<string> {
    const replyData: Omit<CommunityReplyDoc, "id"> & { status: string } = {
      threadId,
      authorId: user.uid,
      authorName: user.displayName || "Usuário",
      authorAvatar: user.photoURL,
      content,
      likeCount: 0,
      isDeleted: false,
      status: "active", // Default status v2
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const replyRef = await addDoc(
      collection(
        db,
        "courses",
        courseId,
        "communityThreads",
        threadId,
        "replies",
      ),
      replyData,
    );

    const threadRef = doc(
      db,
      "courses",
      courseId,
      "communityThreads",
      threadId,
    );
    await updateDoc(threadRef, {
      replyCount: increment(1),
      lastReplyAt: Timestamp.now(),
    });

    // Telemetry v2
    trackEvent("community_post_created", { courseId, type: "reply" });

    return replyRef.id;
  },

  // --- v2 Moderation Methods ---
  async setThreadStatus(
    courseId: string,
    threadId: string,
    status: "active" | "hidden" | "locked",
  ): Promise<void> {
    const threadRef = doc(
      db,
      "courses",
      courseId,
      "communityThreads",
      threadId,
    );
    await updateDoc(threadRef, {
      status,
      isLocked: status === "locked",
      updatedAt: Timestamp.now(),
    });
  },

  async setReplyStatus(
    courseId: string,
    threadId: string,
    replyId: string,
    status: "active" | "hidden",
  ): Promise<void> {
    const replyRef = doc(
      db,
      "courses",
      courseId,
      "communityThreads",
      threadId,
      "replies",
      replyId,
    );
    await updateDoc(replyRef, { status, updatedAt: Timestamp.now() });
  },
};

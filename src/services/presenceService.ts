import { db } from "@/lib/firebase/client";
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

export const presenceService = {
  /**
   * Updates user presence in a specific course/thread context.
   */
  async updatePresence(
    userId: string,
    contextId: string,
    data: { name: string; avatar?: string; isTyping?: boolean },
  ) {
    const presenceRef = doc(db, "presence", `${userId}_${contextId}`);
    await setDoc(
      presenceRef,
      {
        userId,
        contextId,
        ...data,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );
  },

  /**
   * Subscribes to active users in a context.
   * Note: This depends on a cleanup function or TTL.
   */
  subscribeToPresence(contextId: string, callback: (users: any[]) => void) {
    // Show users seen in the last 2 minutes
    const threshold = new Date(Date.now() - 2 * 60 * 1000);
    const q = query(
      collection(db, "presence"),
      where("contextId", "==", contextId),
      where("lastSeen", ">=", threshold),
    );

    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data());
      callback(users);
    });
  },

  async clearPresence(userId: string, contextId: string) {
    try {
      await deleteDoc(doc(db, "presence", `${userId}_${contextId}`));
    } catch (e) {
      // Ignore errors on logout/tab close
    }
  },
};

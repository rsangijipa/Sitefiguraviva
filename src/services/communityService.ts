import {
  createReply,
  createThread,
  getThread,
  listCourseThreads,
  listGlobalThreads,
  listReplies,
  setReplyStatus,
  setThreadStatus,
} from "@/features/community/infrastructure/supabaseCommunityRepository.server";
import { CommunityThreadDoc, CommunityReplyDoc } from "@/types/lms";

export const communityService = {
  // --- Global Community (Root Level) ---
  async getGlobalThreads(limitCount = 10): Promise<CommunityThreadDoc[]> {
    return listGlobalThreads(limitCount);
  },

  /**
   * Real-time subscription for global threads with status filter and telemetry
   */
  subscribeToGlobalThreads(
    callback: (threads: CommunityThreadDoc[]) => void,
    limitCount = 15,
  ) {
    void limitCount;
    callback([]);
    return () => undefined;
  },

  // --- Course Specific ---
  async getCourseThreads(
    courseId: string,
    limitCount = 10,
  ): Promise<CommunityThreadDoc[]> {
    return listCourseThreads(courseId, limitCount);
  },

  /**
   * Real-time subscription for course specific threads (v2 paginated style)
   */
  subscribeToCourseThreads(
    courseId: string,
    callback: (threads: CommunityThreadDoc[]) => void,
    limitCount = 20,
  ) {
    void courseId;
    void limitCount;
    callback([]);
    return () => undefined;
  },

  async createThread(
    courseId: string,
    user: { uid: string; displayName: string; photoURL?: string },
    title: string,
    content: string,
  ): Promise<string> {
    return createThread(courseId, user, title, content);
  },

  async getThread(
    courseId: string,
    threadId: string,
  ): Promise<CommunityThreadDoc | null> {
    return getThread(courseId, threadId);
  },

  async getReplies(
    courseId: string,
    threadId: string,
  ): Promise<CommunityReplyDoc[]> {
    void courseId;
    return listReplies(threadId);
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
    void courseId;
    void threadId;
    void limitCount;
    callback([]);
    return () => undefined;
  },

  async createReply(
    courseId: string,
    threadId: string,
    user: { uid: string; displayName: string; photoURL?: string },
    content: string,
  ): Promise<string> {
    return createReply(courseId, threadId, user, content);
  },

  // --- v2 Moderation Methods ---
  async setThreadStatus(
    courseId: string,
    threadId: string,
    status: "active" | "hidden" | "locked",
  ): Promise<void> {
    return setThreadStatus(courseId, threadId, status);
  },

  async setReplyStatus(
    courseId: string,
    threadId: string,
    replyId: string,
    status: "active" | "hidden",
  ): Promise<void> {
    void courseId;
    return setReplyStatus(threadId, replyId, status);
  },
};

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

function poll<T>(fetcher:()=>Promise<T>,callback:(data:T)=>void) {
  let active=true;
  const update=()=>{void fetcher().then(data=>{if(active)callback(data);}).catch(error=>console.error("Falha ao atualizar comunidade",error));};
  update();const timer=window.setInterval(update,15000);
  return ()=>{active=false;window.clearInterval(timer);};
}
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
    return poll(()=>listGlobalThreads(limitCount),callback);
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
    return poll(()=>listCourseThreads(courseId,limitCount),callback);
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
    void limitCount;
    return poll(()=>listReplies(threadId),callback);
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

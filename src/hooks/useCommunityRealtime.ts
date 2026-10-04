import { useState, useEffect } from "react";
import { communityService } from "@/services/communityService";
import { CommunityThreadDoc, CommunityReplyDoc } from "@/types/lms";

export function useCommunityRealtime(courseId?: string) {
  const [threads, setThreads] = useState<CommunityThreadDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Subscribe to course specific threads if ID provided, otherwise global
    const unsubscribe = courseId
      ? communityService.subscribeToCourseThreads(courseId, (data) => {
          setThreads(data);
          setLoading(false);
        })
      : communityService.subscribeToGlobalThreads((data) => {
          setThreads(data);
          setLoading(false);
        });

    return () => unsubscribe();
  }, [courseId]);

  return { threads, loading };
}

export function useRepliesRealtime(courseId: string, threadId: string) {
  const [replies, setReplies] = useState<CommunityReplyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !threadId) return;

    setLoading(true);
    const unsubscribe = communityService.subscribeToReplies(
      courseId,
      threadId,
      (data) => {
        setReplies(data);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [courseId, threadId]);

  return { replies, loading };
}

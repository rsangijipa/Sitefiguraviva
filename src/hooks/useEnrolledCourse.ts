import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markLessonCompleted,
  updateLessonLastAccess,
} from "@/app/actions/progress";
import { getEnrolledCourseDataAction } from "@/app/actions/course-data";

export function useEnrolledCourse(
  courseId: string,
  userId: string | undefined,
  isAdmin: boolean = false,
  initialData?: any,
) {
  const queryClient = useQueryClient();

  // Primary Query: Fetch everything needed for the Course Player/Lobby
  const queryResult = useQuery({
    queryKey: ["enrolled-course", courseId, userId, isAdmin],
    initialData: initialData || undefined,
    queryFn: async () => {
      if (!courseId) return null;
      return getEnrolledCourseDataAction(courseId);
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutation: Update Progress (Last Access)
  const updateLastAccess = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!userId || !courseId || isAdmin) return;
      return updateLessonLastAccess(courseId, lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrolled-course", courseId, userId],
      });
    },
  });

  // Mutation: Mark Complete (FIX: Audit PRG-02)
  const markComplete = useMutation({
    mutationFn: async ({
      lessonId,
      moduleId,
    }: {
      lessonId: string;
      moduleId: string;
    }) => {
      if (!userId || !courseId || isAdmin) return { success: true };
      return await markLessonCompleted(courseId, moduleId, lessonId);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({
          queryKey: ["enrolled-course", courseId, userId],
        });
        // Also invalidate portal overview to show percentage update
        queryClient.invalidateQueries({
          queryKey: ["portal-enrollments", userId],
        });
      }
    },
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    isAccessDenied:
      queryResult.error &&
      (queryResult.error as any).code === "permission-denied",
    updateLastAccess: updateLastAccess.mutate,
    markComplete: (lessonId: string, moduleId: string) =>
      markComplete.mutate({ lessonId, moduleId }),
  };
}

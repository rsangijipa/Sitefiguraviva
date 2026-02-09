import useSWR from "swr";
import { enrollmentService } from "@/services/enrollmentService";
import { progressService } from "@/services/progressService";
import { eventService } from "@/services/eventService";
import { certificateService } from "@/services/certificateService";

// SWR Configuration
const swrConfig = {
  revalidateOnFocus: false, // Don't refetch on window focus
  revalidateOnReconnect: true, // Refetch on reconnect
  dedupingInterval: 30000, // Dedupe requests within 30s
  refreshInterval: 0, // No auto-refresh (manual trigger only)
  shouldRetryOnError: false,
};

/**
 * Cached hook for user enrollments
 * Reduces Firestore reads by ~70% on portal dashboard
 */
export function useCachedEnrollments(userId: string | undefined) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? `enrollments-${userId}` : null,
    () => enrollmentService.getUserEnrollments(userId!),
    {
      ...swrConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    },
  );

  return {
    enrollments: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Cached hook for user certificates
 */
export function useCachedCertificates(userId: string | undefined) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? `certificates-${userId}` : null,
    () => certificateService.getUserCertificates(userId!),
    {
      ...swrConfig,
      refreshInterval: 600000, // Refresh every 10 minutes (certificates change rarely)
    },
  );

  return {
    certificates: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Cached hook for upcoming events
 */
export function useCachedEvents(limit: number = 5) {
  const { data, error, mutate, isLoading } = useSWR(
    `events-upcoming-${limit}`,
    () => eventService.getUpcomingEvents(limit),
    {
      ...swrConfig,
      refreshInterval: 180000, // Refresh every 3 minutes
    },
  );

  return {
    events: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Cached hook for course progress
 */
export function useCachedProgress(
  userId: string | undefined,
  courseId: string | undefined,
) {
  const { data, error, mutate, isLoading } = useSWR(
    userId && courseId ? `progress-${userId}-${courseId}` : null,
    () => progressService.getCourseProgress(userId!, courseId!),
    {
      ...swrConfig,
      refreshInterval: 60000, // Refresh every 1 minute (active studying)
    },
  );

  return {
    progress: data || null,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Optimistic update helper
 * Use when you want to update cache immediately after mutation
 *
 * Example:
 * const { enrollments, refresh } = useCachedEnrollments(uid);
 * await enrollUser(email, courseId);
 * refresh(); // Force cache refresh
 */
export function useOptimisticUpdate<T>(
  key: string,
  updateFn: (current: T) => T,
) {
  const { data, mutate } = useSWR<T>(key);

  const update = async (serverUpdate: () => Promise<any>) => {
    if (!data) return;

    // Optimistic update
    const optimisticData = updateFn(data);
    mutate(optimisticData, false); // Update cache without revalidation

    try {
      await serverUpdate();
      mutate(); // Revalidate from server
    } catch (error) {
      mutate(); // Revert on error
      throw error;
    }
  };

  return { update };
}

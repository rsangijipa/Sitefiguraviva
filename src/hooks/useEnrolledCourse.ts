import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  Timestamp,
  setDoc,
  limit,
} from "firebase/firestore";
import { Module, Lesson } from "@/types/lms";

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
      // If we are admin, we continue even without userId for courses?
      // Actually usually userId is always there if logged in.
      if (!courseId) return null;

      // 1. Check Enrollment (SSoT) - Skip if Admin
      let enrollmentData: any = null;
      let status = isAdmin ? "active" : "none";

      if (!isAdmin && userId) {
        try {
          const enrollmentRef = doc(db, "enrollments", `${userId}_${courseId}`);
          const enrollmentSnap = await getDoc(enrollmentRef);

          if (enrollmentSnap.exists()) {
            enrollmentData = {
              id: enrollmentSnap.id,
              ...enrollmentSnap.data(),
            };
            status = enrollmentData.status || "none";
          } else {
            // Fallback: Query by field
            const q = query(
              collection(db, "enrollments"),
              where("uid", "==", userId),
              where("courseId", "==", courseId),
              limit(1),
            );
            const fallbackSnap = await getDocs(q);
            if (!fallbackSnap.empty) {
              const d = fallbackSnap.docs[0];
              enrollmentData = { id: d.id, ...d.data() };
              status = enrollmentData.status || "none";
            }
          }
        } catch (err) {
          console.warn("[useEnrolledCourse] Enrollment check failed:", err);
        }
      }

      // 2. Fetch Course Metadata
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      if (!courseSnap.exists()) return null;
      const course = { id: courseSnap.id, ...courseSnap.data() };

      // Paywall check: if not member AND not admin, return limited data
      const isMember = isAdmin || status === "active" || status === "completed";

      if (!isMember) {
        return {
          course,
          enrollment: enrollmentData,
          status,
          modules: [],
          materials: [],
        };
      }

      // 3. Member/Admin Data: Modules & Lessons
      try {
        const modulesQ = query(
          collection(db, "courses", courseId, "modules"),
          orderBy("order", "asc"),
        );
        const materialsQ = query(
          collection(db, "courses", courseId, "materials"),
        );

        const [modulesSnap, materialsSnap] = await Promise.all([
          getDocs(modulesQ),
          getDocs(materialsQ),
        ]);

        const modules = modulesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          lessons: [], // Initialize lessons array
        })) as any[];

        // Lessons sub-fetch in parallel
        await Promise.all(
          modules.map(async (m) => {
            const lessonsSnap = await getDocs(
              query(
                collection(db, "courses", courseId, "modules", m.id, "lessons"),
                orderBy("order", "asc"),
              ),
            );
            m.lessons = lessonsSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
          }),
        );

        return {
          course,
          enrollment: enrollmentData,
          status,
          modules,
          materials: materialsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        };
      } catch (err) {
        console.error("[useEnrolledCourse] Full content fetch failed:", err);
        throw err; // Trigger 403 screen if content is blocked
      }
    },
    staleTime: 0, // Force fresh data on every new mount/tab switch for course player
    gcTime: 1000 * 60 * 10, // Keep in memory for 10 mins
    retry: 1, // One retry on failure (helps with race conditions during enrollment)
  });

  // Mutation: Update Progress (Last Access)
  const updateLastAccess = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!userId || !courseId || isAdmin) return; // Admins don't track progress
      const progressRef = doc(db, "progress", `${userId}_${courseId}`);
      await setDoc(
        progressRef,
        {
          uid: userId, // Match our consistent naming
          courseId,
          lastLessonId: lessonId,
          lastAccessedAt: Timestamp.now(),
        },
        { merge: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrolled-course", courseId, userId],
      });
    },
  });

  // Mutation: Mark Complete
  const markComplete = useMutation({
    mutationFn: async ({
      lessonId,
      moduleId,
    }: {
      lessonId: string;
      moduleId: string;
    }) => {
      // Validation/Logic is handled by Server Action
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrolled-course", courseId, userId],
      });
    },
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    // Fix: check specifically for permission denied or the custom 'none' status
    isAccessDenied:
      queryResult.error &&
      (queryResult.error as any).code === "permission-denied",
    updateLastAccess: updateLastAccess.mutate,
    markComplete: (lessonId: string, moduleId: string) =>
      markComplete.mutate({ lessonId, moduleId }),
  };
}

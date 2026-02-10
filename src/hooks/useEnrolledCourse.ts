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
import { markLessonCompleted } from "@/app/actions/progress";

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

      // 3. User Progress (Numerador) - FIX: PRG-01 Sincronismo
      const progressMap: Record<string, any> = {};
      if (userId && !isAdmin) {
        const progressQ = query(
          collection(db, "progress"),
          where("userId", "==", userId),
          where("courseId", "==", courseId),
        );
        const progressSnap = await getDocs(progressQ);
        progressSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.lessonId) progressMap[data.lessonId] = data;
        });
      }

      // 4. Member/Admin Data: Modules & Lessons
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
          lessons: [],
        })) as any[];

        await Promise.all(
          modules.map(async (m) => {
            const lessonsSnap = await getDocs(
              query(
                collection(db, "courses", courseId, "modules", m.id, "lessons"),
                orderBy("order", "asc"),
              ),
            );
            m.lessons = lessonsSnap.docs.map((d) => {
              const lessonData = d.data();
              const prog = progressMap[d.id];
              return {
                id: d.id,
                ...lessonData,
                isCompleted: prog?.status === "completed",
                maxWatchedSecond: prog?.maxWatchedSecond || 0,
              };
            });
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
        throw err;
      }
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  // Mutation: Update Progress (Last Access)
  const updateLastAccess = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!userId || !courseId || isAdmin) return;
      const progressRef = doc(
        db,
        "progress",
        `${userId}_${courseId}_${lessonId}`,
      );
      await setDoc(
        progressRef,
        {
          userId,
          courseId,
          lessonId,
          lastAccessedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
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

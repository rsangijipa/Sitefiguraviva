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
} from "firebase/firestore";
import { Module, Lesson } from "@/types/lms";

interface EnrolledCourseData {
  course: any;
  modules: Module[];
  materials: any[];
  enrollment: any;
  status: string;
}

export function useEnrolledCourse(
  courseId: string,
  userId: string | undefined,
  initialData?: EnrolledCourseData | null,
) {
  const queryClient = useQueryClient();

  // 1. Main Query: Fetch all course data
  const { data, isLoading, error, isError } = useQuery<
    EnrolledCourseData,
    Error
  >({
    queryKey: ["enrolled-course", courseId, userId],
    initialData: initialData || undefined,
    queryFn: async () => {
      if (!userId || !courseId) throw new Error("Missing params");

      // A. Fetch Course Details (Public/Protected by published status)
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (!courseDoc.exists()) throw new Error("Course not found");
      const course = { id: courseDoc.id, ...courseDoc.data() };

      // B. Check Enrollment (Root Collection source of truth)
      const enrollmentQ = query(
        collection(db, "enrollments"),
        where("uid", "==", userId),
        where("courseId", "==", courseId),
      );
      const enrollmentSnap = await getDocs(enrollmentQ);
      let enrollmentData = null;
      let status = "none";
      let progressData: any = {};

      if (!enrollmentSnap.empty) {
        // Priority: active enrollment
        const active = enrollmentSnap.docs.find(
          (d) => d.data().status === "active",
        );
        const docToUse = active || enrollmentSnap.docs[0];
        enrollmentData = { id: docToUse.id, ...docToUse.data() };
        status = enrollmentData.status || "none";
        console.log(
          `[useEnrolledCourse] Found enrollment info. Status: ${status}`,
          enrollmentData,
        );
      } else {
        console.warn(
          `[useEnrolledCourse] No enrollment found for UID: ${userId} and Course: ${courseId}`,
        );
      }

      // If not active, return limited data (Paywall Mode)
      if (status !== "active") {
        return {
          course,
          modules: [],
          materials: [],
          enrollment: enrollmentData,
          status,
        };
      }

      // Fetch Progress (Atomic Collection)
      try {
        // Query all progress docs for this user/course
        const progressQ = query(
          collection(db, "progress"),
          where("userId", "==", userId),
          where("courseId", "==", courseId),
        );
        const progressSnap = await getDocs(progressQ);

        // Construct map: lessonId -> status
        progressSnap.docs.forEach((doc) => {
          const d = doc.data();
          if (d.lessonId) {
            progressData[d.lessonId] = {
              completed: d.status === "completed",
              maxWatchedSecond: d.maxWatchedSecond,
              percent: d.percent,
            };
            // Also check for last accessed timestamp to determine "lastLessonId" candidate?
            // Actually, let's keep it simple. The server doesn't track "lastLessonId" in progress docs explicitly easily queryable without sort.
            // We rely on enrollment.lastAccessedAt or similar, but for now let's just use what we have.
          }
          if (d.lastLessonId) {
            // Fallback if we decide to store it here, but actually we store it in enrollment or separate tracking doc
          }
        });
      } catch (e) {
        console.warn("Error fetching progress:", e);
      }

      // C. Fetch Materials (Only if Active) -- Visbility Filter in memory
      const materialsQ = query(
        collection(db, "courses", courseId, "materials"),
        orderBy("createdAt", "desc"),
      );
      const materialsSnap = await getDocs(materialsQ);
      const materials = materialsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as any)
        .filter(
          (m) =>
            !m.visibility ||
            m.visibility === "enrolled" ||
            m.visibility === "after_completion",
        ); // Default to enrolled if missing

      // D. Fetch Modules & Lessons (Only if Active)
      // Relaxed filter for legacy content support
      const modulesQ = query(
        collection(db, "courses", courseId, "modules"),
        orderBy("order", "asc"),
      );
      const modulesSnap = await getDocs(modulesQ);

      const modulesPromises = modulesSnap.docs
        .filter((mDoc) => mDoc.data().isPublished !== false) // Handle missing/true as visible
        .map(async (mDoc) => {
          const lessonsQ = query(
            collection(db, "courses", courseId, "modules", mDoc.id, "lessons"),
            orderBy("order", "asc"),
          );
          const lessonsSnap = await getDocs(lessonsQ);

          const lessons: Lesson[] = lessonsSnap.docs
            .filter((lDoc) => lDoc.data().isPublished !== false)
            .map((lDoc) => {
              const lData = lDoc.data();
              // Use atomic progress data
              const p = progressData[lDoc.id];
              const isCompleted = !!p?.completed;

              return {
                id: lDoc.id,
                moduleId: mDoc.id,
                courseId: courseId,
                title: lData.title,
                duration: lData.duration,
                videoUrl: lData.videoUrl,
                description: lData.description,
                thumbnail: lData.thumbnail,
                isCompleted,
                isLocked: lData.isLocked || false,
                type: (lData.type || "video") as "video" | "text" | "quiz",
                order: lData.order || 0,
                isPublished: lData.isPublished !== false,
              };
            });

          return {
            id: mDoc.id,
            courseId,
            title: mDoc.data().title,
            order: mDoc.data().order,
            isPublished: true,
            lessons,
          } as Module;
        });

      const modules = await Promise.all(modulesPromises);

      // E. Recalculate Progress Stats - DEPRECATED
      // Server now strictly handles SSoT via progressService.
      // We trust enrollment.progressSummary.

      return { course, modules, materials, enrollment: enrollmentData, status };
    },
    enabled: !!userId && !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // 2. Mutations to update progress (Target 'progress' collection)
  const updateLastAccessMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!userId) return;
      // Ensure doc exists (upsert)
      // Note: This was writing to a deprecated "aggregate" doc.
      // We should arguably move this to a user_preferences or just update enrollment.
      // For now, let's update the Enrollment doc which is the SSoT for "lastLessonId"
      const enrollmentRef = doc(db, "enrollments", `${userId}_${courseId}`);
      await setDoc(
        enrollmentRef,
        {
          lastLessonId: lessonId,
          lastAccessedAt: Timestamp.now(),
        },
        { merge: true },
      );
    },
    onSuccess: (_, lessonId) => {
      // Update cache optimistically
      queryClient.setQueryData(
        ["enrolled-course", courseId, userId],
        (old: EnrolledCourseData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            enrollment: { ...old.enrollment, lastLessonId: lessonId },
          };
        },
      );
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async ({
      lessonId,
      moduleId,
    }: {
      lessonId: string;
      moduleId: string;
    }) => {
      if (!userId) return;

      // Use Server Action (Fixes LOG-02 & PRG-02)
      await import("@/actions/progress").then(({ updateLessonProgress }) =>
        updateLessonProgress(courseId, moduleId, lessonId, {
          status: "completed",
        }),
      );
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.setQueryData(
        ["enrolled-course", courseId, userId],
        (old: EnrolledCourseData | undefined) => {
          if (!old) return old;
          // Optimistic update of modules structure
          const newModules = old.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, isCompleted: true } : l,
            ),
          }));
          return { ...old, modules: newModules };
        },
      );
    },
  });

  return {
    data,
    isLoading,
    error,
    isAccessDenied: error && (error as any).code === "permission-denied",
    updateLastAccess: updateLastAccessMutation.mutate,
    markComplete: (lessonId: string, moduleId: string) =>
      markCompleteMutation.mutate({ lessonId, moduleId }),
  };
}

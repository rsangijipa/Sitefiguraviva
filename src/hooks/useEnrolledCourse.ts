import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, collection, query, orderBy, getDocs, where, Timestamp, setDoc } from 'firebase/firestore';
import { Module, Lesson } from '@/components/portal/LessonSidebar';

interface EnrolledCourseData {
    course: any;
    modules: Module[];
    materials: any[];
    enrollment: any;
    status: string;
}

export function useEnrolledCourse(courseId: string, userId: string | undefined, initialData?: EnrolledCourseData | null) {
    const queryClient = useQueryClient();

    // 1. Main Query: Fetch all course data
    const { data, isLoading, error, isError } = useQuery<EnrolledCourseData, Error>({
        queryKey: ['enrolled-course', courseId, userId],
        initialData: initialData || undefined,
        queryFn: async () => {
            if (!userId || !courseId) throw new Error("Missing params");

            // A. Fetch Course Details (Public/Protected by published status)
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (!courseDoc.exists()) throw new Error("Course not found");
            const course = { id: courseDoc.id, ...courseDoc.data() };

            // B. Check Enrollment (Root Collection source of truth)
            const enrollmentQ = query(
                collection(db, 'enrollments'),
                where('userId', '==', userId),
                where('courseId', '==', courseId)
            );
            const enrollmentSnap = await getDocs(enrollmentQ);
            let enrollmentData = null;
            let status = 'none';
            let progressData: any = {};

            if (!enrollmentSnap.empty) {
                enrollmentData = { id: enrollmentSnap.docs[0].id, ...enrollmentSnap.docs[0].data() };
                status = enrollmentData.status || 'none';
            }

            // If not active, return limited data (Paywall Mode)
            if (status !== 'active') {
                return {
                    course,
                    modules: [],
                    materials: [],
                    enrollment: enrollmentData,
                    status
                };
            }

            // Fetch Progress (Separate Collection)
            try {
                const progressDoc = await getDoc(doc(db, 'progress', `${userId}_${courseId}`));
                if (progressDoc.exists()) {
                    progressData = progressDoc.data();
                }
            } catch (e) {
                console.warn("Error fetching progress:", e);
            }

            // C. Fetch Materials (Only if Active)
            const materialsQ = query(collection(db, 'courses', courseId, 'materials'), orderBy('created_at', 'desc'));
            const materialsSnap = await getDocs(materialsQ);
            const materials = materialsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // D. Fetch Modules & Lessons (Only if Active)
            const modulesQ = query(collection(db, 'courses', courseId, 'modules'), orderBy('order', 'asc'));
            const modulesSnap = await getDocs(modulesQ);

            const modulesPromises = modulesSnap.docs.map(async (mDoc) => {
                const lessonsQ = query(collection(db, 'courses', courseId, 'modules', mDoc.id, 'lessons'), orderBy('order', 'asc'));
                const lessonsSnap = await getDocs(lessonsQ);

                const lessons: Lesson[] = lessonsSnap.docs.map(lDoc => {
                    const lData = lDoc.data();
                    // Use separated progress data
                    const progress = progressData.lessonProgress || {};
                    const isCompleted = !!progress[lDoc.id]?.completed;

                    return {
                        id: lDoc.id,
                        title: lData.title,
                        duration: lData.duration,
                        videoUrl: lData.videoUrl,
                        description: lData.description,
                        thumbnail: lData.thumbnail,
                        isCompleted,
                        isLocked: lData.isLocked || false,
                        type: (lData.type || 'video') as 'video' | 'text' | 'quiz'
                    };
                });

                return {
                    id: mDoc.id,
                    title: mDoc.data().title,
                    lessons
                };
            });

            const modules = await Promise.all(modulesPromises);

            // Merge progress lastLessonId into enrollment for UI consumption if needed, or handle separately
            // The UI uses enrollment.lastLessonId. Let's merge it back into the enrollment object we return
            if (enrollmentData && progressData.lastLessonId) {
                enrollmentData.lastLessonId = progressData.lastLessonId;
            }

            return { course, modules, materials, enrollment: enrollmentData, status };
        },
        enabled: !!userId && !!courseId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false
    });

    // 2. Mutations to update progress (Target 'progress' collection)
    const updateLastAccessMutation = useMutation({
        mutationFn: async (lessonId: string) => {
            if (!userId) return;
            const progressRef = doc(db, 'progress', `${userId}_${courseId}`);

            // Ensure doc exists (upsert)
            await setDoc(progressRef, {
                userId,
                courseId,
                lastLessonId: lessonId,
                lastAccessedAt: Timestamp.now()
            }, { merge: true });
        },
        onSuccess: (_, lessonId) => {
            // Update cache optimistically
            queryClient.setQueryData(['enrolled-course', courseId, userId], (old: EnrolledCourseData | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    enrollment: { ...old.enrollment, lastLessonId: lessonId }
                };
            });
        }
    });

    const markCompleteMutation = useMutation({
        mutationFn: async (lessonId: string) => {
            if (!userId) return;
            const progressRef = doc(db, 'progress', `${userId}_${courseId}`);

            const progressUpdate = {
                userId, // Ensure ownership field for rules
                courseId,
                [`lessonProgress.${lessonId}`]: {
                    completed: true,
                    completedAt: Timestamp.now()
                },
                lastLessonId: lessonId,
                lastAccessedAt: Timestamp.now()
            };
            await setDoc(progressRef, progressUpdate, { merge: true });
        },
        onSuccess: (_, lessonId) => {
            queryClient.setQueryData(['enrolled-course', courseId, userId], (old: EnrolledCourseData | undefined) => {
                if (!old) return old;
                // Optimistic update of modules structure
                const newModules = old.modules.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l)
                }));
                return { ...old, modules: newModules };
            });
        }
    });

    return {
        data,
        isLoading,
        error,
        isAccessDenied: error && (error as any).code === 'permission-denied',
        updateLastAccess: updateLastAccessMutation.mutate,
        markComplete: markCompleteMutation.mutate
    };
}

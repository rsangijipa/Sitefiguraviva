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

export function useEnrolledCourse(courseId: string, userId: string | undefined) {
    const queryClient = useQueryClient();

    // 1. Main Query: Fetch all course data
    const { data, isLoading, error, isError } = useQuery<EnrolledCourseData, Error>({
        queryKey: ['enrolled-course', courseId, userId],
        queryFn: async () => {
            if (!userId || !courseId) throw new Error("Missing params");

            // A. Fetch Course Details (Public/Protected by published status)
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (!courseDoc.exists()) throw new Error("Course not found");
            const course = { id: courseDoc.id, ...courseDoc.data() };

            // B. Check Enrollment
            const enrollmentQ = query(
                collection(db, 'users', userId, 'enrollments'),
                where('courseId', '==', courseId)
            );
            const enrollmentSnap = await getDocs(enrollmentQ);
            let enrollmentData = null;
            let status = 'none';

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
                    const progress = enrollmentData.progress || {};
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

            return { course, modules, materials, enrollment: enrollmentData, status };
        },
        enabled: !!userId && !!courseId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false
    });

    // 2. Mutations to update progress
    const updateLastAccessMutation = useMutation({
        mutationFn: async (lessonId: string) => {
            if (!data?.enrollment?.id || !userId) return;
            await setDoc(doc(db, 'users', userId, 'enrollments', data.enrollment.id), {
                lastLessonId: lessonId,
                lastAccessedAt: Timestamp.now()
            }, { merge: true });
        },
        onSuccess: (_, lessonId) => {
            // Update cache optimistically or invalidate
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
            if (!data?.enrollment?.id || !userId) return;
            const progressUpdate = {
                [`progress.${lessonId}`]: {
                    completed: true,
                    completedAt: Timestamp.now()
                },
                lastLessonId: lessonId,
                lastAccessedAt: Timestamp.now()
            };
            await setDoc(doc(db, 'users', userId, 'enrollments', data.enrollment.id), progressUpdate, { merge: true });
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

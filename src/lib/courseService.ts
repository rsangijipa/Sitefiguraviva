import { db } from '@/lib/firebase/admin';
import { FieldPath } from 'firebase-admin/firestore';

export type LessonType = 'video' | 'text' | 'quiz';

export interface Lesson {
    id: string;
    title: string;
    duration?: string;
    videoUrl?: string; // Should be provider ID in future, mostly null for secure
    description?: string;
    thumbnail?: string;
    isCompleted: boolean;
    isLocked: boolean;
    type: LessonType;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

export async function getCourseData(courseId: string, userId: string) {
    if (!courseId || !userId) return null;

    // 1. Fetch Course & Enrollment (Parallel)
    const coursePromise = db.collection('courses').doc(courseId).get();

    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentPromise = db.collection('enrollments').doc(enrollmentId).get();

    const [courseDoc, enrollmentDoc] = await Promise.all([coursePromise, enrollmentPromise]);

    if (!courseDoc.exists) return null; // Or throw 404

    const courseData = { id: courseDoc.id, ...courseDoc.data() };
    let enrollmentData = null;
    let status = 'none';

    if (enrollmentDoc.exists) {
        enrollmentData = { id: enrollmentDoc.id, ...enrollmentDoc.data() };
        status = enrollmentData.status || 'none'; // @ts-ignore
    }

    // Paywall gate: If not active, return limited data
    if (status !== 'active') {
        return {
            course: courseData,
            modules: [],
            materials: [],
            enrollment: enrollmentData,
            status,
            isAccessDenied: true
        };
    }

    // 2. Fetch Progress
    let progressData: any = {};
    const progressDoc = await db.collection('progress').doc(`${userId}_${courseId}`).get();
    if (progressDoc.exists) {
        progressData = progressDoc.data();
    }

    // 3. Fetch Materials & Modules (Parallel)
    const materialsPromise = db.collection('courses').doc(courseId).collection('materials')
        .orderBy('created_at', 'desc').get();

    const modulesPromise = db.collection('courses').doc(courseId).collection('modules')
        .orderBy('order', 'asc').get();

    const [materialsSnap, modulesSnap] = await Promise.all([materialsPromise, modulesPromise]);

    const materials = materialsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 4. Fetch Lessons for modules
    // Note: This can be N+1. Ideally we structure modules/lessons better or use a recursive fetch function?
    // Admin SDK doesn't support collectionGroup queries constrained to specific parent well without ID.
    // Iteration is acceptable for reasonable module counts (usually < 20).
    const moduleDocs = modulesSnap.docs;
    const modules: Module[] = [];

    // Use Promise.all for parallel lesson fetching
    const modulesWithLessons = await Promise.all(moduleDocs.map(async (mDoc) => {
        const lessonsSnap = await db.collection('courses').doc(courseId).collection('modules').doc(mDoc.id).collection('lessons')
            .orderBy('order', 'asc').get();

        const lessons: Lesson[] = lessonsSnap.docs.map(lDoc => {
            const lData = lDoc.data();
            const lessonProgress = progressData.lessonProgress || {};
            const isCompleted = !!lessonProgress[lDoc.id]?.completed;

            return {
                id: lDoc.id,
                title: lData.title,
                duration: lData.duration,
                videoUrl: lData.videoUrl,
                description: lData.description,
                thumbnail: lData.thumbnail,
                isCompleted,
                isLocked: lData.isLocked || false,
                type: (lData.type || 'video') as LessonType
            };
        });

        return {
            id: mDoc.id,
            title: mDoc.data().title,
            lessons
        };
    }));

    // Merge progress lastAccess
    if (enrollmentData && progressData.lastLessonId) { // @ts-ignore
        enrollmentData.lastLessonId = progressData.lastLessonId;
    }

    return {
        course: courseData,
        modules: modulesWithLessons,
        materials,
        enrollment: enrollmentData,
        status,
        isAccessDenied: false
    };
}

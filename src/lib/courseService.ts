import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase/admin';
import { Course, Module, Lesson, Block } from '@/types/lms';
import { deepSafeSerialize } from './utils';

export async function getCourseData(courseId: string, userId: string) {
    if (!courseId || !userId) return null;

    // 1. Fetch Course & Enrollment (Parallel)
    const coursePromise = db.collection('courses').doc(courseId).get();
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentPromise = db.collection('enrollments').doc(enrollmentId).get();

    const [courseDoc, enrollmentDoc] = await Promise.all([coursePromise, enrollmentPromise]);

    if (!courseDoc.exists) return null;

    const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
    let enrollmentData = null;
    let status = 'none';

    if (enrollmentDoc.exists) {
        enrollmentData = { id: enrollmentDoc.id, ...enrollmentDoc.data() };
        status = enrollmentData.status || 'none';
    }

    // Paywall gate: If not active, return limited data
    if (status !== 'active') {
        return {
            course: courseData,
            modules: [],
            enrollment: enrollmentData,
            status,
            isAccessDenied: true
        };
    }

    // 2. Fetch Progress (ATOMIC - New Pattern)
    // We query the 'progress' collection for this user and course
    const progressSnap = await db.collection('progress')
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        // Removed status filter to get all progress including in-progress for resume
        .get();

    const progressMap = new Map<string, any>();
    progressSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.lessonId) {
            progressMap.set(data.lessonId, data);
        }
    });

    // 3. Fetch Modules & Lessons
    // Fetch all modules
    const modulesSnap = await db.collection('courses').doc(courseId).collection('modules')
        .orderBy('order', 'asc').get();

    const modules: Module[] = await Promise.all(modulesSnap.docs.map(async (mDoc) => {
        // Fetch lessons for each module
        const lessonsSnap = await db.collection('courses').doc(courseId).collection('modules').doc(mDoc.id).collection('lessons')
            .orderBy('order', 'asc').get();

        const lessons: Lesson[] = lessonsSnap.docs.map(lDoc => {
            const lData = lDoc.data();
            const progress = progressMap.get(lDoc.id);
            const isCompleted = progress?.status === 'completed';

            return {
                id: lDoc.id,
                moduleId: mDoc.id,
                courseId: courseId,
                title: lData.title,
                description: lData.description,
                order: lData.order,
                isPublished: lData.isPublished,
                duration: lData.duration, // Estimated minutes
                thumbnail: lData.thumbnail,
                // Add completion status to the runtime object
                // @ts-ignore
                isCompleted: isCompleted,
                maxWatchedSecond: progress?.maxWatchedSecond || 0,
                percent: progress?.percent || 0,
                isLocked: false // Implement lock logic if needed
            } as Lesson;
        });

        return {
            id: mDoc.id,
            courseId,
            title: mDoc.data().title,
            description: mDoc.data().description,
            order: mDoc.data().order,
            isPublished: mDoc.data().isPublished,
            lessons: lessons.filter(l => l.isPublished !== false)
        } as Module;
    })).then(modules => modules.filter(m => m.isPublished !== false));

    // 4. Recalculate Progress Stats (Live & Authoritative)
    // We trust the filtered list of published lessons as the true denominator.
    const allPublishedLessons = modules.flatMap(m => m.lessons);
    const totalPublished = allPublishedLessons.length;
    const completedCount = allPublishedLessons.filter(l => l.isCompleted).length;

    // Percent logic:
    // If totalPublished is 0, percent is 0.
    // Else, (completed / total) * 100.
    const percent = totalPublished > 0 ? Math.round((completedCount / totalPublished) * 100) : 0;

    // Override enrollment summary with live calculation to ensure UI is correct
    if (enrollmentData) {
        enrollmentData.progressSummary = {
            ...enrollmentData.progressSummary,
            completedLessonsCount: completedCount,
            totalLessons: totalPublished,
            percent: percent
        };
    }

    return deepSafeSerialize({
        course: courseData,
        modules,
        enrollment: enrollmentData,
        status,
        isAccessDenied: false
    });
}

export async function getLessonContent(courseId: string, moduleId: string, lessonId: string) {
    // Fetch specific lesson and its blocks
    const lessonRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId);

    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) return null;

    let blocksSnap;
    try {
        blocksSnap = await lessonRef.collection('blocks').orderBy('order', 'asc').get();
    } catch (error) {
        // Legacy blocks might not have an 'order' field; fallback without ordering
        blocksSnap = await lessonRef.collection('blocks').get();
    }

    const lesson = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;

    const blocks = blocksSnap.docs.map(doc => {
        const data: any = doc.data();
        return {
            id: doc.id,
            ...data,
            // Default: visible unless explicitly disabled
            isPublished: data?.isPublished !== false
        };
    }) as Block[];

    return deepSafeSerialize({ lesson, blocks });
}

export async function saveLessonContent(courseId: string, moduleId: string, lessonId: string, blocks: Block[]) {
    const lessonRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId);
    const blocksRef = lessonRef.collection('blocks');

    // Batch write for atomicity
    const batch = db.batch();

    // 1. Delete existing blocks (simple replacement strategy for MVP)
    // In a real optimized app, we would diff changes.
    const existingBlocksSnap = await blocksRef.get();
    existingBlocksSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // 2. Normalize and add new blocks
    const safeBlocks = (blocks || []).map((b: any, idx: number) => ({
        ...b,
        // Default ordering and publish state (legacy data may omit these fields)
        order: typeof b?.order === 'number' ? b.order : idx + 1,
        isPublished: b?.isPublished !== false,
    })) as Block[];

    safeBlocks.forEach((block: any) => {
        const docRef = blocksRef.doc(block.id);
        const { id, ...raw } = block;

        batch.set(docRef, {
            ...raw,
            order: typeof raw?.order === 'number' ? raw.order : 0,
            isPublished: raw?.isPublished !== false,
            updatedAt: new Date(),
            createdAt: raw?.createdAt || new Date(),
        });
    });

    // 3. Update lesson timestamp/count (use set+merge for safety)
    batch.set(lessonRef, {
        updatedAt: FieldValue.serverTimestamp(),
        publishedBlocksCount: safeBlocks.filter((b: any) => b?.isPublished !== false).length
    }, { merge: true });

    // 4. Increment course content revision (Structural Integrity)
    batch.update(db.collection('courses').doc(courseId), {
        contentRevision: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
    });

    return batch.commit();
}

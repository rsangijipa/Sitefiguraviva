import { db } from '@/lib/firebase/admin';
import { Course, Module, Lesson } from '@/types/lms';

// DTOs for the DAL
export interface CourseWithModules extends Course {
    modules: ModuleWithLessons[];
}

export interface ModuleWithLessons extends Module {
    lessons: Lesson[];
}

/**
 * Fetches a course by ID.
 * Authorization: 
 * - If published: Anyone can see.
 * - If not published: Only Admin or Owner (logic to be enhanced) can see.
 * For now, strict on 'isPublished' unless bypass provided (e.g. for admin panel).
 */
export async function getCourseById(courseId: string, includeUnpublished = false): Promise<Course | null> {
    const docRef = db.collection('courses').doc(courseId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return null;

    const data = docSnap.data();
    if (!data) return null;

    // AuthZ Check
    if (!data.isPublished && !includeUnpublished) {
        return null; // Treat as not found or unauthorized
    }

    return {
        id: docSnap.id,
        ...data,
        // Ensure dates are serialized if needed, but for internal DAL we keep Firestore types until boundary
    } as Course;
}

/**
 * Fetches all modules and lessons for a course in a single optimized structure.
 * Avoids N+1 queries by fetching collections in parallel batches if possible, 
 * or just hierarchical as Firestore structure dictates (which is unfortunately nested).
 * 
 * Optimization: Firestore doesn't support deep fetch. We must fetch subcollections.
 * To optimize N+1 of fetching lessons for EACH module:
 * 1. Fetch all modules.
 * 2. For each module, fetch lessons (still N queries, but unavoidable in standard Firestore nesting).
 * 
 * A better NoSQL structure for "Read" would be duplicating the lesson tree into a single document,
 * but for now we stick to the existing structure.
 */
export async function getCourseContent(courseId: string): Promise<CourseWithModules | null> {
    const course = await getCourseById(courseId, true); // Assume content fetcher implies access check done before or handles it
    if (!course) return null;

    const modulesSnap = await db.collection('courses').doc(courseId).collection('modules').orderBy('order', 'asc').get();

    const modulesWithLessons = await Promise.all(modulesSnap.docs.map(async (mDoc) => {
        const lessonsSnap = await mDoc.ref.collection('lessons').orderBy('order', 'asc').get();

        const lessons = lessonsSnap.docs.map(lDoc => ({
            id: lDoc.id,
            ...lDoc.data()
        })) as Lesson[];

        return {
            id: mDoc.id,
            ...mDoc.data(),
            lessons
        } as ModuleWithLessons;
    }));

    return {
        ...course,
        modules: modulesWithLessons
    };
}

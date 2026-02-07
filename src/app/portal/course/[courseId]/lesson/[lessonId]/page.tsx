
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase/admin';
import { LessonPlayerWrapper } from '@/components/portal/LessonPlayerWrapper';
import { Lesson, Module } from '@/types/lms';

export const dynamic = 'force-dynamic';

// Helper to fetch full course structure
async function getCourseData(courseId: string) {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) return null;

    const modulesSnap = await db.collection('courses').doc(courseId).collection('modules').orderBy('order', 'asc').get();
    const modules = await Promise.all(modulesSnap.docs.map(async doc => {
        const lessonsSnap = await doc.ref.collection('lessons').orderBy('order', 'asc').get();
        const lessons = lessonsSnap.docs.map(l => ({ id: l.id, moduleId: doc.id, ...l.data() }));
        return { id: doc.id, ...doc.data(), lessons };
    }));

    return { id: courseDoc.id, ...courseDoc.data(), modules } as any;
}

export default async function LessonPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
    const { courseId, lessonId } = await params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch { redirect('/login'); }

    const enrollmentDoc = await db.collection('enrollments').doc(`${uid}_${courseId}`).get();
    if (!enrollmentDoc.exists || enrollmentDoc.data()?.status !== 'active') {
        redirect('/portal/courses');
    }

    const courseData = await getCourseData(courseId);
    if (!courseData) redirect('/portal');

    const allLessons: Lesson[] = courseData.modules.flatMap((m: any) => m.lessons) as Lesson[];
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);

    if (currentIndex === -1) redirect(`/portal/course/${courseId}`);

    const activeLesson = allLessons[currentIndex];

    // FETCH CONTENT (Blocks)
    // We must fetch the subcollection 'blocks' for this lesson to show content
    if (activeLesson) {
        try {
            const blocksSnap = await db.collection('courses')
                .doc(courseId)
                .collection('modules')
                .doc(activeLesson.moduleId)
                .collection('lessons')
                .doc(activeLesson.id)
                .collection('blocks')
                .orderBy('order', 'asc')
                .get();

            const blocks = blocksSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isPublished: doc.data().isPublished !== false
            }));

            // @ts-ignore - injecting blocks into the lesson object for the player
            activeLesson.blocks = blocks;
        } catch (e) {
            console.error("Error fetching lesson blocks:", e);
        }
    }

    const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1].id : undefined;
    const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : undefined;

    return (
        <LessonPlayerWrapper
            course={{
                id: courseData.id,
                title: courseData.title,
                backLink: `/portal/course/${courseId}`
            }}
            modules={courseData.modules as Module[]}
            activeLesson={activeLesson}
            prevLessonId={prevLessonId}
            nextLessonId={nextLessonId}
        />
    );
}

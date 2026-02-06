import { adminDb } from '@/lib/firebase/admin';
import LessonEditorClient from './LessonEditorClient';

async function findLessonParent(courseId: string, lessonId: string) {
    // 1. Get all modules for this course
    const modulesSnap = await adminDb.collection('courses').doc(courseId).collection('modules').get();

    // 2. Search for the lesson in each module's subcollection
    for (const mDoc of modulesSnap.docs) {
        const lessonRef = mDoc.ref.collection('lessons').doc(lessonId);
        const lessonSnap = await lessonRef.get();

        if (lessonSnap.exists) {
            // Fetch blocks (admin editor must reflect what students will actually see)
            let blocks: any[] = [];
            try {
                const blocksSnap = await lessonRef.collection('blocks').orderBy('order', 'asc').get();
                blocks = blocksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } catch (error) {
                // Legacy blocks might not have 'order'
                const blocksSnap = await lessonRef.collection('blocks').get();
                blocks = blocksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            }

            return {
                module: { id: mDoc.id, ...mDoc.data() },
                lesson: { id: lessonSnap.id, ...lessonSnap.data(), blocks }
            };
        }
    }

    return null;
}

export default async function LessonPage({ params }: { params: Promise<{ id: string, lessonId: string }> }) {
    const { id: courseId, lessonId } = await params;

    // 1. Fetch Course using Admin SDK
    const courseSnap = await adminDb.collection('courses').doc(courseId).get();
    if (!courseSnap.exists) return <div>Curso não encontrado</div>;
    const course = { id: courseSnap.id, ...courseSnap.data() };

    // 2. Find Lesson and Module recursively using Admin SDK
    const parent = await findLessonParent(courseId, lessonId);
    if (!parent) return <div>Aula não encontrada no currículo</div>;

    const { module, lesson } = parent;

    // Serialize for Client Component
    const serializedLesson = JSON.parse(JSON.stringify(lesson));
    const serializedModule = JSON.parse(JSON.stringify(module));
    const serializedCourse = JSON.parse(JSON.stringify(course));

    return (
        <LessonEditorClient
            course={serializedCourse}
            module={serializedModule}
            initialLesson={serializedLesson}
        />
    );
}

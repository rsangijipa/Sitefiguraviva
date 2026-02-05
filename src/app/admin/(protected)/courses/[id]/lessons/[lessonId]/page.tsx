import { adminDb } from '@/lib/firebase/admin';
import LessonEditorClient from './LessonEditorClient';

async function findLessonParent(courseId: string, lessonId: string) {
    // 1. Get all modules for this course
    const modulesSnap = await adminDb.collection('courses').doc(courseId).collection('modules').get();

    // 2. Search for the lesson in each module's subcollection
    for (const mDoc of modulesSnap.docs) {
        const lessonsSnap = await mDoc.ref.collection('lessons').doc(lessonId).get();
        if (lessonsSnap.exists) {
            return {
                module: { id: mDoc.id, ...mDoc.data() },
                lesson: { id: lessonsSnap.id, ...lessonsSnap.data() }
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

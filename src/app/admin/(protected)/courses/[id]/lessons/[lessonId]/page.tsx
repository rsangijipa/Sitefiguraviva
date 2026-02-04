
import { adminCourseService } from '@/services/adminCourseService'; // We'll need getLesson here
import LessonEditorClient from './LessonEditorClient';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

// Helper since service might not have direct "getLesson" without knowing parents
async function getLessonData(courseId: string, moduleId: string, lessonId: string) {
    const ref = doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

// We need to find the moduleId for this lessonId if simpler URL is used, 
// OR we stick to full path logic. 
// Given the route is just [courseId]/lessons/[lessonId], we must search all modules to find the parent module.
// This is expensive. 
// BETTER: pass moduleId in URL query param? Or just stick to full path structure. 
// Since user says "complete page", maybe [courseId]/modules/[moduleId]/lessons/[lessonId]/edit is safer.
// But I defined `src/app/admin/(protected)/courses/[courseId]/lessons/[lessonId]/page.tsx` earlier.
// Let's implement a quick lookup function.

async function findLessonParent(courseId: string, lessonId: string) {
    // In a real app we'd use a Collection Group query or map.
    // For now, iterate modules. (Low scale usually)
    const modules = await adminCourseService.getModules(courseId);
    for (const m of modules) {
        const lessons = await adminCourseService.getLessons(courseId, m.id);
        const match = lessons.find(l => l.id === lessonId);
        if (match) return { module: m, lesson: match };
    }
    return null;
}

export default async function LessonPage({ params }: { params: Promise<{ id: string, lessonId: string }> }) {
    const { id: courseId, lessonId } = await params;

    // 1. Fetch Course (for context)
    const course = await adminCourseService.getCourse(courseId);
    if (!course) return <div>Curso não encontrado</div>;

    // 2. Find Lesson
    const parent = await findLessonParent(courseId, lessonId);
    if (!parent) return <div>Aula não encontrada (ou erro de paternidade)</div>;

    const { module, lesson } = parent;

    // Serialize
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

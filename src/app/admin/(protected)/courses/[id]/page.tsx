
import { adminCourseService } from '@/services/adminCourseService';
import CourseEditorClient from './CourseEditorClient';

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const course = await adminCourseService.getCourse(id);

    if (!course) {
        return <div className="p-12 text-center text-stone-500">Curso não encontrado.</div>;
    }

    // Convert timestamps to serializable
    const serializedCourse = JSON.parse(JSON.stringify(course));

    return <CourseEditorClient initialCourse={serializedCourse} />;
}

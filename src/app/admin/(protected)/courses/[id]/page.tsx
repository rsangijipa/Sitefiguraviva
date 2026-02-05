import { adminDb } from '@/lib/firebase/admin';
import CourseEditorClient from './CourseEditorClient';

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch directly using Admin SDK to bypass security rules on server-side
    const docRef = adminDb.collection('courses').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
        return <div className="p-12 text-center text-stone-500">Curso não encontrado.</div>;
    }

    const course = { id: snap.id, ...snap.data() };

    // Convert timestamps to serializable
    const serializedCourse = JSON.parse(JSON.stringify(course));

    return <CourseEditorClient initialCourse={serializedCourse} />;
}

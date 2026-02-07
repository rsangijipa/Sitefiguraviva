import { adminDb } from '@/lib/firebase/admin';
import CourseEditorClient from './CourseEditorClient';

export const dynamic = 'force-dynamic';

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let course;

    try {
        // Fetch directly using Admin SDK to bypass security rules on server-side
        const docRef = adminDb.collection('courses').doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return <div className="p-12 text-center text-stone-500">Curso não encontrado.</div>;
        }
        course = { id: snap.id, ...snap.data() };
    } catch (e: any) {
        console.error("Admin Fetch Error:", e);
        return (
            <div className="p-12 text-center text-red-500">
                <h3 className="font-bold">Erro de Autenticação no Admin SDK</h3>
                <p className="text-sm mt-2">{e.message}</p>
                <p className="text-xs text-stone-400 mt-4">Verifique as logs do servidor para detalhes da chave.</p>
            </div>
        );
    }

    // Convert timestamps to serializable
    const serializedCourse = JSON.parse(JSON.stringify(course));

    return <CourseEditorClient initialCourse={serializedCourse} />;
}


import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase/admin';
import { getCourseData } from '@/lib/courseService';
import CourseClient from './CourseClient';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        redirect('/login');
    }

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch (error) {
        redirect('/login');
    }

    // Server-Side Data Fetch
    const data = await getCourseData(courseId, uid);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-serif text-primary">Curso não encontrado.</h1>
            </div>
        );
    }

    // Access Control handled in Client or via middleware, but strictly we could redirect here if we want no-render
    if (data.isAccessDenied) {
        // We pass data to Client to show "Paywall" UI properly
    }

    // Serialize
    const serializedData = JSON.parse(JSON.stringify(data));

    return <CourseClient initialData={serializedData} />;
}


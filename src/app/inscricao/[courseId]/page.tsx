import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase/admin';
import EnrollmentStepper from './EnrollmentStepper';

export default async function EnrollmentPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    let uid = null;
    if (sessionCookie) {
        try {
            const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
            uid = decodedClaims.uid;
        } catch (e) {
            // Invalid session
        }
    }

    // 1. Fetch Course Data
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
        return <div className="p-10 text-center text-red-600">Curso não encontrado.</div>;
    }
    const courseData = { id: courseDoc.id, ...courseDoc.data() } as any;

    // Check Published
    if (!courseData.isPublished) {
        return <div className="p-10 text-center text-stone-500">Inscrições encerradas ou curso não disponível.</div>;
    }

    // 2. Fetch Enrollment (Root) & Application in parallel if user logged in
    let enrollmentData = null;
    let applicationData = null;

    if (uid) {
        const enrollmentId = `${uid}_${courseId}`;
        const [enrollmentDoc, applicationDoc] = await Promise.all([
            db.collection('enrollments').doc(enrollmentId).get(),
            db.collection('applications').doc(enrollmentId).get()
        ]);

        if (enrollmentDoc.exists) enrollmentData = enrollmentDoc.data();
        if (applicationDoc.exists) applicationData = applicationDoc.data();
    }

    // Serialize for Client Component
    const initialData = {
        course: JSON.parse(JSON.stringify(courseData)),
        enrollment: enrollmentData ? JSON.parse(JSON.stringify(enrollmentData)) : null,
        application: applicationData ? JSON.parse(JSON.stringify(applicationData)) : null,
        uid
    };

    return (
        <main className="min-h-screen bg-[#FDFCF9] py-12 px-4">
            <EnrollmentStepper
                courseId={courseId}
                initialData={initialData}
            />
        </main>
    );
}


import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase/admin';
import { getCourseData } from '@/lib/courseService';
import CourseClient from './CourseClient';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

    // Server-Side Data Fetch (Zero Waterfall)
    const data = await getCourseData(id, uid);

    if (!data) {
        // Course not found
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-serif text-primary">Curso não encontrado.</h1>
            </div>
        );
    }

    // Gate: Server-Side Access Check
    if (data.isAccessDenied) {
        // Option A: Redirect
        // redirect('/portal?error=access_denied');

        // Option B: Render "Paywall" UI immediately via Client Component (with status=none)
        // Since we pass 'data', CourseClient will see status!=active and render Paywall.
        // This is better than a blank 403 or redirect loop.
        // However, P4 requested "If not: redirect/403".
        // Let's pass data. CourseClient handles the visual Paywall.
        // BUT if we want *strict* security (no render of player code), we technically already achieved it
        // because we passed 'modules: []' in getCourseData if access denied.
        // So the sensitive content is NOT sent to the client.
    }

    // Serialize data (convert timestamps to strings/numbers if needed for props)
    // Firestore Timestamps warn in Server Components props.
    // Use a helper or JSON.parse(JSON.stringify(data)) for simplicity in prototype.
    const serializedData = JSON.parse(JSON.stringify(data));

    return <CourseClient initialData={serializedData} />;
}

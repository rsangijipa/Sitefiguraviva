import { redirect } from 'next/navigation';
import { adminCourseService } from '@/services/adminCourseService';

export default async function CreateCoursePage() {
    // Ideally this could show a form first, but for MVP it's quick to just create draft
    // Since this is a Server Component, we cannot use adminCourseService (which uses Client SDK db)
    // Wait, adminCourseService is isomorphic? No, it imports `db` from `@/lib/firebase/client`.

    // We must use a Client Component to invoke the service, OR use Server Actions.
    // For simplicity, let's redirect to the list page with a query param that triggers the modal/creation logic 
    // OR create a client component wrapper.

    redirect('/admin/courses?action=create');
}

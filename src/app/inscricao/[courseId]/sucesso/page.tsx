import { redirect } from 'next/navigation';

export default async function SuccessPage({ params, searchParams }: { params: Promise<{ courseId: string }>, searchParams: Promise<{ session_id: string }> }) {
    const { courseId } = await params;
    const { session_id } = await searchParams;

    if (!session_id) {
        redirect(`/inscricao/${courseId}`);
    }

    // Redirect back to the main inscription page, which handles the "Pending" / "Active" state UI based on enrollment status.
    // This simplifies the logic by keeping state management in one place (EnrollmentStepper).
    redirect(`/inscricao/${courseId}?success=true`);
}

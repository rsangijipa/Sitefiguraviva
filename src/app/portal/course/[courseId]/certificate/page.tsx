import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { assertCanAccessCourse } from '@/lib/auth/access-gate';
import { issueCertificate } from '@/app/actions/certificate';
import { CertificateTemplate } from '@/components/certificates/CertificateTemplate';
import { PrintButton } from './PrintButton';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ courseId: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
    const { courseId } = await params;

    // 1. Auth & Access Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    let uid;
    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        uid = claims.uid;
    } catch {
        redirect('/login');
    }

    try {
        await assertCanAccessCourse(uid, courseId);
    } catch {
        redirect('/portal');
    }

    // 2. Check Enrollment Progress (Fast Fail)
    const enrollmentDoc = await db.collection('enrollments').doc(`${uid}_${courseId}`).get();
    if (!enrollmentDoc.exists) notFound();

    const enrollment = enrollmentDoc.data();
    const percent = enrollment?.progressSummary?.percent || 0;

    if (percent < 100) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="max-w-md">
                    <h1 className="text-2xl font-bold mb-4">Certificado Indisponível</h1>
                    <p className="mb-6 text-gray-600">
                        Você concluiu {percent}% do curso. O certificado só é liberado após 100% de conclusão.
                    </p>
                    <Link
                        href={`/portal/course/${courseId}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Continuar Curso
                    </Link>
                </div>
            </div>
        );
    }

    // 3. Auto-Issue / Fetch Certificate
    // We call the server action which is idempotent. It will either create or return existing.
    const result = await issueCertificate(courseId);

    if (!result.success || !result.verificationCode) {
        return (
            <div className="p-8 text-center text-red-600">
                Erro ao gerar certificado. Por favor, contate o suporte. <br />
                <small>{result.error}</small>
            </div>
        );
    }

    // 4. Prepare Data for Template
    // We fetch user name and course title from the result or snapshot
    // Since issueCertificate returns limited data, we might need a fetch or just trust it.
    // Ideally issueCertificate returns everything we need or we fetch the cert doc now?
    // Let's fetch the cert doc using the ID returned to be sure we have canonical data.

    const certDoc = await db.collection('certificates').doc(result.certificateId!).get();
    const certData = certDoc.data();

    if (!certData) return <div>Erro ao carregar dados do certificado.</div>;

    const issuedAtDate = certData.issuedAt?.toDate().toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // Build full verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://figura-viva.com'}/certificates/verify/${certData.code}`;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Toolbar - Hidden in Print */}
            <div className="bg-white border-b p-4 shadow-sm flex justify-between items-center no-print sticky top-0 z-10">
                <div className="font-semibold text-gray-700">
                    Certificado: {certData.courseTitle}
                </div>
                <div className="space-x-4">
                    <Link
                        href={`/portal/course/${courseId}`}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Voltar
                    </Link>
                    <button
                    // @ts-ignore - onclick is valid in inline JSX for simple print trigger if we use client component or script
                    // Since this is a server component, we need a client wrapper for the button or just a simple script.
                    // Let's use a form action or a client component for the button? 
                    // Actually, a simple <a> with onclick or script is fine for this MVP.
                    // But React Server Components don't support inline event handlers.
                    // We will render a small Client Component for the "Print" button.
                    >
                        {/* We will add a client component for the print button below */}
                    </button>
                    {/* Temporary simple script approach for MVP */}
                    <span className="hidden">Use Ctrl+P</span>
                </div>
            </div>

            {/* Print Button Client Component Injection */}
            <div className="no-print p-4 flex justify-end">
                <PrintButton />
            </div>

            {/* Certificate Area */}
            <div className="flex-grow flex justify-center items-center p-8 overflow-auto">
                <div className="shadow-2xl">
                    <CertificateTemplate
                        studentName={certData.userName}
                        courseName={certData.courseTitle}
                        completionDate={issuedAtDate}
                        certificateNumber={certData.code}
                        verificationUrl={verificationUrl}
                        workloadHours={certData.courseSnapshot?.totalLessonsConsidered ? Math.round(certData.courseSnapshot.totalLessonsConsidered * 0.5) : undefined}
                    />
                </div>
            </div>
        </div>
    );
}


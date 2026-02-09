import { auth, db } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { issueCertificate } from "@/app/actions/certificate";
import CertificateViewer from "@/components/certificates/CertificateViewer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { courseId } = await params;

  // 1. Auth & Access Check
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) redirect("/login");

  let uid;
  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    uid = claims.uid;
  } catch {
    redirect("/login");
  }

  try {
    await assertCanAccessCourse(uid, courseId);
  } catch {
    redirect("/portal");
  }

  // 2. Check Enrollment Progress (Fast Fail)
  const enrollmentDoc = await db
    .collection("enrollments")
    .doc(`${uid}_${courseId}`)
    .get();
  if (!enrollmentDoc.exists) notFound();

  const enrollment = enrollmentDoc.data();
  const percent = enrollment?.progressSummary?.percent || 0;

  if (percent < 100) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Certificado Indisponível</h1>
          <p className="mb-6 text-gray-600">
            Você concluiu {percent}% do curso. O certificado só é liberado após
            100% de conclusão.
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

  if (!result.success || !result.certificateId) {
    return (
      <div className="p-8 text-center text-red-600">
        Erro ao gerar certificado. Por favor, contate o suporte. <br />
        <small>{result.error}</small>
      </div>
    );
  }

  // 4. Render Viewer
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="font-semibold text-gray-700">
          Certificado de Conclusão
        </div>
        <div className="space-x-4">
          <Link
            href={`/portal/course/${courseId}`}
            className="text-gray-600 hover:text-gray-900"
          >
            Voltar para o curso
          </Link>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-grow p-8 max-w-5xl mx-auto w-full">
        <CertificateViewer certificateId={result.certificateId} />
      </div>
    </div>
  );
}

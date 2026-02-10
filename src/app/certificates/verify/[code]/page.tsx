import { db } from "@/lib/firebase/admin";
import { VerificationBadge } from "@/components/certificate/VerificationBadge";
import Link from "next/link";

// Force dynamic to ensure we always fetch fresh data
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return {
    title: `Verificação de Certificado: ${code} | Instituto Figura Viva`,
    description:
      "Valide a autenticidade deste certificado emitido pelo Instituto Figura Viva.",
  };
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { code } = await params;

  // 1. Query by 'code'
  const snapshot = await db
    .collection("certificates")
    .where("code", "==", code)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <VerificationBadge
          status="error"
          error={`O certificado com código "${code}" não foi encontrado em nossos registros.`}
        />
      </div>
    );
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  // Serialize Dates safely
  let issuedAtIso = new Date().toISOString();
  if (data.issuedAt) {
    if (typeof data.issuedAt.toDate === "function") {
      issuedAtIso = data.issuedAt.toDate().toISOString();
    } else {
      issuedAtIso = new Date(data.issuedAt).toISOString();
    }
  }

  const badgeData = {
    studentName: data.userName || data.studentName || "Nome não Informado",
    courseTitle: data.courseTitle || "Curso não Identificado",
    code: data.code || code,
    issuedAt: issuedAtIso,
    hours: data.metadata?.hours || data.hours || 0,
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 selection:bg-gold/20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block transition-transform hover:scale-105"
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto border border-stone-100">
              <span className="font-serif font-bold text-2xl text-primary">
                FV
              </span>
            </div>
          </Link>
        </div>

        <VerificationBadge status="success" data={badgeData} />

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-stone-400 space-x-4">
          <Link
            href="/portal/courses"
            className="hover:text-primary transition-colors"
          >
            Nossos Cursos
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}

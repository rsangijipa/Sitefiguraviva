import { getCertificate } from "@/actions/certificate";
import CertificateViewer from "@/components/certificates/CertificateViewer";
import { ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";

interface CertificatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificatePage({
  params,
}: CertificatePageProps) {
  const { id } = await params;

  // Validate certificate ID format
  if (!id || id.length < 10) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <CertificateNotFound
          title="ID Inválido"
          message="O ID do certificado fornecido não é válido."
        />
      </div>
    );
  }

  // Fetch certificate data server-side to validate it exists
  const result = await getCertificate(id);

  // If certificate doesn't exist, show friendly error
  if (result.error || !result.certificate) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <CertificateNotFound
          title="Certificado Não Encontrado"
          message={
            result.error || "Este certificado não existe ou foi removido."
          }
        />
      </div>
    );
  }

  // Certificate exists - render the viewer
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <CertificateViewer certificateId={id} />
    </div>
  );
}

// Error UI Component
function CertificateNotFound({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>

        <h1 className="text-2xl font-bold font-serif text-stone-800 mb-3">
          {title}
        </h1>

        <p className="text-stone-600 mb-8">{message}</p>

        <div className="space-y-3">
          <Link
            href="/portal/certificates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Ver Meus Certificados
          </Link>

          <div className="text-sm text-stone-400">ou</div>

          <Link
            href="/portal"
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            <ExternalLink size={16} />
            Voltar ao Portal
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100">
          <p className="text-xs text-stone-400">
            Para questões sobre certificados, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}

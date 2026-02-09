import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { CertificateDoc } from "@/types/lms";
import { Metadata } from "next";
import { PrintCertificateButton } from "@/components/portal/PrintCertificateButton";
import Image from "next/image";

// Force dynamic since we read directly from DB on request
export const dynamic = "force-dynamic";

async function getCertificate(id: string) {
  const snap = await adminDb.collection("certificates").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as unknown as CertificateDoc;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cert = await getCertificate(id);
  return {
    title: cert
      ? `Certificado - ${cert.courseTitle}`
      : "Certificado não encontrado",
    description: cert
      ? `Certificado de conclusão de curso emitido para ${cert.userName}.`
      : "Certificado inválido.",
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getCertificate(id);

  if (!cert) return notFound();

  // Format Date safely on server
  let issueDate = "Data Inválida";
  if (cert.issuedAt) {
    const dateObj = (cert.issuedAt as any).toDate
      ? (cert.issuedAt as any).toDate()
      : new Date(cert.issuedAt as any);
    issueDate = dateObj.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 md:p-12 print:p-0 print:bg-white overflow-y-auto">
      {/* Container simulating A4 landscape */}
      <div className="bg-white w-full max-w-[1000px] aspect-[1.414] shadow-2xl relative border-[20px] border-paper print:shadow-none print:border-none print:w-full print:max-w-none print:m-0">
        {/* Main Frame - Triple Border */}
        <div className="absolute inset-4 border-[1px] border-primary/20 flex flex-col items-center justify-between p-12 md:p-20 text-center">
          <div className="absolute inset-1 border-[3px] border-gold/40 m-1" />

          {/* Logo & Header */}
          <div className="z-10 w-full flex flex-col items-center">
            <div className="relative w-24 h-24 mb-6">
              <Image
                src="/assets/logo.jpeg"
                alt="Logo Instituto"
                fill
                className="rounded-full object-cover grayscale opacity-80"
              />
            </div>
            <div className="text-xs font-bold tracking-[0.5em] uppercase text-stone-400 mb-2">
              Instituto Figura Viva
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight">
              Certificado
            </h1>
            <div className="text-sm font-serif italic text-gold mt-1 tracking-widest uppercase">
              de conclusão de curso
            </div>
          </div>

          {/* Content Body */}
          <div className="z-10 max-w-2xl mt-8">
            <p className="text-xl text-stone-500 font-serif italic mb-6">
              Pelo presente, certificamos que
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 font-serif mb-6 leading-tight">
              {cert.userName}
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              participou e concluiu com êxito todas as etapas do curso <br />
              <span className="text-primary font-bold text-2xl mt-2 block tracking-tight uppercase">
                {cert.courseTitle}
              </span>
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-stone-400">
              <div className="h-px w-8 bg-stone-200" />
              <span className="text-sm font-medium">
                Edição Acadêmica {cert.courseVersionAtCompletion || 1}
              </span>
              <div className="h-px w-8 bg-stone-200" />
            </div>
          </div>

          {/* Verification & Signatures */}
          <div className="z-10 w-full grid grid-cols-3 items-end mt-12">
            {/* QR/Code Meta */}
            <div className="text-left space-y-2">
              <div className="text-[10px] text-stone-400 font-mono leading-tight">
                <span className="block font-bold">AUTENTICIDADE</span>
                Código: {cert.code}
                <br />
                ID: {cert.id.slice(0, 12)}...
              </div>
            </div>

            {/* Date */}
            <div className="text-center">
              <div className="text-sm font-serif font-bold text-stone-800">
                {issueDate}
              </div>
              <div className="text-[9px] text-stone-400 uppercase tracking-widest mt-1">
                Data de Emissão
              </div>
            </div>

            {/* Signature */}
            <div className="text-right">
              <div className="inline-block text-center">
                <div className="font-serif italic text-primary text-xl mb-1">
                  Lilian Gusmão
                </div>
                <div className="h-px w-40 bg-stone-300 mx-auto" />
                <div className="text-[9px] text-stone-400 uppercase tracking-widest mt-1">
                  Diretoria Figura Viva
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Watermark Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none -rotate-12 z-0">
            <span className="text-[300px] font-serif font-bold select-none text-primary">
              FV
            </span>
          </div>
        </div>

        {/* Outer Corner Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-[1px] border-l-[1px] border-gold/30 print:hidden" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-[1px] border-r-[1px] border-gold/30 print:hidden" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[1px] border-l-[1px] border-gold/30 print:hidden" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[1px] border-r-[1px] border-gold/30 print:hidden" />
      </div>

      {/* Floating Actions (Screen Only) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden z-50">
        <PrintCertificateButton />
        <button
          onClick={() => history.back()}
          className="bg-white/80 backdrop-blur-sm text-stone-500 hover:text-stone-800 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all"
        >
          Voltar ao Portal
        </button>
      </div>
    </div>
  );
}

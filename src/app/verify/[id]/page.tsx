import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Force dynamic because we are reading from DB
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>; // In Next.js 15, params are promises
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { id: code } = await params;

  // Fetch from certificatePublic
  const docSnap = await adminDb.collection("certificatePublic").doc(code).get();

  if (!docSnap.exists) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
        <XCircle className="text-red-500 w-20 h-20 mb-6" />
        <h1 className="font-serif text-3xl text-primary mb-4">
          Certificado Não Encontrado
        </h1>
        <p className="text-stone-600 mb-8 max-w-md">
          O código <strong>{code}</strong> não corresponde a nenhum certificado
          válido em nossos registros.
        </p>
        <Link href="/">
          <Button>Voltar ao Início</Button>
        </Link>
      </div>
    );
  }

  const data = docSnap.data();
  const issuedDate = data?.issuedAt?.toDate().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
      <div className="bg-white p-10 md:p-16 rounded-2xl shadow-xl border border-stone-100 max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <CheckCircle2 className="text-green-600 w-20 h-20" />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-2">
          Certificado Válido
        </h1>
        <p className="text-gold font-bold tracking-widest uppercase text-xs mb-10">
          Instituto Figura Viva
        </p>

        <div className="space-y-6 text-left border-t border-b border-stone-100 py-8 mb-8">
          <div>
            <span className="block text-xs uppercase text-stone-400 font-bold tracking-wider mb-1">
              Aluno(a)
            </span>
            <p className="text-xl md:text-2xl font-serif text-primary">
              {data?.userName}
            </p>
          </div>

          <div>
            <span className="block text-xs uppercase text-stone-400 font-bold tracking-wider mb-1">
              Curso
            </span>
            <p className="text-lg text-primary">{data?.courseTitle}</p>
          </div>

          <div className="flex gap-12">
            <div>
              <span className="block text-xs uppercase text-stone-400 font-bold tracking-wider mb-1">
                Emissão
              </span>
              <p className="text-stone-600">{issuedDate}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-stone-400 font-bold tracking-wider mb-1">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Autêntico
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-8">
          Código de Verificação: {code}
        </p>

        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline">Conheça o Instituto</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

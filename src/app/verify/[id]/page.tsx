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
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-6 text-center">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-soft-xl border border-primary/5 max-w-2xl w-full relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-gold to-primary opacity-30" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="flex justify-center mb-10 relative">
          <div className="bg-primary/5 p-4 rounded-full relative">
            <CheckCircle2 className="text-primary w-16 h-16" />
            <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1 border-2 border-white">
              <div className="w-2 h-2 rounded-full bg-white opacity-80" />
            </div>
          </div>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-2 font-bold tracking-tight">
          Certificado Autêntico
        </h1>
        <p className="text-gold font-bold tracking-[0.2em] uppercase text-[10px] mb-12">
          Instituto Figura Viva • Integridade Acadêmica
        </p>

        <div className="space-y-8 text-left border-y border-primary/5 py-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="block text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-2">
                Titular do Certificado
              </span>
              <p className="text-xl font-serif text-primary font-bold">
                {data?.userName}
              </p>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-2">
                Conclusão do Programa
              </span>
              <p className="text-lg text-stone-800 font-medium">
                {data?.courseTitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <span className="block text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-2">
                Data de Emissão
              </span>
              <p className="text-stone-600 font-medium">{issuedDate}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-2">
                Selo de Validação
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Validado via SSoT
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="px-4 py-2 bg-stone-50 rounded-lg border border-stone-100 font-mono text-[10px] text-stone-400">
            Código Público:{" "}
            <span className="font-bold text-stone-700">{code}</span>
          </div>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto px-10">
              Conhecer o Instituto
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-stone-400 font-bold tracking-widest uppercase opacity-50">
        © 2024 Figura Viva • Segurança e Transparência
      </p>
    </div>
  );
}

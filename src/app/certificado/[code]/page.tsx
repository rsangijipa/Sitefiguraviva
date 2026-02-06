import { db } from '@/lib/firebase/admin';
import { Certificate } from '@/types/certificate';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ code: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CertificateValidationPage({ params }: Props) {
    const { code } = await params;

    // Case-insensitive lookup (store as uppercase usually, but let's be safe)
    const certsQuery = await db.collection('certificates')
        .where('code', '==', code.toUpperCase())
        .limit(1)
        .get();

    if (certsQuery.empty) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-stone-800 mb-2">Certificado Inválido</h1>
                    <p className="text-stone-500 mb-6">O código <strong>{code}</strong> não foi encontrado em nossa base de registros.</p>
                    <Link href="/" className="text-primary hover:underline font-bold text-sm">Voltar ao Início</Link>
                </div>
            </div>
        );
    }

    const certDoc = certsQuery.docs[0];
    const cert = certDoc.data() as Certificate;
    const issuedDate = cert.issuedAt ? new Date((cert.issuedAt as any)._seconds * 1000).toLocaleDateString('pt-BR') : 'Data desconhecida';

    return (
        <div className="min-h-screen bg-[#FDFCF9] flex flex-col">
            <header className="py-6 border-b border-stone-100 bg-white">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="font-serif text-xl text-primary font-bold">Figura <span className="text-amber-500 italic">Viva</span></div>
                    </Link>
                    <div className="text-xs uppercase tracking-widest font-bold text-stone-400">Validação Pública</div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-amber-100 max-w-2xl w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 to-amber-500" />

                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle size={40} />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 mb-2">Certificado Válido</h1>
                    <p className="text-stone-500 mb-8">Este documento foi emitido oficialmente pelo Instituto Figura Viva.</p>

                    <div className="bg-stone-50 rounded-xl p-8 border border-stone-100 mb-8 text-left space-y-4">
                        <div>
                            <span className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Aluno(a)</span>
                            <span className="text-xl font-bold text-stone-800">{cert.userName}</span>
                        </div>
                        <div>
                            <span className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Curso</span>
                            <span className="text-xl font-bold text-primary">{cert.courseTitle}</span>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Data de Emissão</span>
                                <span className="font-medium text-stone-700">{issuedDate}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Código</span>
                                <span className="font-mono bg-stone-200 px-2 py-1 rounded text-stone-600 text-sm">{cert.code}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                        O Instituto Figura Viva certifica que o aluno acima cumpriu todos os requisitos acadêmicos deste curso.
                    </p>
                </div>
            </main>
        </div>
    );
}

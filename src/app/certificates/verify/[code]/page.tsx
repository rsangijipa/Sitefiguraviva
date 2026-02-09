import { db } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Force dynamic to ensure we always fetch fresh data
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ code: string }>;
}

export default async function CertificateVerifyPage({ params }: PageProps) {
    const { code } = await params;

    // 1. Query by 'code'
    const snapshot = await db.collection('certificates')
        .where('code', '==', code)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border-t-4 border-red-500">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Certificado Não Encontrado</h1>
                    <p className="text-gray-600 mb-6">O código <strong>{code}</strong> não corresponde a nenhum certificado válido em nosso sistema.</p>
                    <Link href="/" className="text-blue-600 hover:underline">Voltar ao Início</Link>
                </div>
            </div>
        );
    }

    const certData = snapshot.docs[0].data();
    const issuedDate = certData.issuedAt?.toDate().toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center border-t-4 border-green-500">
                <div className="mb-4 text-green-500">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-1">Certificado Válido</h1>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-6">Código: {code}</p>

                <div className="space-y-4 text-left bg-gray-50 p-4 rounded border border-gray-100">
                    <div>
                        <span className="block text-xs text-gray-400 uppercase">Aluno(a)</span>
                        <span className="block text-lg font-medium text-gray-900">{certData.userName || 'Nome não registrado'}</span>
                    </div>

                    <div>
                        <span className="block text-xs text-gray-400 uppercase">Curso</span>
                        <span className="block text-lg font-medium text-gray-900">{certData.courseTitle || 'Curso não identificado'}</span>
                    </div>

                    <div>
                        <span className="block text-xs text-gray-400 uppercase">Data de Emissão</span>
                        <span className="block text-lg font-medium text-gray-900">{issuedDate}</span>
                    </div>

                    {certData.courseSnapshot?.totalLessonsConsidered && (
                        <div>
                            <span className="block text-xs text-gray-400 uppercase">Carga Horária (Aulas)</span>
                            <span className="block text-md text-gray-700">{certData.courseSnapshot.totalLessonsConsidered} aulas concluídas</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-xs text-gray-400">
                    Certificado emitido e validado digitalmente pelo Instituto Figura Viva.
                </div>
            </div>
        </div>
    );
}

import { adminDb } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';
import { CertificateDoc } from '@/types/lms';
import { Metadata } from 'next';
import { PrintCertificateButton } from '@/components/portal/PrintCertificateButton';

// Force dynamic since we read directly from DB on request
export const dynamic = 'force-dynamic';

async function getCertificate(id: string) {
    const snap = await adminDb.collection('certificates').doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as unknown as CertificateDoc;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const cert = await getCertificate(id);
    return {
        title: cert ? `Certificado - ${cert.courseTitle}` : 'Certificado não encontrado',
        description: cert ? `Certificado de conclusão de curso emitido para ${cert.userName}.` : 'Certificado inválido.',
    };
}

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cert = await getCertificate(id);

    if (!cert) return notFound();

    // Format Date safely on server
    let issueDate = 'Data Inválida';
    if (cert.issuedAt) {
        // Handle Firestore Timestamp or Date object
        const dateObj = (cert.issuedAt as any).toDate ? (cert.issuedAt as any).toDate() : new Date(cert.issuedAt as any);
        issueDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 print:p-0 print:bg-white">
            <div className="bg-white w-full max-w-[800px] aspect-[1.414] shadow-2xl p-12 relative border-8 border-double border-stone-200 print:shadow-none print:border-none print:w-full print:max-w-none">

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
                    {/* Placeholder for watermark */}
                    <span className="text-[200px] font-serif font-bold rotate-[-15deg] select-none">FV</span>
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-8">

                    <div className="space-y-2">
                        <div className="text-xs font-bold tracking-[0.3em] uppercase text-stone-400">Instituto Figura Viva</div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary">Certificado de Conclusão</h1>
                    </div>

                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />

                    <div className="space-y-4 max-w-2xl">
                        <p className="text-lg md:text-xl text-stone-600 font-serif italic">Certificamos que</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 font-serif">{cert.userName}</h2>
                        <p className="text-lg md:text-xl text-stone-600">
                            concluiu com êxito o curso <br />
                            <strong className="text-primary font-bold">{cert.courseTitle}</strong>
                        </p>
                        <p className="text-stone-500">
                            com carga horária de {cert.metadata?.hours || 10} horas.
                        </p>
                    </div>

                    <div className="mt-12 flex items-end justify-between w-full max-w-2xl pt-12">
                        <div className="text-center">
                            <div className="text-sm font-bold text-stone-800">
                                {issueDate}
                            </div>
                            <div className="border-t border-stone-300 mt-2 pt-1 text-xs text-stone-400 uppercase tracking-widest">Data de Emissão</div>
                        </div>

                        {/* Signature Placeholder */}
                        <div className="text-center">
                            <div className="font-serif font-bold text-xl text-primary italic mb-2">Alessandra</div>
                            <div className="h-px w-48 bg-stone-300"></div>
                            <div className="mt-2 text-xs text-stone-400 uppercase tracking-widest">Diretoria Acadêmica</div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 text-[10px] text-stone-300 font-mono text-right">
                        Código de Verificação: <strong>{cert.code}</strong><br />
                        ID: {cert.id}
                    </div>

                </div>
            </div>

            {/* Print Button (Screen Only) */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <PrintCertificateButton />
            </div>
        </div>
    );
}

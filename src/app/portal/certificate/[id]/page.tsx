import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { CertificateDoc } from '@/types/lms';
import { Metadata } from 'next';

// Force dynamic since we read directly from DB on request (or could be static with revalidation)
export const dynamic = 'force-dynamic';

async function getCertificate(id: string) {
    const snap = await getDoc(doc(db, 'certificates', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as unknown as CertificateDoc;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const cert = await getCertificate(id);
    return {
        title: cert ? `Certificado - ${cert.courseTitle}` : 'Certificado não encontrado',
    };
}

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cert = await getCertificate(id);

    if (!cert) return notFound();

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 print:p-0 print:bg-white">
            <div className="bg-white w-full max-w-[800px] aspect-[1.414] shadow-2xl p-12 relative border-8 border-double border-stone-200 print:shadow-none print:border-none print:w-full print:max-w-none">

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
                    {/* Placeholder for watermark */}
                    <span className="text-[200px] font-serif font-bold rotate-[-15deg]">FV</span>
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
                                {cert.issuedAt?.toDate ? cert.issuedAt.toDate().toLocaleDateString('pt-BR') : 'Data Inválida'}
                            </div>
                            <div className="border-t border-stone-300 mt-2 pt-1 text-xs text-stone-400 uppercase tracking-widest">Data de Emissão</div>
                        </div>

                        {/* Signature Placeholder */}
                        <div className="text-center">
                            <div className="font-serif font-bold text-xl text-primary italic mb-2">Director Name</div>
                            <div className="h-px w-48 bg-stone-300"></div>
                            <div className="mt-2 text-xs text-stone-400 uppercase tracking-widest">Diretoria Acadêmica</div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 text-[10px] text-stone-300 font-mono">
                        Código de Verificação: {cert.code}<br />
                        ID: {cert.id}
                    </div>

                </div>
            </div>

            {/* Print Button (Screen Only) */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <button
                    onClick={() => { }} // Can't add onclick to server component directly easily without client wrapper, but standard browser print works.
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    title="Imprimir (Ctrl+P)"
                >
                    <span className="font-bold">IMPRIMIR / PDF</span>
                </button>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    button {
                        cursor: pointer;
                    }
                `}} />
            </div>
            <script dangerouslySetInnerHTML={{
                __html: `
                document.querySelector('button').onclick = () => window.print();
            `}} />
        </div>
    );
}

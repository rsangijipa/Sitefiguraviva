
import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Certificate } from '@/types/certificate';
import { Timestamp } from 'firebase-admin/firestore';
import Button from '@/components/ui/Button';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function CertificateView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    let uid;
    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        uid = claims.uid;
    } catch { redirect('/login'); }

    // Fetch Certificate
    const certDoc = await db.collection('certificates').doc(id).get();
    if (!certDoc.exists) redirect('/portal/certificates');

    const cert = { id: certDoc.id, ...certDoc.data() } as Certificate;

    // Security: Is Owner?
    if (cert.userId !== uid) {
        // Allow admin logic later, for now blocking
        redirect('/portal/certificates');
    }

    const dateObj = cert.issuedAt ? (cert.issuedAt instanceof Timestamp ? cert.issuedAt.toDate() : new Date(cert.issuedAt)) : new Date();

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col">
            {/* Toolbar (No Print) */}
            <div className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center print:hidden shadow-sm sticky top-0 z-50">
                <Link href="/portal/certificates" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 font-medium transition-colors">
                    <ArrowLeft size={18} />
                    <span>Voltar</span>
                </Link>
                <div className="flex gap-2">
                    <button
                        // Note: Browsers handle window.print() well, but need client component for onClick.
                        // Or we use CSS print trigger. For simple MVP, client wrapper needed again OR standard link.
                        // Since this is Server Component, we can't add onClick directly easily.
                        // Let's use a small script toggle in a Client Component or just a button style.
                        disabled
                        className="opacity-50 cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg font-bold"
                    >
                        <Printer size={16} />
                        Imprimir (Ctrl+P)
                    </button>
                </div>
            </div>

            {/* Certificate Canvas */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto print:p-0 print:block">
                <div className="bg-white w-[1123px] h-[794px] shadow-2xl relative flex flex-col items-center text-center p-20 print:shadow-none print:w-full print:h-full print:fixed print:top-0 print:left-0 border-[16px] border-double border-stone-800">

                    {/* Ornamental Corners (CSS Logic simplified) */}
                    <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-amber-600" />
                    <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-amber-600" />
                    <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-amber-600" />
                    <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-amber-600" />

                    {/* Logo */}
                    <div className="font-serif font-bold text-4xl text-stone-900 mb-12 tracking-widest uppercase">
                        Instituto Figura Viva
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                        <p className="text-xl text-stone-500 italic font-serif mb-4">Certificado de Conclusão</p>
                        <p className="text-lg text-stone-600 mb-8">Certificamos que</p>

                        <h1 className="text-5xl font-serif font-bold text-amber-600 mb-6 border-b-2 border-amber-100 pb-8 inline-block mx-auto min-w-[50%]">
                            {cert.studentName}
                        </h1>

                        <p className="text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto mb-12">
                            concluiu com êxito o curso <strong className="text-stone-900">{cert.courseTitle}</strong>,
                            com carga horária de <strong>{cert.workloadHours} horas</strong>, demonstrando domínio nas competências propostas.
                        </p>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="flex justify-between w-full max-w-3xl border-t border-stone-200 pt-8 mt-auto">
                        <div className="flex flex-col items-center">
                            <span className="font-dancingscript text-3xl text-stone-800 font-bold mb-2 pt-2">Gilberto C.</span>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest border-t border-stone-300 pt-2 w-40">Instrutor Responsável</span>
                        </div>

                        <div className="flex flex-col items-center">
                            {/* Validation QR Placeholder */}
                            <div className="w-16 h-16 bg-stone-100 mb-2 flex items-center justify-center">
                                <ShieldCheck size={32} className="text-stone-300" />
                            </div>
                            <span className="text-[10px] font-mono text-stone-400">COD: {cert.validationCode}</span>
                            <span className="text-[10px] text-stone-400 mt-1">Valide em figuraviva.com/verify</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="font-serif text-lg text-stone-800 font-bold mb-2">
                                {dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest border-t border-stone-300 pt-2 w-40">Data de Emissão</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

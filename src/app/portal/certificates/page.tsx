
import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Certificate } from '@/types/certificate';
import { CertificateCardWrapper } from '@/components/portal/certificates/CertificateCardWrapper'; // Client wrapper for clicks
import { Award } from 'lucide-react';

export default async function CertificatesPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch { redirect('/login'); }

    // Fetch Certificates (Removed orderBy to avoid index requirement)
    const certsSnap = await db.collection('certificates')
        .where('userId', '==', uid)
        .get();

    let certificates = certsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        issuedAt: doc.data().issuedAt
    } as Certificate));

    // Sort in memory (Newest first)
    certificates.sort((a, b) => {
        const tA = (a.issuedAt as any)?._seconds || 0;
        const tB = (b.issuedAt as any)?._seconds || 0;
        return tB - tA;
    });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Meus Certificados</h1>
                    <p className="text-stone-500">Reconhecimento oficial das suas conquistas no Instituto.</p>
                </div>
                <div className="hidden md:block p-3 bg-amber-50 text-amber-500 rounded-full border border-amber-100">
                    <Award size={32} />
                </div>
            </header>

            {certificates.length > 0 ? (
                <div className="grid gap-6">
                    {certificates.map(cert => (
                        <CertificateCardWrapper key={cert.id} certificate={cert} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                        <Award size={32} />
                    </div>
                    <h2 className="text-lg font-bold text-stone-700 mb-2">Nenhum certificado ainda</h2>
                    <p className="text-stone-500 max-w-sm mx-auto">
                        Complete 100% de um curso para desbloquear seu certificado oficial. Continue firme na jornada!
                    </p>
                </div>
            )}
        </div>
    );
}

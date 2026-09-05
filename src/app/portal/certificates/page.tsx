import { db } from "@/lib/firebase/admin";
import { Certificate } from "@/types/certificate";
import { CertificateCardWrapper } from "@/components/portal/certificates/CertificateCardWrapper"; // Client wrapper for clicks
import { EmptyState } from "@/components/ui/EmptyState";
import { Award } from "lucide-react";
import { requireSession } from "@/lib/auth/server";

export default async function CertificatesPage() {
  const session = await requireSession("/auth");
  const uid = session.uid;

  // Fetch Certificates (Removed orderBy to avoid index requirement)
  const certsSnap = await db
    .collection("certificates")
    .where("userId", "==", uid)
    .get();

  let certificates = certsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Serialize Timestamp to ISO string for Client Component
      issuedAt:
        data.issuedAt?.toDate().toISOString() || new Date().toISOString(),
    } as Certificate;
  });

  // Sort in memory (Newest first)
  certificates.sort((a, b) => {
    const dateA = new Date(a.issuedAt).getTime();
    const dateB = new Date(b.issuedAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
            Meus Certificados
          </h1>
          <p className="text-stone-500">
            Reconhecimento oficial das suas conquistas no Instituto.
          </p>
        </div>
        <div className="hidden md:block p-3 bg-amber-50 text-amber-500 rounded-full border border-amber-100">
          <Award size={32} />
        </div>
      </header>

      {certificates.length > 0 ? (
        <div className="grid gap-6">
          {certificates.map((cert) => (
            <CertificateCardWrapper key={cert.id} certificate={cert} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Award />}
          title="Nenhum certificado ainda"
          description="Complete 100% de um curso para desbloquear seu certificado oficial. Continue firme na jornada!"
        />
      )}
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import CertificateViewer from "@/components/certificates/CertificateViewer";

export default function CertificatePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <CertificateViewer certificateId={id} />
    </div>
  );
}

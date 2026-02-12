"use client";

import { Certificate } from "@/types/certificate";
import { Award, Download, Share2, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { Timestamp } from "firebase/firestore";

interface CertificateCardProps {
  certificate: Certificate;
  onView: () => void;
}

export const CertificateCard = ({
  certificate,
  onView,
}: CertificateCardProps) => {
  const date =
    typeof certificate.issuedAt === "string"
      ? new Date(certificate.issuedAt)
      : certificate.issuedAt instanceof Timestamp
        ? certificate.issuedAt.toDate()
        : new Date();

  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Visual Left (Gold side) */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 w-full md:w-32 flex items-center justify-center p-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Award size={100} />
        </div>
        <Award size={40} className="text-amber-600 relative z-10" />
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-800">
              {certificate.courseName}
            </h3>
            <p className="text-sm text-stone-500">
              Concluído por {certificate.studentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-stone-400 mt-2 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> {date.toLocaleDateString()}
          </span>
          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-500">
            {certificate.courseWorkload || 10}h
          </span>
          <span>COD: {certificate.certificateNumber}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-stone-50">
        <Button
          variant="primary"
          size="sm"
          className="w-full shadow-amber-500/10"
          rightIcon={<Download size={14} />}
          onClick={onView}
        >
          Baixar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-stone-400 hover:text-stone-600"
          rightIcon={<Share2 size={14} />}
        >
          Compartilhar
        </Button>
      </div>
    </div>
  );
};

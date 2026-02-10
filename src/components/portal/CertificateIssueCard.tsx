"use client";

import { useState } from "react";
import { issueCertificate } from "@/actions/certificate";
import { Loader2, Award, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Download } from "lucide-react";
import Link from "next/link";

interface CertificateIssueCardProps {
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  isCompleted: boolean;
  existingCertificate?: { id: string; code: string } | null;
}

export function CertificateIssueCard({
  courseId,
  courseTitle,
  progressPercent,
  isCompleted,
  existingCertificate,
}: CertificateIssueCardProps) {
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(!!existingCertificate);
  const [certId, setCertId] = useState(existingCertificate?.id);
  const router = useRouter();

  const handleIssue = async () => {
    setLoading(true);
    try {
      const res = await issueCertificate(courseId);
      if (res.success) {
        setIssued(true);
        setCertId(res.certificateId);
        router.refresh();
        // Optional: Toast success
      } else {
        alert(res.error || "Erro ao emitir");
      }
    } catch (err) {
      console.error(err);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (progressPercent < 100 && !isCompleted) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex items-center gap-4 opacity-75">
        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-400">
          <Award size={24} />
        </div>
        <div>
          <h3 className="font-bold text-stone-600">Certificado Indisponível</h3>
          <p className="text-sm text-stone-500">
            Complete 100% do curso para liberar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm transition-all",
        issued
          ? "bg-green-50 border-green-200"
          : "bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200",
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shrink-0",
          issued
            ? "bg-green-100 text-green-600"
            : "bg-amber-100 text-amber-600",
        )}
      >
        <Award size={32} />
      </div>

      <div className="flex-1 text-center md:text-left">
        <h3
          className={cn(
            "font-bold text-lg",
            issued ? "text-green-900" : "text-amber-900",
          )}
        >
          {issued ? "Certificado Emitido" : "Certificado de Conclusão"}
        </h3>
        <p
          className={cn(
            "text-sm",
            issued ? "text-green-800/80" : "text-amber-800/80",
          )}
        >
          {issued ? (
            "Seu certificado já está disponível para download e validação."
          ) : (
            <>
              Parabéns! Você concluiu <strong>{courseTitle}</strong> e seu
              certificado já pode ser emitido.
            </>
          )}
        </p>
      </div>

      {issued ? (
        <Link href={`/portal/course/${courseId}/certificate`} target="_blank">
          <Button className="bg-green-600 hover:bg-green-700 text-white border-none shadow-green-200">
            <Download className="mr-2" size={18} /> Ver / Imprimir
          </Button>
        </Link>
      ) : (
        <Button
          onClick={handleIssue}
          disabled={loading || issued}
          className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-amber-200"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Award className="mr-2" size={18} />
          )}
          Emitir Agora
        </Button>
      )}
    </div>
  );
}

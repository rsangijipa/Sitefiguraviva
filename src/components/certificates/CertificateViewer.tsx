"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { useToast } from "@/context/ToastContext";
import { getCertificate } from "@/actions/certificate";
import type { Certificate } from "@/types/analytics";
import { CertificateDocument } from "./CertificateTemplate";
import Button from "@/components/ui/Button";
import {
  Download,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "@/components/icons";

interface CertificateViewerProps {
  certificateId: string;
}

export default function CertificateViewer({
  certificateId,
}: CertificateViewerProps) {
  const { addToast } = useToast();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  const loadCertificate = async () => {
    setLoading(true);
    try {
      const result = await getCertificate(certificateId);

      if (result.error || !result.certificate) {
        addToast(result.error || "Certificado não encontrado", "error");
        return;
      }

      setCertificate(result.certificate);

      // Generate QR Code
      const qrData = await QRCode.toDataURL(result.certificate.validationUrl, {
        width: 200,
        margin: 1,
      });
      setQrCodeDataUrl(qrData);
    } catch (error) {
      console.error("Load Certificate Error:", error);
      addToast("Erro ao carregar certificado", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ExternalLink size={32} />
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">
          Certificado não encontrado
        </h3>
        <p className="text-stone-600">
          Este certificado não existe ou foi revogado.
        </p>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Certificate Info Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-serif text-stone-800 mb-2">
              Certificado Emitido
            </h2>
            <div className="space-y-2 text-stone-600">
              <div>
                <span className="font-bold text-stone-700">Aluno:</span>{" "}
                {certificate.studentName}
              </div>
              <div>
                <span className="font-bold text-stone-700">Curso:</span>{" "}
                {certificate.courseName}
              </div>
              <div>
                <span className="font-bold text-stone-700">Carga Horária:</span>{" "}
                {certificate.courseWorkload} horas
              </div>
              <div>
                <span className="font-bold text-stone-700">Concluído em:</span>{" "}
                {formatDate(certificate.completedAt)}
              </div>
              <div>
                <span className="font-bold text-stone-700">Emitido em:</span>{" "}
                {formatDate(certificate.issuedAt)}
              </div>
              <div>
                <span className="font-bold text-stone-700">
                  Número do Certificado:
                </span>{" "}
                <span className="font-mono text-primary">
                  {certificate.certificateNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-4">Ações</h3>
        <div className="flex flex-wrap gap-3">
          {/* Download PDF */}
          {qrCodeDataUrl && (
            <PDFDownloadLink
              document={
                <CertificateDocument
                  certificate={certificate}
                  qrCodeDataUrl={qrCodeDataUrl}
                />
              }
              fileName={`certificado-${certificate.certificateNumber}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button disabled={pdfLoading} className="gap-2">
                  {pdfLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Baixar Certificado PDF
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          )}

          {/* Verify Online */}
          <Button
            variant="outline"
            onClick={() => window.open(`/verify/${certificateId}`, "_blank")}
            className="gap-2"
          >
            <ExternalLink size={16} />
            Verificar Autenticidade
          </Button>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-4">
          QR Code para Verificação
        </h3>
        <div className="flex items-center gap-6">
          {qrCodeDataUrl && (
            <img
              src={qrCodeDataUrl}
              alt="QR Code"
              className="w-32 h-32 border-2 border-stone-200 rounded-lg"
            />
          )}
          <div className="text-sm text-stone-600">
            <p className="mb-2">
              Escaneie este QR Code para verificar a autenticidade do
              certificado online.
            </p>
            <p className="text-xs text-stone-500">
              URL:{" "}
              <span className="font-mono">{certificate.validationUrl}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

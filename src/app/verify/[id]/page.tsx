"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { verifyCertificate } from "@/actions/certificate";
import { CheckCircle, XCircle, Loader2 } from "@/components/icons";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;

  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (certificateId) {
      verify();
    }
  }, [certificateId]);

  const verify = async () => {
    setVerifying(true);
    try {
      const verificationResult = await verifyCertificate(certificateId);
      setResult(verificationResult);
    } catch (error) {
      console.error(error);
      setResult({
        valid: false,
        message: "Erro ao verificar certificado",
      });
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-12 shadow-lg text-center max-w-lg">
          <Loader2
            className="animate-spin text-primary mx-auto mb-4"
            size={48}
          />
          <h2 className="text-xl font-bold text-stone-800">
            Verificando Certificado...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 p-12 shadow-lg max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              backgroundColor: result?.valid ? "#DEF7EC" : "#FEE2E2",
            }}
          >
            {result?.valid ? (
              <CheckCircle className="text-green-600" size={48} />
            ) : (
              <XCircle className="text-red-600" size={48} />
            )}
          </div>
          <h1 className="text-3xl font-bold font-serif text-stone-800 mb-2">
            {result?.valid ? "Certificado Válido" : "Certificado Inválido"}
          </h1>
          <p className="text-stone-600">{result?.message}</p>
        </div>

        {/* Certificate Details */}
        {result?.valid && result?.certificate && (
          <div className="space-y-4 border-t border-stone-200 pt-6">
            <h2 className="font-bold text-stone-800 text-lg mb-4">
              Detalhes do Certificado
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Aluno
                </div>
                <div className="text-stone-800 font-medium">
                  {result.certificate.studentName}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Curso
                </div>
                <div className="text-stone-800 font-medium">
                  {result.certificate.courseName}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Carga Horária
                </div>
                <div className="text-stone-800 font-medium">
                  {result.certificate.workload} horas
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Data de Emissão
                </div>
                <div className="text-stone-800 font-medium">
                  {formatDate(result.certificate.issuedAt)}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Número do Certificado
                </div>
                <div className="text-primary font-mono font-bold text-lg">
                  {result.certificate.certificateNumber}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-200 text-center">
          <div className="text-sm text-stone-600 mb-2">Emitido por</div>
          <div className="font-bold text-primary text-lg">
            INSTITUTO FIGURA VIVA
          </div>
          <div className="text-xs text-stone-500 mt-2">
            CNPJ: 00.000.000/0001-00
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}

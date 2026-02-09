"use client";

import { useState } from "react";
import { issueCertificate } from "@/actions/certificate";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import { Award, Loader2, AlertCircle, CheckCircle } from "@/components/icons";

interface CertificateDebugProps {
  courseId: string;
  courseName: string;
}

export default function CertificateDebug({
  courseId,
  courseName,
}: CertificateDebugProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleIssueCertificate = async () => {
    if (!user) {
      addToast("Usuário não autenticado", "error");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await issueCertificate(user.uid, courseId);
      setResult(response);

      if (response.success) {
        addToast("Certificado emitido com sucesso!", "success");
      } else if (response.error) {
        addToast(response.error, "error");
      }
    } catch (error: any) {
      console.error("Certificate Issue Error:", error);
      setResult({ error: error.message });
      addToast("Erro ao emitir certificado", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Award className="text-primary" size={24} />
        <h3 className="font-bold text-stone-800">
          Debug: Emissão de Certificado
        </h3>
      </div>

      <div className="space-y-4">
        <div className="text-sm">
          <div className="text-stone-600 mb-2">
            <strong>Curso:</strong> {courseName}
          </div>
          <div className="text-stone-600">
            <strong>Aluno:</strong> {user?.email || "Não autenticado"}
          </div>
        </div>

        <Button
          onClick={handleIssueCertificate}
          disabled={loading || !user}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Emitindo Certificado...
            </>
          ) : (
            <>
              <Award size={16} />
              Emitir Certificado (DEBUG)
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="text-green-600 shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 shrink-0" size={20} />
              )}
              <div className="flex-1">
                <div className="font-bold text-sm mb-2">
                  {result.success ? "Sucesso!" : "Erro"}
                </div>

                {result.success && (
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>ID:</strong>{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs">
                        {result.certificateId}
                      </code>
                    </div>
                    <div>
                      <strong>Número:</strong>{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs">
                        {result.certificateNumber}
                      </code>
                    </div>
                    {result.message && (
                      <div className="text-green-700 mt-2">
                        {result.message}
                      </div>
                    )}
                  </div>
                )}

                {result.error && (
                  <div className="text-sm space-y-2">
                    <div className="text-red-700 font-medium">
                      {result.error}
                    </div>

                    {result.details && (
                      <div className="text-xs text-red-600 mt-2">
                        <strong>Detalhes:</strong> {result.details}
                      </div>
                    )}

                    {result.debug && (
                      <div className="mt-3 p-3 bg-white rounded border border-red-200">
                        <div className="text-xs font-mono text-stone-600">
                          <strong>Debug Info:</strong>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(result.debug, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-stone-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong>⚠️ Debug Mode:</strong> Este componente mostra informações
          detalhadas sobre a emissão de certificados. Verifique o console do
          navegador para logs adicionais.
        </div>
      </div>
    </div>
  );
}

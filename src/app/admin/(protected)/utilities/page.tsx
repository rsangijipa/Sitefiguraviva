"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import {
  generateTestCertificate,
  deleteTestCertificates,
} from "@/app/actions/admin/test-utils";
import { Award, Trash2, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminUtilitiesPage() {
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastCertificateId, setLastCertificateId] = useState<string | null>(
    null,
  );

  const handleGenerateTestCertificate = async () => {
    setLoading(true);
    try {
      const result = await generateTestCertificate();

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      addToast(result.message || "Certificado de teste criado!", "success");
      setLastCertificateId(result.certificateId || null);
    } catch (error) {
      console.error("Error:", error);
      addToast("Erro ao gerar certificado", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestCertificates = async () => {
    if (
      !confirm("Tem certeza que deseja deletar TODOS os certificados de teste?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteTestCertificates();

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      addToast(result.message || "Certificados removidos!", "success");
      setLastCertificateId(null);
    } catch (error) {
      console.error("Error:", error);
      addToast("Erro ao deletar certificados", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
    if (lastCertificateId) {
      router.push(`/portal/certificates/${lastCertificateId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
          Utilidades de Admin
        </h1>
        <p className="text-stone-500">
          Ferramentas para desenvolvimento e testes do sistema
        </p>
      </header>

      <div className="space-y-6">
        {/* Test Certificates */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-stone-800 mb-2">
                  Certificados de Teste
                </h2>
                <p className="text-stone-600 text-sm mb-4">
                  Gere certificados de teste para desenvolvimento e validação do
                  sistema. Estes certificados são marcados com flag{" "}
                  <code className="px-2 py-1 bg-stone-100 rounded text-xs">
                    isTest: true
                  </code>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGenerateTestCertificate}
                disabled={loading}
                leftIcon={<Award size={16} />}
              >
                {loading ? "Gerando..." : "Gerar Certificado de Teste"}
              </Button>

              <Button
                onClick={handleDeleteTestCertificates}
                disabled={loading}
                variant="outline"
                leftIcon={<Trash2 size={16} />}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Limpar Certificados de Teste
              </Button>
            </div>

            {lastCertificateId && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900 mb-1">
                      Certificado criado com sucesso!
                    </p>
                    <p className="text-xs text-green-700 mb-3 font-mono">
                      ID: {lastCertificateId}
                    </p>
                    <Button
                      size="sm"
                      onClick={handleViewCertificate}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      Visualizar Certificado
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900 text-sm mb-1">
                  Apenas para Desenvolvimento
                </h3>
                <p className="text-xs text-amber-700">
                  Estas ferramentas são exclusivas para administradores e devem
                  ser usadas apenas em ambiente de desenvolvimento ou testes.
                  Certificados de teste podem ser facilmente identificados e
                  removidos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

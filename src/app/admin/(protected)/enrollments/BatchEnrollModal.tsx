"use client";

import { useState } from "react";
import {
  X,
  Upload,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { batchEnrollUsers } from "@/app/actions/admin/enrollment";
import { useToast } from "@/context/ToastContext";

interface BatchEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: any[];
}

export default function BatchEnrollModal({
  isOpen,
  onClose,
  courses,
}: BatchEnrollModalProps) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emailList, setEmailList] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    failed: { email: string; error: string }[];
  } | null>(null);
  const { addToast } = useToast();

  const handleBatchProcess = async () => {
    if (!selectedCourse || !emailList) return;

    const emails = emailList
      .split(/[\n,;]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) {
      addToast("Nenhum e-mail válido encontrado.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await batchEnrollUsers(emails, selectedCourse);
      if (res.success && "failed" in res) {
        setResults({
          success: (res.success as string[]) || [],
          failed: (res.failed as { email: string; error: string }[]) || [],
        });
        addToast("Processamento de lote concluído.", "success");
      } else {
        addToast((res as any).error || "Erro ao processar lote.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Erro interno no processamento.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setResults(null);
    setEmailList("");
    setSelectedCourse("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="max-w-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-3xl font-serif text-primary mb-2">
                Matrícula em Lote
              </h3>
              <p className="text-stone-400 font-light">
                Inscreva vários alunos simultaneamente via lista de e-mails.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={24} className="text-stone-400" />
            </button>
          </div>

          {!results ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                  1. Selecionar Curso
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:border-gold transition-colors text-sm"
                >
                  <option value="">Escolha o curso de destino...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                  2. Lista de E-mails
                </label>
                <textarea
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  placeholder="email1@exemplo.com&#10;email2@exemplo.com&#10;email3@exemplo.com"
                  className="w-full h-48 bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:border-gold transition-colors text-sm font-mono"
                />
                <p className="text-[10px] text-stone-400 italic">
                  Dica: Separe os e-mails por linha, vírgula ou ponto-e-vírgula.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleBatchProcess}
                  disabled={!selectedCourse || !emailList || isProcessing}
                  className="w-full py-4 text-sm tracking-widest"
                  leftIcon={
                    isProcessing ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Users size={18} />
                    )
                  }
                >
                  {isProcessing ? "Processando..." : "Iniciar Matrículas"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 mb-2 font-bold text-xs uppercase tracking-widest">
                    <CheckCircle2 size={16} /> Sucesso
                  </div>
                  <span className="text-4xl font-serif text-green-700">
                    {results.success.length}
                  </span>
                </div>
                <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 mb-2 font-bold text-xs uppercase tracking-widest">
                    <AlertCircle size={16} /> Falhas
                  </div>
                  <span className="text-4xl font-serif text-red-700">
                    {results.failed.length}
                  </span>
                </div>
              </div>

              {results.failed.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                    Log de Erros
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {results.failed.map((f, i) => (
                      <div
                        key={i}
                        className="text-[11px] flex justify-between bg-red-50/50 p-2 rounded-lg"
                      >
                        <span className="font-mono text-red-700">
                          {f.email}
                        </span>
                        <span className="text-red-400 italic">{f.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={reset} variant="primary" className="w-full py-4">
                Concluído
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}

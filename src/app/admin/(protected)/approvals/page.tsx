"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  User,
  ShieldCheck,
  CreditCard,
  Info,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  approveEnrollment,
  rejectEnrollment,
  getPendingEnrollmentsAction,
} from "./actions";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminStates";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function ApprovalsPage() {
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getPendingEnrollmentsAction();
      if (result.success) setPendingEnrollments(result.enrollments);
      else setLoadError(result.error || "Não foi possível carregar aprovações.");
    } catch { setLoadError("Não foi possível carregar aprovações."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (enrollment: any) => {
    if (!confirm(`Confirmar aprovação para ${enrollment.uid}?`)) return;
    setProcessingId(enrollment.id);

    try {
      const result = await approveEnrollment(
        enrollment.id,
        enrollment.uid,
        enrollment.courseId,
      );

      if (result.success) {
        addToast("Aprovado com sucesso!", "success");
        await fetchPending();
      } else {
        addToast(result.error || "Erro ao aprovar.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Erro ao aprovar.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (enrollment: any) => {
    const reason = prompt("Motivo da rejeição (Obrigatório):");
    if (!reason) return;

    setProcessingId(enrollment.id);

    try {
      const result = await rejectEnrollment(
        enrollment.id,
        enrollment.uid,
        enrollment.courseId,
        reason,
      );

      if (result.success) {
        addToast("Matrícula rejeitada.", "info");
        await fetchPending();
      } else {
        addToast(result.error || "Erro ao rejeitar.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Erro ao rejeitar.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminPageShell title="Aprovações" description="Libere acessos pagos sem interromper o restante do painel." breadcrumbs={[{ label: "Aprovações" }]}>
      <div className="space-y-4">
        <p className="text-sm text-stone-500">
          {pendingEnrollments.length} matriculas pagas aguardando liberação.
        </p>

      {loading ? (
        <AdminLoadingState rows={4} />
      ) : loadError ? (
        <AdminErrorState title={loadError} retry={fetchPending} />
      ) : pendingEnrollments.length === 0 ? (
        <AdminEmptyState title="Tudo em dia" description="Nenhum aluno pago aguardando aprovação." />
      ) : (
        <div className="grid gap-6">
          {pendingEnrollments.map((en) => (
            <Card
              key={en.id}
              className="p-0 overflow-hidden border-l-4 border-l-gold"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Left: User & Course */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/5 p-2 rounded-full text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary leading-tight">
                        {en.uid}
                      </h3>
                      <p className="text-xs text-stone-400 font-mono">UID</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <p className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">
                      Curso Solicitado
                    </p>
                    <p className="font-serif text-primary text-lg">
                      {en.courseTitle || en.courseId}
                    </p>
                  </div>
                </div>

                {/* Right: Financial Context & Actions */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">
                        Pagamento
                      </p>
                      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-2 py-1 rounded w-fit">
                        <ShieldCheck size={14} />
                        <span className="text-xs">PENDENTE APROVAÇÃO</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <Button
                      variant="outline"
                      color="danger"
                      size="sm"
                      leftIcon={<X size={16} />}
                      onClick={() => handleReject(en)}
                      disabled={processingId === en.id}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={
                        processingId === en.id ? (
                          <Clock className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )
                      }
                      onClick={() => handleApprove(en)}
                      disabled={processingId === en.id}
                    >
                      {processingId === en.id
                        ? "Processando..."
                        : "Aprovar Acesso"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </AdminPageShell>
  );
}

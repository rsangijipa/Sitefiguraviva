"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Check,
  X,
  Clock,
  User,
  ExternalLink,
  ShieldCheck,
  Mail,
  Info,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { approveEnrollment, rejectEnrollment } from "./actions";

export default function ApprovalsPage() {
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Record<string, any>>({});
  const { addToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Fetch enrollments waiting manual admin approval.

  useEffect(() => {
    const q = query(
      collection(db, "enrollments"),
      where("status", "==", "pending_approval"),
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const enrollments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const readyToApprove = enrollments;

      // Fetch missing course details
      const newCourseIds = readyToApprove
        .map((e: any) => e.courseId)
        .filter((id) => !courses[id]);

      if (newCourseIds.length > 0) {
        const courseData: Record<string, any> = { ...courses };
        await Promise.all(
          newCourseIds.map(async (id) => {
            const snap = await getDoc(doc(db, "courses", id));
            if (snap.exists()) courseData[id] = snap.data();
          }),
        );
        setCourses(courseData);
      }

      setPendingEnrollments(readyToApprove);
      setLoading(false);
    });

    return () => unsub();
  }, [courses]);

  // Use server-side logic in client? computeAccessStatus is pure function, ok to use.
  // BUT we need to replicate the same update logic.

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
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-primary">Fila de Aprovação</h1>
        <p className="text-stone-500 font-light">
          {pendingEnrollments.length} matriculas pagas aguardando liberação.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Clock className="animate-spin text-stone-300" size={40} />
        </div>
      ) : pendingEnrollments.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <Check className="mx-auto mb-4 text-stone-300" size={48} />
          <h3 className="text-lg font-bold text-stone-500">Tudo em dia!</h3>
          <p className="text-stone-400">
            Nenhum aluno pago aguardando aprovação.
          </p>
        </div>
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
                      {courses[en.courseId]?.title || en.courseId}
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
                        <span className="text-xs">CONFIRMADO</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Sub: {en["stripe.subscriptionStatus"]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">
                        Detalhes
                      </p>
                      <p className="text-xs text-stone-500">
                        <CreditCard size={12} className="inline mr-1" />
                        Fatura: ...{en["stripe.latestInvoiceId"]?.slice(-6)}
                      </p>
                      {en.applicationId && (
                        <p className="text-xs text-stone-500 mt-1">
                          <Info size={12} className="inline mr-1" />
                          App ID: ...{en.applicationId.slice(0, 8)}
                        </p>
                      )}
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
  );
}

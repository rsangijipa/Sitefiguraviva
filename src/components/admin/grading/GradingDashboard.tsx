"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { getPendingSubmissions } from "@/actions/grading";
import type { StudentAnswer } from "@/types/assessment";
import Button from "@/components/ui/Button";
import {
  CheckCircle,
  Clock,
  User,
  Loader2,
  FileCheck,
  Search,
  ExternalLink,
} from "@/components/icons";

interface PendingSubmission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAtDate: string;
  answers: StudentAnswer[];
  score?: number;
  percentage?: number;
}

export default function GradingDashboard({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const { addToast } = useToast();

  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPendingSubmissions(courseId);

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      setSubmissions((result.submissions as any) || []);
    } catch (error) {
      console.error("Load Submissions Error:", error);
      addToast("Erro ao carregar submissões", "error");
    } finally {
      setLoading(false);
    }
  }, [courseId, addToast]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    return (
      sub.studentName?.toLowerCase().includes(term) ||
      sub.studentEmail?.toLowerCase().includes(term) ||
      sub.assessmentTitle?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-primary">
            Correção de Avaliações
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {submissions.length} submissão(ões) aguardando avaliação pedagógica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSubmissions}
            className="gap-2"
          >
            <Loader2 size={15} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {submissions.length > 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Filtrar por aluno, e-mail ou avaliação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">
            {searchTerm ? "Nenhuma submissão encontrada" : "Todas as avaliações foram corrigidas!"}
          </h3>
          <p className="text-stone-500 text-sm">
            {searchTerm
              ? "Tente ajustar o termo da busca."
              : "Não há provas dissertativas ou práticas pendentes de revisão no momento."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((submission) => (
            <article
              key={submission.id}
              onClick={() => router.push(`/admin/assessments/submissions/${submission.id}`)}
              className="group bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-gold/40 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                      Pendente de Correção
                    </span>
                  </div>
                  <h3 className="font-bold text-primary text-base truncate group-hover:text-gold transition-colors">
                    {submission.assessmentTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                    <div className="flex items-center gap-1">
                      <User size={13} className="text-stone-400" />
                      <span className="font-medium text-stone-700">{submission.studentName}</span>
                      <span className="text-stone-400">({submission.studentEmail})</span>
                    </div>
                    <div>•</div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-stone-400" />
                      <span>{formatDate(submission.submittedAtDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <Link
                  href={`/admin/assessments/submissions/${submission.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button size="sm" className="shadow-sm gap-1.5">
                    <FileCheck size={15} />
                    Corrigir
                    <ExternalLink size={13} className="opacity-70" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

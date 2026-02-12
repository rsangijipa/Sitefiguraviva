"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import {
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import {
  approveEnrollment,
  updateEnrollmentStatus,
  revokeAccess,
} from "@/app/actions/admin/enrollment";

interface EnrollmentCardProps {
  enrollment: any;
  course: any;
  userId: string;
}

export function EnrollmentCard({
  enrollment,
  course,
  userId,
}: EnrollmentCardProps) {
  const [progress, setProgress] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addToast } = useToast();

  // Fetch Progress realtime
  useEffect(() => {
    if (!enrollment.courseId || !userId) return;

    const unsub = onSnapshot(
      doc(db, "progress", `${userId}_${enrollment.courseId}`),
      (doc) => {
        if (doc.exists()) {
          setProgress(doc.data());
        } else {
          setProgress(null);
        }
      },
    );

    return () => unsub();
  }, [enrollment.courseId, userId]);

  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      const res = await approveEnrollment(userId, enrollment.courseId);
      if (res.success) addToast("Matrícula aprovada!", "success");
      else addToast(res.error || "Erro ao aprovar", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      const res = await updateEnrollmentStatus(
        userId,
        enrollment.courseId,
        "completed",
      );
      if (res.success) addToast("Matrícula marcada como concluída.", "success");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevoke = async () => {
    if (
      !confirm(
        `Tem certeza que deseja revogar o acesso de ${course?.title || "este curso"}?`,
      )
    )
      return;
    setIsUpdating(true);
    try {
      const res = await revokeAccess(userId, enrollment.courseId);
      if (res.success) addToast("Acesso revogado.", "success");
      else addToast(res.error || "Erro ao revogar", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const lastAccessDate = progress?.lastAccessedAt
    ?.toDate?.()
    ?.toLocaleDateString();

  const summary = enrollment.progressSummary || {};
  const percent = summary.percent || 0;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-600 border-green-100";
      case "pending_approval":
        return "bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse";
      case "completed":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "locked":
        return "bg-red-50 text-red-600 border-red-100";
      case "expired":
        return "bg-stone-50 text-stone-600 border-stone-100";
      default:
        return "bg-stone-50 text-stone-500 border-stone-100";
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-5 group hover:border-gold/30 transition-all shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
            {course?.image ? (
              <img src={course.image} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 capitalize text-lg">
                {course?.title?.[0] || "C"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-primary truncate text-lg">
              {course?.title || enrollment.courseId}
            </h4>
            <div className="flex items-center gap-3 mt-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusConfig(enrollment.status)}`}
              >
                {enrollment.status?.replace("_", " ")}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() ||
                  "Data N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {enrollment.status === "pending_approval" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleApprove}
              disabled={isUpdating}
              className="text-green-600 hover:bg-green-50"
              title="Aprovar Matrícula"
            >
              <ShieldCheck size={18} />
            </Button>
          )}
          {enrollment.status === "active" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleComplete}
              disabled={isUpdating}
              className="text-blue-600 hover:bg-blue-50"
              title="Marcar como Concluído"
            >
              <CheckCircle size={18} />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRevoke}
            disabled={isUpdating}
            className="text-stone-300 hover:text-red-600 hover:bg-red-50"
            title="Revogar Acesso"
          >
            <XCircle size={18} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
          <span>Progresso de Aprendizado</span>
          <span className="text-primary">{percent}%</span>
        </div>

        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-stone-50/50 rounded-2xl border border-stone-100/50">
            <div className="w-8 h-8 bg-white rounded-lg text-gold shadow-sm flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Aulas
              </span>
              <span className="text-xs font-bold text-stone-700">
                {summary.completedLessonsCount || 0} /{" "}
                {summary.totalLessons || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-stone-50/50 rounded-2xl border border-stone-100/50">
            <div className="w-8 h-8 bg-white rounded-lg text-primary/40 shadow-sm flex items-center justify-center">
              <Clock size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Acesso
              </span>
              <span className="text-xs font-bold text-stone-700">
                {lastAccessDate || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

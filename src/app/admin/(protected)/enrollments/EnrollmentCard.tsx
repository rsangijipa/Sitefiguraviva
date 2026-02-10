"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { Trash2, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";

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

  const handleRevoke = async () => {
    if (
      !confirm(
        `Tem certeza que deseja remover a matrícula de ${course?.title || "este curso"}?`,
      )
    )
      return;
    try {
      // Delete from root collection
      await deleteDoc(
        doc(db, "enrollments", `${userId}_${enrollment.courseId}`),
      );
      addToast("Matrícula removida.", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao remover matrícula.", "error");
    }
  };

  const lastAccessDate = progress?.lastAccessedAt
    ?.toDate?.()
    ?.toLocaleDateString();

  const summary = enrollment.progressSummary || {};
  const percent = summary.percent || 0;

  return (
    <Card className="p-4 flex flex-col gap-4 group hover:border-gold/30 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          {course?.image && (
            <img
              src={course.image}
              className="w-16 h-16 rounded-lg object-cover bg-stone-100"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-primary truncate">
              {course?.title || enrollment.courseId}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  enrollment.status === "active"
                    ? "bg-green-50 text-green-600 border-green-100"
                    : enrollment.status === "past_due"
                      ? "bg-red-50 text-red-500 border-red-100"
                      : "bg-stone-50 text-stone-500 border-stone-100"
                }`}
              >
                {enrollment.status}
              </span>
              <span>
                •{" "}
                {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() ||
                  "N/A"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleRevoke}
          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title="Revogar Acesso"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Progress Section (FIX: PRG-03 Audit) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <span>Progresso do Curso</span>
          <span className="text-primary">{percent}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="flex items-center gap-2 p-2 bg-stone-50/50 rounded-xl border border-stone-100/50">
            <div className="p-1 bg-white rounded-lg text-gold shadow-sm">
              <TrendingUp size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-stone-400">
                Aulas
              </span>
              <span className="text-[11px] font-bold text-stone-600">
                {summary.completedLessonsCount || 0} /{" "}
                {summary.totalLessons || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-stone-50/50 rounded-xl border border-stone-100/50">
            <div className="p-1 bg-white rounded-lg text-primary/60 shadow-sm">
              <Clock size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-stone-400">
                Último Acesso
              </span>
              <span className="text-[11px] font-bold text-stone-600">
                {lastAccessDate || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

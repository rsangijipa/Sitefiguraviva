"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ClipboardList, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyCourseGradesAction } from "@/app/actions/course-grades";
import {
  GRADE_STATUS_LABEL,
  type GradeReport,
  type GradeStatus,
} from "@/features/assessments/domain/grade-report";

const STATUS_STYLE: Record<GradeStatus, string> = {
  not_started: "bg-stone-100 text-stone-600",
  in_progress: "bg-blue-50 text-blue-800",
  awaiting_grading: "bg-amber-50 text-amber-900",
  passed: "bg-green-50 text-green-800",
  failed: "bg-red-50 text-red-800",
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(value))
    : null;

export function CourseGradesPanel({ courseId }: { courseId: string }) {
  const [report, setReport] = useState<GradeReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyCourseGradesAction(courseId).then((result) => {
      if (!active) return;
      if (result.success) setReport(result.data);
      else setError(result.message);
    });
    return () => {
      active = false;
    };
  }, [courseId]);

  if (error)
    return (
      <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        {error}
      </p>
    );
  if (!report)
    return (
      <p className="flex items-center gap-2 py-12 text-stone-500" role="status">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Carregando suas notas…
      </p>
    );
  if (report.rows.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center text-stone-500">
        <ClipboardList size={32} className="mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p>Este curso ainda não tem avaliações publicadas.</p>
      </div>
    );

  return (
    <div className="max-w-3xl space-y-6">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-100 bg-white p-4">
          <dt className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Avaliações obrigatórias
          </dt>
          <dd className="mt-1 font-serif text-2xl text-primary">
            {report.requiredPassed} de {report.requiredTotal} aprovadas
          </dd>
        </div>
        <div className="rounded-xl border border-stone-100 bg-white p-4">
          <dt className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Média das avaliações corrigidas
          </dt>
          <dd className="mt-1 font-serif text-2xl text-primary">
            {report.average === null ? "—" : `${report.average}%`}
          </dd>
        </div>
      </dl>

      <ul className="space-y-3">
        {report.rows.map((row) => {
          const date =
            formatDate(row.gradedAt) ?? formatDate(row.submittedAt);
          return (
            <li
              key={row.assessmentId}
              className="rounded-xl border border-stone-100 bg-white p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-stone-800">
                    {row.title}
                    {row.isRequired && (
                      <span className="ml-2 text-xs font-normal text-stone-500">
                        (obrigatória)
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Nota mínima: {row.passingScore}%
                    {row.attempts > 0 &&
                      ` · ${row.attempts} tentativa${row.attempts === 1 ? "" : "s"}`}
                    {date && ` · ${row.gradedAt ? "corrigida" : "enviada"} em ${date}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {row.percentage !== null && (
                    <span className="flex items-center gap-1 font-serif text-xl text-primary">
                      {row.status === "passed" && (
                        <Award size={18} aria-hidden="true" className="text-gold" />
                      )}
                      {row.percentage}%
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      STATUS_STYLE[row.status],
                    )}
                  >
                    {GRADE_STATUS_LABEL[row.status]}
                  </span>
                </div>
              </div>
              {row.feedback && (
                <blockquote className="mt-4 whitespace-pre-line border-l-2 border-gold/50 pl-3 text-sm text-stone-600">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">
                    Devolutiva
                  </span>
                  {row.feedback}
                </blockquote>
              )}
              {row.lessonId &&
                (row.status === "not_started" || row.status === "in_progress") && (
                  <Link
                    href={`/portal/course/${encodeURIComponent(courseId)}/lesson/${encodeURIComponent(row.lessonId)}`}
                    className="mt-4 inline-flex text-sm font-bold text-primary underline"
                  >
                    {row.status === "in_progress" ? "Continuar avaliação" : "Fazer avaliação"}
                  </Link>
                )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

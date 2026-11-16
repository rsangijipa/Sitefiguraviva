"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Download, Loader2, Minus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { getCourseCompletionReportAction } from "@/app/actions/admin/course-learning";
import {
  completionReportToCsv,
  type CompletionReport,
} from "@/features/courses/domain/completion-report";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(value))
    : "—";

export default function CourseCompletionTab({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const [report, setReport] = useState<CompletionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    getCourseCompletionReportAction(courseId).then((result) => {
      if (!active) return;
      if (result.success) setReport(result.data);
      else setError(result.message);
    });
    return () => {
      active = false;
    };
  }, [courseId]);

  const students = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (report?.students ?? []).filter(
      (s) =>
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term),
    );
  }, [report, query]);

  const downloadCsv = () => {
    if (!report) return;
    const blob = new Blob([completionReportToCsv(report)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conclusao-${courseTitle
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error)
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  if (!report)
    return (
      <div className="flex items-center gap-2 p-8 text-stone-500">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Montando o relatório de conclusão…
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-stone-500">
          {report.students.length} aluno(s) · {report.lessons.length} aula(s)
          publicada(s). Marcação = aula concluída.
        </p>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
            <Search size={16} aria-hidden="true" className="text-stone-400" />
            <span className="sr-only">Buscar aluno</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aluno"
              className="py-2 text-sm outline-none"
            />
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadCsv}
            disabled={report.students.length === 0}
            leftIcon={<Download size={16} aria-hidden="true" />}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {report.students.length === 0 ? (
        <p className="rounded-xl bg-stone-50 p-8 text-center text-sm text-stone-500">
          Nenhum aluno matriculado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-100 bg-white">
          <table className="min-w-full text-sm">
            <caption className="sr-only">
              Conclusão de aulas por aluno em {courseTitle}
            </caption>
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th scope="col" className="sticky left-0 bg-stone-50 px-4 py-3 text-left">
                  Aluno
                </th>
                <th scope="col" className="px-3 py-3 text-left">Progresso</th>
                <th scope="col" className="px-3 py-3 text-left whitespace-nowrap">
                  Última conclusão
                </th>
                {report.lessons.map((lesson, index) => (
                  <th
                    key={lesson.id}
                    scope="col"
                    title={`${lesson.moduleTitle} · ${lesson.title}`}
                    className="px-2 py-3 text-center font-mono"
                  >
                    <span aria-hidden="true">{index + 1}</span>
                    <span className="sr-only">{lesson.title}</span>
                    <span className="block text-[10px] font-normal text-stone-400">
                      {report.lessonRates[lesson.id]}%
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {students.map((student) => (
                <tr key={student.userId}>
                  <th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-stone-700">
                    {student.name}
                    <span className="block text-xs font-normal text-stone-400">
                      {student.email}
                    </span>
                  </th>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {student.completedCount}/{report.lessons.length} · {student.percent}%
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-stone-500">
                    {formatDate(student.lastCompletedAt)}
                  </td>
                  {report.lessons.map((lesson) => {
                    const done = student.completed.includes(lesson.id);
                    return (
                      <td key={lesson.id} className="px-2 py-3 text-center">
                        {done ? (
                          <Check size={16} className="mx-auto text-green-600" aria-label="Concluída" />
                        ) : (
                          <Minus size={16} className="mx-auto text-stone-300" aria-label="Não concluída" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.lessons.length > 0 && (
        <details className="text-sm text-stone-500">
          <summary className="cursor-pointer font-medium">Legenda das aulas</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            {report.lessons.map((lesson) => (
              <li key={lesson.id}>
                {lesson.moduleTitle} · {lesson.title}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

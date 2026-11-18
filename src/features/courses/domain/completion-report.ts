/**
 * Students × lessons completion matrix, modelled on Moodle's "Activity
 * completion" report. Pure so it can be unit tested and exported as CSV.
 */

export interface ReportModuleInput {
  id: string;
  title: string;
  order: number;
  isPublished: boolean;
}
export interface ReportLessonInput {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  isPublished: boolean;
}
export interface ReportStudentInput {
  userId: string;
  name: string;
  email: string;
  status: string;
}
export interface ReportProgressInput {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface CompletionReport {
  lessons: { id: string; title: string; moduleTitle: string }[];
  students: {
    userId: string;
    name: string;
    email: string;
    status: string;
    completed: string[];
    completedCount: number;
    percent: number;
    lastCompletedAt: string | null;
  }[];
  /** Share of students that completed each lesson (0–100), by lesson id. */
  lessonRates: Record<string, number>;
}

export function buildCompletionReport(input: {
  modules: ReportModuleInput[];
  lessons: ReportLessonInput[];
  students: ReportStudentInput[];
  progress: ReportProgressInput[];
}): CompletionReport {
  const modules = input.modules
    .filter((m) => m.isPublished)
    .sort((a, b) => a.order - b.order);
  const lessons = modules.flatMap((courseModule) =>
    input.lessons
      .filter((l) => l.moduleId === courseModule.id && l.isPublished)
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ id: l.id, title: l.title, moduleTitle: courseModule.title })),
  );
  const lessonIds = new Set(lessons.map((l) => l.id));

  const doneByUser = new Map<string, Map<string, string | null>>();
  for (const row of input.progress) {
    if (!row.completed || !lessonIds.has(row.lessonId)) continue;
    const done = doneByUser.get(row.userId) ?? new Map();
    done.set(row.lessonId, row.completedAt);
    doneByUser.set(row.userId, done);
  }

  const seen = new Set<string>();
  const students = input.students
    .filter((s) => (seen.has(s.userId) ? false : (seen.add(s.userId), true)))
    .map((student) => {
      const done = doneByUser.get(student.userId) ?? new Map();
      const completed = lessons.filter((l) => done.has(l.id)).map((l) => l.id);
      const dates = [...done.values()].filter((d): d is string => !!d).sort();
      return {
        ...student,
        completed,
        completedCount: completed.length,
        percent: lessons.length
          ? Math.round((completed.length / lessons.length) * 100)
          : 0,
        lastCompletedAt: dates.at(-1) ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const lessonRates = Object.fromEntries(
    lessons.map((l) => [
      l.id,
      students.length
        ? Math.round(
            (students.filter((s) => s.completed.includes(l.id)).length /
              students.length) *
              100,
          )
        : 0,
    ]),
  );

  return { lessons, students, lessonRates };
}

const csvCell = (value: string | number) => {
  const text = String(value);
  // Neutralise spreadsheet formulas and quote every cell.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** Semicolon-separated CSV (Excel pt-BR default), with a UTF-8 BOM. */
export function completionReportToCsv(report: CompletionReport): string {
  const header = [
    "Aluno",
    "E-mail",
    "Situação",
    "Concluídas",
    "Progresso (%)",
    ...report.lessons.map((l) => `${l.moduleTitle} · ${l.title}`),
  ];
  const rows = report.students.map((s) => [
    s.name,
    s.email,
    s.status,
    `${s.completedCount}/${report.lessons.length}`,
    s.percent,
    ...report.lessons.map((l) => (s.completed.includes(l.id) ? "Sim" : "Não")),
  ]);
  return (
    "﻿" +
    [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")
  );
}

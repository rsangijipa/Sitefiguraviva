import {
  buildCompletionReport,
  completionReportToCsv,
} from "../completion-report";

const input = {
  modules: [
    { id: "m2", title: "Módulo 2", order: 2, isPublished: true },
    { id: "m1", title: "Módulo 1", order: 1, isPublished: true },
    { id: "mx", title: "Rascunho", order: 3, isPublished: false },
  ],
  lessons: [
    { id: "b", moduleId: "m1", title: "Aula B", order: 2, isPublished: true },
    { id: "a", moduleId: "m1", title: "Aula A", order: 1, isPublished: true },
    { id: "c", moduleId: "m2", title: "Aula C", order: 1, isPublished: true },
    { id: "h", moduleId: "m2", title: "Oculta", order: 2, isPublished: false },
    { id: "x", moduleId: "mx", title: "Em rascunho", order: 1, isPublished: true },
  ],
  students: [
    { userId: "u2", name: "Bruna", email: "b@x.com", status: "active" },
    { userId: "u1", name: "Ana", email: "a@x.com", status: "active" },
    { userId: "u1", name: "Ana (duplicada)", email: "a@x.com", status: "active" },
  ],
  progress: [
    { userId: "u1", lessonId: "a", completed: true, completedAt: "2026-11-01T10:00:00Z" },
    { userId: "u1", lessonId: "c", completed: true, completedAt: "2026-11-03T10:00:00Z" },
    { userId: "u1", lessonId: "b", completed: false, completedAt: null },
    { userId: "u1", lessonId: "h", completed: true, completedAt: "2026-11-05T10:00:00Z" },
    { userId: "u2", lessonId: "a", completed: true, completedAt: "2026-11-02T10:00:00Z" },
  ],
};

it("orders published lessons by module and lesson order", () => {
  const report = buildCompletionReport(input);
  expect(report.lessons.map((l) => l.id)).toEqual(["a", "b", "c"]);
  expect(report.lessons[2].moduleTitle).toBe("Módulo 2");
});

it("computes each student's completion, ignoring unpublished lessons", () => {
  const report = buildCompletionReport(input);
  expect(report.students.map((s) => s.name)).toEqual(["Ana", "Bruna"]);
  const ana = report.students[0];
  expect(ana.completed).toEqual(["a", "c"]);
  expect(ana.percent).toBe(67);
  expect(ana.lastCompletedAt).toBe("2026-11-03T10:00:00Z");
  expect(report.lessonRates).toEqual({ a: 100, b: 0, c: 50 });
});

it("exports a semicolon CSV with a BOM and neutralised formulas", () => {
  const report = buildCompletionReport({
    ...input,
    students: [{ userId: "u1", name: "=HYPERLINK(\"x\")", email: "a@x.com", status: "active" }],
  });
  const csv = completionReportToCsv(report);
  expect(csv.startsWith("﻿")).toBe(true);
  const [header, row] = csv.slice(1).split("\r\n");
  expect(header).toContain('"Módulo 1 · Aula A"');
  expect(row.startsWith(`"'=HYPERLINK(""x"")"`)).toBe(true);
  expect(row).toContain('"2/3";"67";"Sim";"Não";"Sim"');
});

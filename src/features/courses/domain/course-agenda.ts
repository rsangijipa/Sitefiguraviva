import { z } from "zod";
const civilDate = z.string().refine(value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Informe uma data válida.");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido.");
const sessionSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().max(200),
  date: civilDate,
  startTime: time,
  endTime: time,
}).refine(value => value.endTime > value.startTime, { message: "O término deve ser posterior ao início do encontro.", path: ["endTime"] });
export const courseAgendaSchema = z.object({
  timezone: z.string().max(80).refine(value => {
    try { new Intl.DateTimeFormat("pt-BR", { timeZone: value }); return true; } catch { return false; }
  }, "Selecione um fuso horário válido."),
  modality: z.enum(["online", "presencial", "hibrido"]),
  startDate: z.union([civilDate, z.literal("")]),
  endDate: z.union([civilDate, z.literal("")]),
  sessions: z.array(sessionSchema).max(120),
}).superRefine((value, ctx) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "O fim do curso deve ser posterior ao início." });
  const ids = new Set<string>();
  value.sessions.forEach((session, index) => {
    if (ids.has(session.id)) ctx.addIssue({ code: "custom", path: ["sessions", index], message: "Há encontros com o mesmo identificador." });
    ids.add(session.id);
    if ((value.startDate && session.date < value.startDate) || (value.endDate && session.date > value.endDate)) ctx.addIssue({ code: "custom", path: ["sessions", index, "date"], message: "O encontro deve estar dentro do período do curso." });
    if (value.sessions.slice(0, index).some(other => other.date === session.date && other.startTime < session.endTime && session.startTime < other.endTime)) ctx.addIssue({ code: "custom", path: ["sessions", index], message: "Dois encontros estão no mesmo horário." });
  });
});
export type CourseAgenda = z.infer<typeof courseAgendaSchema>;
export type CourseSession = CourseAgenda["sessions"][number];
export const EMPTY_AGENDA: CourseAgenda = { timezone: "America/Sao_Paulo", modality: "online", startDate: "", endDate: "", sessions: [] };
export function readCourseAgenda(value: unknown): CourseAgenda | undefined {
  const result = courseAgendaSchema.safeParse(value);
  return result.success ? result.data : undefined;
}
export function formatAgendaDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value + "T12:00:00Z"));
}
export function formatCourseSession(session: CourseSession) {
  return `${formatAgendaDate(session.date)}, ${session.startTime}–${session.endTime}${session.title ? " — " + session.title : ""}`;
}
export function agendaSummary(agenda: CourseAgenda) {
  const dates = agenda.sessions.map(session => session.date).sort();
  const start = agenda.startDate || dates[0];
  const end = agenda.endDate || dates[dates.length - 1];
  return start ? formatAgendaDate(start) + (end && end !== start ? " a " + formatAgendaDate(end) : "") : "";
}
export function repeatCourseSession(first: CourseSession, count: number, interval: "weekly" | "fortnightly" | "monthly"): CourseSession[] {
  if (!sessionSchema.safeParse(first).success || !Number.isInteger(count) || count < 1 || count > 60) throw new Error("Preencha o primeiro encontro e escolha de 1 a 60 encontros.");
  const start = new Date(first.date + "T12:00:00Z");
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    if (interval === "monthly") {
      const day = date.getUTCDate();
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() + index);
      const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
      date.setUTCDate(Math.min(day, lastDay));
    } else date.setUTCDate(date.getUTCDate() + index * (interval === "weekly" ? 7 : 14));
    return { ...first, id: `${first.id}-${index}`, date: date.toISOString().slice(0, 10) };
  });
}

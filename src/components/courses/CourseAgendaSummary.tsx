import { readCourseAgenda, formatCourseSession } from "@/features/courses/domain/course-agenda";
export default function CourseAgendaSummary({ value }: { value: unknown }) {
  const agenda = readCourseAgenda(value);
  if (!agenda || !agenda.sessions.length) return null;
  const modality = { online: "On-line", presencial: "Presencial", hibrido: "Híbrido" }[agenda.modality];
  return <section className="rounded-2xl border border-border bg-paper p-5">
    <h2 className="mb-2 text-sm font-bold text-primary">Datas e horários dos encontros</h2>
    <p className="mb-4 text-sm text-muted">{modality} · Fuso: {agenda.timezone.replace("America/", "").replaceAll("_", " ")}</p>
    <ul className="space-y-3 text-sm text-text">{[...agenda.sessions].sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)).map(session => <li key={session.id}>{formatCourseSession(session)}</li>)}</ul>
  </section>;
}

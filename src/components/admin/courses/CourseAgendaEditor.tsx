"use client";
import { useId, useState } from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import { EMPTY_AGENDA, courseAgendaSchema, formatCourseSession, repeatCourseSession, type CourseAgenda, type CourseSession } from "@/features/courses/domain/course-agenda";
interface Props { value?: CourseAgenda; onChange: (value: CourseAgenda) => void; legacyDate?: string; legacyFrequency?: string; }
const field = "block w-full min-w-0 rounded-xl border border-border bg-paper p-3 text-base text-text";
export default function CourseAgendaEditor({ value, onChange, legacyDate, legacyFrequency }: Props) {
  const agenda = value || EMPTY_AGENDA;
  const prefix = useId();
  const [removed, setRemoved] = useState<CourseSession | null>(null);
  const [repeat, setRepeat] = useState<"weekly" | "fortnightly" | "monthly">("weekly");
  const [count, setCount] = useState(4);
  const [preview, setPreview] = useState<CourseSession[]>([]);
  const [error, setError] = useState("");
  const result = courseAgendaSchema.safeParse(agenda);
  const change = (patch: Partial<CourseAgenda>) => { setPreview([]); setError(""); onChange({ ...agenda, ...patch }); };
  const update = (id: string, patch: Partial<CourseSession>) => change({ sessions: agenda.sessions.map(item => item.id === id ? { ...item, ...patch } : item) });
  const append = () => change({ sessions: [...agenda.sessions, { id: crypto.randomUUID(), title: "", date: agenda.startDate, startTime: "", endTime: "" }] });
  const makePreview = () => {
    try { setPreview(repeatCourseSession(agenda.sessions[0], count, repeat)); setError(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Confira o primeiro encontro."); }
  };
  return <section className="min-w-0 space-y-5 rounded-2xl border border-border bg-paper p-4 sm:p-6" aria-labelledby={prefix}>
    <div><h2 id={prefix} className="font-serif text-2xl text-primary">Datas e horários</h2><p className="mt-1 text-sm text-muted">Organize o período e cada encontro. Os horários seguem o fuso escolhido abaixo.</p></div>
    {(legacyDate || legacyFrequency) && !value && <p className="rounded-xl bg-areia p-3 text-sm text-text">Informações atuais: {[legacyDate, legacyFrequency].filter(Boolean).join(" · ")}. Elas serão preservadas até você cadastrar uma agenda.</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Início do curso<input className={field} type="date" value={agenda.startDate} onChange={e => change({ startDate: e.target.value })} /></label>
      <label className="text-sm font-semibold">Fim do curso<input className={field} type="date" min={agenda.startDate || undefined} value={agenda.endDate} onChange={e => change({ endDate: e.target.value })} /></label>
      <label className="text-sm font-semibold">Fuso horário<select className={field} value={agenda.timezone} onChange={e => change({ timezone: e.target.value })}><option value="America/Sao_Paulo">Brasília — São Paulo</option><option value="America/Porto_Velho">Rondônia — Porto Velho</option><option value="America/Manaus">Amazonas — Manaus</option><option value="America/Rio_Branco">Acre — Rio Branco</option><option value="America/Belem">Pará — Belém</option></select></label>
      <label className="text-sm font-semibold">Modalidade<select className={field} value={agenda.modality} onChange={e => change({ modality: e.target.value as CourseAgenda["modality"] })}><option value="online">On-line</option><option value="presencial">Presencial</option><option value="hibrido">Híbrido</option></select></label>
    </div>
    {agenda.sessions.map((session, index) => <fieldset key={session.id} className="min-w-0 space-y-3 rounded-xl border border-border p-3 sm:p-4">
      <legend className="px-2 text-sm font-bold">Encontro {index + 1}</legend>
      <label className="block text-sm">Título ou tema (opcional)<input className={field} maxLength={200} value={session.title} onChange={e => update(session.id, { title: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Data<input className={field} type="date" value={session.date} min={agenda.startDate || undefined} max={agenda.endDate || undefined} onChange={e => update(session.id, { date: e.target.value })} /></label>
        <label className="text-sm">Início<input className={field} type="time" value={session.startTime} onChange={e => update(session.id, { startTime: e.target.value })} /></label>
        <label className="text-sm">Término<input className={field} type="time" value={session.endTime} onChange={e => update(session.id, { endTime: e.target.value })} /></label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary" onClick={() => change({ sessions: [...agenda.sessions, { ...session, id: crypto.randomUUID(), date: "" }] })}><Copy size={16} />Duplicar encontro</button>
        <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm text-terra" onClick={() => { setRemoved(session); change({ sessions: agenda.sessions.filter(item => item.id !== session.id) }); }}><Trash2 size={16} />Remover encontro {index + 1}</button>
      </div>
    </fieldset>)}
    {removed && <button type="button" className="min-h-11 text-sm font-semibold text-primary" onClick={() => { change({ sessions: [...agenda.sessions, removed] }); setRemoved(null); }}>Desfazer remoção do encontro</button>}
    <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-primary" disabled={agenda.sessions.length >= 120} onClick={append}><Plus size={18} />Adicionar encontro</button>
    {agenda.sessions.length > 0 && <div className="space-y-3 rounded-xl bg-areia p-4">
      <p className="text-sm font-bold">Repetir o primeiro encontro</p><p className="text-sm text-muted">Confira as datas antes de aplicar. Depois você pode editar ou remover exceções.</p>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Frequência<select className={field} value={repeat} onChange={e => { setRepeat(e.target.value as typeof repeat); setPreview([]); }}><option value="weekly">Semanal</option><option value="fortnightly">Quinzenal</option><option value="monthly">Mensal</option></select></label><label className="text-sm">Total de encontros<input type="number" min={1} max={60} className={field} value={count} onChange={e => { setCount(Number(e.target.value)); setPreview([]); }} /></label></div>
      <button type="button" className="min-h-11 font-semibold text-primary" onClick={makePreview}>Visualizar datas</button>
      {preview.length > 0 && <><ul className="max-h-56 overflow-y-auto space-y-2 text-sm">{preview.map(session => <li key={session.id}>{formatCourseSession(session)}</li>)}</ul><button type="button" className="min-h-11 rounded-xl bg-primary px-4 font-bold text-white" onClick={() => change({ sessions: [...agenda.sessions.slice(1), ...preview] })}>Aplicar datas ao primeiro encontro</button></>}
    </div>}
    {error && <p role="alert" className="text-sm text-terra">{error}</p>}
    {!result.success && <p role="status" className="text-sm text-terra">{result.error.issues[0]?.message}</p>}
    {result.success && agenda.sessions.length > 0 && <div className="border-t border-border pt-4"><p className="mb-2 text-sm font-bold">Resumo — {agenda.timezone}</p><ul className="space-y-2 text-sm text-muted">{[...agenda.sessions].sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)).map(session => <li key={session.id}>{formatCourseSession(session)}</li>)}</ul></div>}
  </section>;
}

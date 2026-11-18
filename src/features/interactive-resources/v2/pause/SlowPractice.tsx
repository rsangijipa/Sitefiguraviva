"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Plus, X, Undo2 } from "lucide-react";
import { SoundLab } from "./sound-lab";

type Priority = "alta" | "media" | "baixa";
interface Task { id: number; name: string; priority: Priority; minutes: number; parked: boolean }
interface Segment { kind: "foco" | "descanso"; minutes: number; task?: Task; part?: string }
const PRIORITY: Record<Priority, { label: string; color: string; order: number }> = { alta: { label: "Alta", color: "#c0453a", order: 0 }, media: { label: "Média", color: "#d9a21b", order: 1 }, baixa: { label: "Baixa", color: "#4a8d28", order: 2 } };
const REST_IDEAS = ["Respire fundo três vezes, soltando o ar devagar.", "Eleve os ombros e solte.", "Olhe para longe por 20 segundos.", "Tome um gole de água.", "Abra e feche as mãos, sem pressa.", "Levante, se for confortável, e dê alguns passos."];
const SIZE = 260, CENTER = SIZE / 2, R = 108;

/** Monta o plano: tarefas por prioridade, em blocos de foco com descansos entre eles. */
export function buildPlan(tasks: Task[], focus: number, rest: number): Segment[] {
  const list = tasks.filter(task => !task.parked).sort((a, b) => PRIORITY[a.priority].order - PRIORITY[b.priority].order || a.id - b.id);
  const chunks: Segment[] = [];
  for (const task of list) {
    let left = task.minutes, part = 1; const total = Math.ceil(task.minutes / focus);
    while (left > 0) { const minutes = Math.min(focus, left); chunks.push({ kind: "foco", minutes, task, part: total > 1 ? `${part}/${total}` : undefined }); left -= minutes; part++; }
  }
  return chunks.flatMap((chunk, index) => (index < chunks.length - 1 ? [chunk, { kind: "descanso" as const, minutes: rest }] : [chunk]));
}
const arc = (from: number, to: number) => {
  const a0 = from * 2 * Math.PI - Math.PI / 2, a1 = to * 2 * Math.PI - Math.PI / 2, large = to - from > 0.5 ? 1 : 0;
  return `M ${CENTER + R * Math.cos(a0)} ${CENTER + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${CENTER + R * Math.cos(a1)} ${CENTER + R * Math.sin(a1)}`;
};
const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

/** Desacelerar: relógio de tarefas com prioridade, tempo e descansos. Deixar uma tarefa de lado é sempre possível. */
export function SlowPractice({ paused }: { paused: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState(""); const [priority, setPriority] = useState<Priority>("media"); const [minutes, setMinutes] = useState(20);
  const [focus, setFocus] = useState(25); const [rest, setRest] = useState(5);
  const [running, setRunning] = useState(false); const [index, setIndex] = useState(0); const [elapsed, setElapsed] = useState(0);
  const lab = useRef<SoundLab | null>(null);
  const pausedRef = useRef(paused);
  const nextId = useRef(1);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => () => { lab.current?.dispose(); }, []);

  const plan = useMemo(() => buildPlan(tasks, focus, rest), [tasks, focus, rest]);
  const total = plan.reduce((sum, segment) => sum + segment.minutes, 0);
  const current = plan[index]; const currentSec = current ? current.minutes * 60 : 0;

  const chime = () => { void lab.current?.ensure().then(() => lab.current?.shot("sino", 330)); };
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => { if (!pausedRef.current) setElapsed(value => value + 1); }, 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (!running || !current || elapsed < currentSec) return;
    chime();
    if (index + 1 >= plan.length) { setRunning(false); setIndex(0); setElapsed(0); } else { setIndex(value => value + 1); setElapsed(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const add = () => {
    const clean = name.trim(); if (!clean) return;
    setTasks(values => [...values, { id: nextId.current++, name: clean.slice(0, 60), priority, minutes: Math.min(240, Math.max(5, minutes)), parked: false }]); setName(""); setRunning(false); setIndex(0); setElapsed(0);
  };
  const park = (id: number) => { setTasks(values => values.map(task => (task.id === id ? { ...task, parked: !task.parked } : task))); setRunning(false); setIndex(0); setElapsed(0); };
  const remove = (id: number) => { setTasks(values => values.filter(task => task.id !== id)); setRunning(false); setIndex(0); setElapsed(0); };
  const start = async () => {
    if (!plan.length) return;
    lab.current ??= new SoundLab(); await lab.current.ensure();
    if (running) { setRunning(false); return; }
    if (index >= plan.length) setIndex(0); setRunning(true);
  };
  const skip = () => { chime(); if (index + 1 >= plan.length) { setRunning(false); setIndex(0); } else setIndex(value => value + 1); setElapsed(0); };
  const reset = () => { setRunning(false); setIndex(0); setElapsed(0); };

  let acc = 0;
  const segments = plan.map(segment => { const from = acc / (total || 1); acc += segment.minutes; return { segment, from, to: acc / (total || 1) }; });
  const done = plan.slice(0, index).reduce((sum, segment) => sum + segment.minutes * 60, 0) + elapsed, progress = total ? Math.min(1, done / (total * 60)) : 0;
  const hand = progress * 2 * Math.PI - Math.PI / 2;
  const idea = REST_IDEAS[(index + Math.floor(elapsed / 20)) % REST_IDEAS.length];

  return <div className="ps-slow">
    <section className="ps-slow-tasks" aria-label="Tarefas">
      <form className="ps-task-form" onSubmit={event => { event.preventDefault(); add(); }}>
        <input aria-label="Nome da tarefa" placeholder="O que você quer fazer? (ou deixar de lado)" value={name} maxLength={60} onChange={event => setName(event.target.value)} />
        <select aria-label="Prioridade" value={priority} onChange={event => setPriority(event.target.value as Priority)}>{(Object.keys(PRIORITY) as Priority[]).map(key => <option key={key} value={key}>{PRIORITY[key].label}</option>)}</select>
        <label className="ps-min"><input aria-label="Minutos da tarefa" type="number" min="5" max="240" step="5" value={minutes} onChange={event => setMinutes(Number(event.target.value))} />min</label>
        <button type="submit" className="fv-chip" disabled={!name.trim()}><Plus size={14} aria-hidden="true" />Adicionar</button>
      </form>
      <ul className="ps-task-list">
        {tasks.length === 0 && <li className="ps-empty">Escreva suas tarefas, escolha a prioridade e o tempo. O relógio monta blocos de foco com descansos.</li>}
        {tasks.map(task => <li key={task.id} data-parked={task.parked}><i style={{ background: PRIORITY[task.priority].color }} aria-hidden="true" /><span>{task.name}</span><small>{PRIORITY[task.priority].label} · {task.minutes} min</small>
          <button type="button" className="fv-chip" onClick={() => park(task.id)} aria-label={`${task.parked ? "Retomar" : "Deixar de lado"}: ${task.name}`}>{task.parked ? <><Undo2 size={13} aria-hidden="true" />Retomar</> : "Deixar de lado"}</button>
          <button type="button" className="ps-x" onClick={() => remove(task.id)} aria-label={`Remover ${task.name}`}><X size={14} aria-hidden="true" /></button></li>)}
      </ul>
      <div className="ps-slow-config" role="group" aria-label="Ritmo de foco e descanso">
        <label>Foco<select value={focus} onChange={event => { setFocus(Number(event.target.value)); reset(); }}>{[15, 20, 25, 40, 50].map(v => <option key={v} value={v}>{v} min</option>)}</select></label>
        <label>Descanso<select value={rest} onChange={event => { setRest(Number(event.target.value)); reset(); }}>{[3, 5, 10, 15].map(v => <option key={v} value={v}>{v} min</option>)}</select></label>
        <span className="ps-label">Total: {total} min</span>
      </div>
    </section>
    <section className="ps-slow-clock" aria-label="Relógio das tarefas">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={current ? `Relógio: ${current.kind === "foco" ? current.task?.name : "descanso"}, faltam ${clock(currentSec - elapsed)}` : "Relógio sem tarefas"}>
        <circle cx={CENTER} cy={CENTER} r={R + 18} fill="#fffdf8" stroke="#d8cfbe" strokeWidth="2" />
        {Array.from({ length: 60 }, (_, i) => { const a = (i / 60) * 2 * Math.PI; const l = i % 5 === 0 ? 8 : 4; return <line key={i} x1={CENTER + (R + 14) * Math.cos(a)} y1={CENTER + (R + 14) * Math.sin(a)} x2={CENTER + (R + 14 - l) * Math.cos(a)} y2={CENTER + (R + 14 - l) * Math.sin(a)} stroke="#6b6b63" strokeOpacity=".5" />; })}
        <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="#efe6d3" strokeWidth="16" />
        {segments.map(({ segment, from, to }, i) => <path key={i} d={arc(from, Math.max(from + 0.004, to - 0.004))} fill="none" strokeWidth="16" strokeLinecap="butt" stroke={segment.kind === "descanso" ? "#8fd0b4" : PRIORITY[segment.task!.priority].color} opacity={i < index ? 0.3 : 1} />)}
        {plan.length > 0 && <g><line x1={CENTER} y1={CENTER} x2={CENTER + (R - 6) * Math.cos(hand)} y2={CENTER + (R - 6) * Math.sin(hand)} stroke="#005a1f" strokeWidth="3" strokeLinecap="round" /><circle cx={CENTER} cy={CENTER} r="5" fill="#005a1f" /></g>}
        <text x={CENTER} y={CENTER - 26} textAnchor="middle" fontSize="11" fill="#6b6b63">{current ? (current.kind === "foco" ? "Foco" : "Descanso") : "—"}</text>
        <text x={CENTER} y={CENTER + 8} textAnchor="middle" fontSize="26" fontWeight="600" fill="#005a1f">{current ? clock(currentSec - elapsed) : "0:00"}</text>
        <text x={CENTER} y={CENTER + 28} textAnchor="middle" fontSize="11" fill="#262b22">{current?.kind === "foco" ? `${current.task!.name.slice(0, 20)}${current.part ? ` ${current.part}` : ""}` : ""}</text>
      </svg>
      <p className="ps-about" role="status">{current ? (current.kind === "descanso" ? `Hora de descansar: ${idea}` : `Agora: ${current.task!.name}. Só isto, por enquanto.`) : "Adicione tarefas para montar o relógio."}</p>
      <div className="ps-patterns">
        <button type="button" className="ps-round" disabled={!plan.length} aria-label={running ? "Pausar o relógio" : "Iniciar o relógio"} aria-pressed={running} onClick={() => void start()}>{running ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}</button>
        <button type="button" className="fv-chip" disabled={!plan.length} onClick={skip}><SkipForward size={13} aria-hidden="true" />Pular bloco</button>
        <button type="button" className="fv-chip" disabled={!plan.length} onClick={reset}><RotateCcw size={13} aria-hidden="true" />Reiniciar</button>
      </div>
    </section>
  </div>;
}

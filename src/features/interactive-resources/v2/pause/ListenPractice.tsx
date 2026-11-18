"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { SoundLab } from "./sound-lab";

type Kind = "passaro" | "sino" | "gota" | "vento";
const KINDS: { id: Kind; label: string; every: [number, number] }[] = [
  { id: "passaro", label: "Pássaro", every: [1800, 4200] },
  { id: "sino", label: "Sino", every: [3500, 6500] },
  { id: "gota", label: "Gotas d’água", every: [900, 2200] },
  { id: "vento", label: "Vento", every: [4000, 7000] },
];
const describe = (d: number) => (d < 0.25 ? "Bem perto: som nítido, cheio de brilho." : d < 0.55 ? "À distância média: um pouco mais suave." : d < 0.8 ? "Longe: abafado, com eco." : "Muito longe: quase só o eco do espaço.");

/** Ouvir: um som que vai de perto a longe (volume, brilho, eco e lado mudam com a distância). */
export function ListenPractice({ paused }: { paused: boolean }) {
  const [kind, setKind] = useState<Kind>("passaro");
  const [distance, setDistance] = useState(15);
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState(0);
  const lab = useRef<SoundLab | null>(null);
  const space = useRef<ReturnType<SoundLab["spatial"]> | null>(null);
  const timer = useRef(0);
  const autoRef = useRef(auto);
  const distRef = useRef(distance);
  const angle = useRef(0.7);
  useEffect(() => { autoRef.current = auto; distRef.current = distance; });

  const stop = useCallback(() => { clearTimeout(timer.current); setPlaying(false); }, []);
  const schedule = useCallback((current: Kind) => {
    const info = KINDS.find(item => item.id === current)!;
    const loop = () => { timer.current = window.setTimeout(() => { space.current?.play(current); setPulse(value => value + 1); loop(); }, info.every[0] + Math.random() * (info.every[1] - info.every[0])); };
    space.current?.play(current); setPulse(value => value + 1); loop();
  }, []);
  const toggle = async () => {
    if (playing) { stop(); return; }
    lab.current ??= new SoundLab(); if (!(await lab.current.ensure())) return;
    space.current ??= lab.current.spatial(); space.current.set(distRef.current / 100, Math.sin(angle.current)); setPlaying(true); schedule(kind);
  };
  const choose = (next: Kind) => { setKind(next); if (playing) { clearTimeout(timer.current); schedule(next); } };
  useEffect(() => { if (paused && playing) stop(); }, [paused, playing, stop]);
  useEffect(() => () => { clearTimeout(timer.current); space.current?.dispose(); lab.current?.dispose(); }, []);
  // Passeio automático: a distância oscila devagar entre perto e longe, e o som muda de lado.
  useEffect(() => {
    if (!auto) return;
    let t = Math.asin(((distRef.current / 100) - 0.5) / 0.45) || 0;
    const id = window.setInterval(() => {
      t += 0.045; const d = 0.5 + Math.sin(t) * 0.45; angle.current += 0.03; setDistance(Math.round(d * 100)); space.current?.set(d, Math.sin(angle.current));
    }, 120);
    return () => clearInterval(id);
  }, [auto]);
  const manual = (value: number) => { setDistance(value); space.current?.set(value / 100, Math.sin(angle.current)); };

  const d = distance / 100, radius = 30 + d * 120, x = 200 + Math.sin(angle.current) * radius, y = 200 - Math.cos(angle.current) * radius * 0.82;
  return <div className="ps-listen">
    <svg className="ps-listen-map" viewBox="0 0 400 400" role="img" aria-label={`Mapa do som: ${describe(d)}`}>
      {[50, 100, 150].map((r, i) => <g key={r}><circle cx="200" cy="200" r={r} fill="none" stroke="#005a1f" strokeOpacity=".18" strokeDasharray="4 6" /><text x="200" y={200 - r - 4} textAnchor="middle" fontSize="11" fill="#6b6b63">{["Perto", "Médio", "Longe"][i]}</text></g>)}
      <circle cx="200" cy="200" r="16" fill="#fdf8ee" stroke="#005a1f" strokeWidth="2" /><path d="M194 200 a6 6 0 1 1 12 0 c0 5 -4 5 -4 9" fill="none" stroke="#005a1f" strokeWidth="2" strokeLinecap="round" />
      <g key={pulse}><circle cx={x} cy={y} r={10 + (1 - d) * 8} fill="#bd6d2d" opacity={0.35 + (1 - d) * 0.55} />{playing && <circle cx={x} cy={y} r="10" fill="none" stroke="#bd6d2d" strokeWidth="2" className="ps-listen-ring" />}</g>
    </svg>
    <div className="ps-listen-side">
      <p className="ps-cue"><strong>Perto e longe</strong></p>
      <p className="ps-about">{describe(d)}</p>
      <div className="ps-patterns" role="group" aria-label="Escolher o som">{KINDS.map(item => <button type="button" key={item.id} className="fv-chip" aria-pressed={kind === item.id} onClick={() => choose(item.id)}>{item.label}</button>)}</div>
      <label className="ps-distance">Perto<input type="range" min="0" max="100" value={distance} disabled={auto} aria-label="Distância do som: de perto a longe" onChange={event => manual(Number(event.target.value))} />Longe</label>
      <div className="ps-patterns">
        <button type="button" className="ps-round" aria-label={playing ? "Pausar o som" : "Tocar o som"} aria-pressed={playing} onClick={() => void toggle()}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}</button>
        <button type="button" className="fv-chip" aria-pressed={auto} onClick={() => setAuto(value => !value)}>Passeio automático</button>
      </div>
      <p className="fv-note">Use fones para perceber o lado do som. Pergunte-se: que som está mais perto? E qual parece mais longe?</p>
    </div>
  </div>;
}

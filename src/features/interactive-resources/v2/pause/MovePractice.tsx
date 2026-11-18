"use client";
import { useEffect, useRef, useState } from "react";

type Mode = "maos" | "ombros" | "imobilidade";
const MODES: { id: Mode; label: string; about: string }[] = [
  { id: "maos", label: "Mãos", about: "Abra e feche as mãos devagar, sem apertar. Siga a mão ao lado, no seu ritmo." },
  { id: "ombros", label: "Ombros", about: "Eleve os ombros ao inspirar e solte ao expirar. Se preferir, faça círculos pequenos." },
  { id: "imobilidade", label: "Imobilidade", about: "Fique o mais parado que for confortável e perceba o que ainda se move: respiração, pulso, pequenos ajustes." },
];
const PACES = [{ id: 6, label: "Lento" }, { id: 4, label: "Médio" }];

/** Movimentar: mãos, ombros ou imobilidade, com uma figura que mostra o ritmo. Sempre dentro do que for confortável. */
export function MovePractice({ paused, motion }: { paused: boolean; motion: boolean }) {
  const [mode, setMode] = useState<Mode>("maos");
  const [pace, setPace] = useState(6);
  const [roll, setRoll] = useState(false);
  const [still, setStill] = useState(60);
  const [phase, setPhase] = useState<"a" | "b">("a");
  const [cycles, setCycles] = useState(0);
  const [stillKey, setStillKey] = useState(0);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    if (mode === "imobilidade") return;
    setPhase("a"); setCycles(0);
    const id = window.setInterval(() => { if (pausedRef.current) return; setPhase(value => { if (value === "b") setCycles(count => count + 1); return value === "a" ? "b" : "a"; }); }, (pace * 1000) / 2);
    return () => clearInterval(id);
  }, [mode, pace]);

  const cue = mode === "maos" ? (phase === "a" ? "Abra" : "Feche, suave") : mode === "ombros" ? (phase === "a" ? "Eleve" : "Solte") : "Fique";
  const info = MODES.find(item => item.id === mode)!;
  const dur = `${pace / 2}s`;
  return <div className="ps-move" data-paused={paused} data-motion={motion}>
    <div className="ps-move-stage" style={{ ["--dur" as string]: dur }}>
      {mode === "maos" && <svg viewBox="0 0 200 240" className="mv-hand" data-phase={phase} role="img" aria-label={`Mão ${phase === "a" ? "aberta" : "fechando"}`}>
        <rect x="62" y="130" width="76" height="86" rx="30" className="mv-palm" />
        {[[66, 52], [88, 36], [110, 36], [132, 50]].map(([x, h], i) => <rect key={i} x={x - 8} y={130 - h * 2} width="16" height={h * 2 + 8} rx="8" className="mv-finger" style={{ transformOrigin: `${x}px 134px` }} />)}
        <rect x="26" y="136" width="52" height="16" rx="8" className="mv-thumb" style={{ transformOrigin: "74px 146px" }} />
      </svg>}
      {mode === "ombros" && <svg viewBox="0 0 240 240" className={`mv-torso${roll ? " is-rolling" : ""}`} data-phase={phase} role="img" aria-label="Ombros subindo e soltando">
        <circle cx="120" cy="64" r="30" className="mv-head" /><rect x="108" y="88" width="24" height="26" rx="10" className="mv-neck" />
        <g className="mv-shoulders"><path d="M44 134 C44 108 76 108 120 108 C164 108 196 108 196 134 L196 150 L44 150Z" className="mv-body" /><rect x="30" y="126" width="30" height="92" rx="15" className="mv-arm" /><rect x="180" y="126" width="30" height="92" rx="15" className="mv-arm" /></g>
        <rect x="76" y="148" width="88" height="84" rx="28" className="mv-body" opacity=".9" />
      </svg>}
      {mode === "imobilidade" && <svg viewBox="0 0 200 200" className="mv-still" role="img" aria-label="Anel de imobilidade que se completa devagar">
        <circle cx="100" cy="100" r="82" className="mv-still-track" />
        <circle key={`${stillKey}-${still}`} cx="100" cy="100" r="82" className="mv-still-ring" style={{ ["--len" as string]: 515, animationDuration: `${still}s` }} />
        <circle cx="100" cy="100" r="26" className="mv-still-core" />
      </svg>}
    </div>
    <div className="ps-move-side">
      <p className="ps-cue" role="status" aria-live="off"><strong>{paused ? "Em pausa" : cue}</strong>{mode !== "imobilidade" && <span> · {cycles} {cycles === 1 ? "ciclo" : "ciclos"}</span>}</p>
      <div className="ps-patterns" role="group" aria-label="O que movimentar">{MODES.map(item => <button type="button" key={item.id} className="fv-chip" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>{item.label}</button>)}</div>
      <p className="ps-about">{info.about}</p>
      {mode !== "imobilidade" && <div className="ps-patterns" role="group" aria-label="Ritmo"><span className="ps-label">Ritmo</span>{PACES.map(item => <button type="button" key={item.id} className="fv-chip" aria-pressed={pace === item.id} onClick={() => setPace(item.id)}>{item.label}</button>)}{mode === "ombros" && <button type="button" className="fv-chip" aria-pressed={roll} onClick={() => setRoll(value => !value)}>Círculos</button>}</div>}
      {mode === "imobilidade" && <div className="ps-patterns" role="group" aria-label="Duração"><span className="ps-label">Duração</span>{[30, 60, 90].map(sec => <button type="button" key={sec} className="fv-chip" aria-pressed={still === sec} onClick={() => setStill(sec)}>{sec}s</button>)}<button type="button" className="fv-chip" onClick={() => setStillKey(value => value + 1)}>Recomeçar</button></div>}
      <p className="fv-note">Movimente-se só dentro do que for confortável. Pule ou adapte qualquer parte e interrompa se sentir dor.</p>
    </div>
  </div>;
}

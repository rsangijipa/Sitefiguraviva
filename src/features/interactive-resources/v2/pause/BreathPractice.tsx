"use client";
import { useEffect, useRef, useState } from "react";
import { BreathMandala } from "./BreathMandala";
import { BREATH_PATTERNS, patternById } from "./breath-patterns";

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Respiração guiada: o padrão escolhido conduz o nível (0–1) que anima a mandala; o texto acompanha a fase. */
export function BreathPractice({ paused, motion }: { paused: boolean; motion: boolean }) {
  const [patternId, setPatternId] = useState("natural");
  const [display, setDisplay] = useState({ cue: "Inspire", count: 0 });
  const level = useRef(0.35);
  const pausedRef = useRef(paused);
  const pattern = patternById(patternId);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    const phases = pattern.phases;
    let frame = 0, last = performance.now(), index = 0, t = 0, from = level.current, shown = "";
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (pausedRef.current) return;
      t += dt;
      const phase = phases[index];
      const target = phase.kind === "hold" ? from : phase.to ?? (phase.kind === "in" ? 1 : 0);
      level.current = from + (target - from) * ease(Math.min(1, t / phase.sec));
      const count = Math.max(1, Math.ceil(phase.sec - t)), mark = `${index}|${count}`;
      if (mark !== shown) { shown = mark; setDisplay({ cue: phase.cue, count }); }
      if (t >= phase.sec) { index = (index + 1) % phases.length; t = 0; from = level.current; }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pattern]);

  return <div className="ps-breath">
    <div className="ps-breath-art"><BreathMandala level={level} motion={motion} /></div>
    <div className="ps-breath-side">
      <p className="ps-cue" role="status" aria-live="off"><strong>{paused ? "Em pausa" : display.cue}</strong>{!paused && display.count > 0 && pattern.id !== "natural" && <span> · {display.count}</span>}</p>
      <div className="ps-patterns" role="group" aria-label="Tipo de respiração">
        {BREATH_PATTERNS.map(item => <button type="button" key={item.id} className="fv-chip" aria-pressed={patternId === item.id} title={item.short} onClick={() => setPatternId(item.id)}>{item.label}</button>)}
      </div>
      <p className="ps-about">{pattern.about}</p>
      <p className="fv-note">Se sentir tontura ou incômodo, volte à respiração natural. Você pode fazer pausas sem prender o ar.</p>
    </div>
  </div>;
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Cookie, Ear, Eye, Flower2, Hand, Pause, Play } from "lucide-react";
import { SoundLab, type LoopName } from "./sound-lab";

type Sense = "ver" | "ouvir" | "tocar" | "cheirar" | "saborear";
const SENSES: { id: Sense; label: string; Icon: typeof Eye; color: string; prompts: string[]; loops: LoopName[] }[] = [
  { id: "ver", label: "Ver", Icon: Eye, color: "#3d78b5", prompts: ["Nomeie três cores que você vê agora.", "Qual coisa está mais perto? E mais longe?"], loops: ["sinos"] },
  { id: "ouvir", label: "Ouvir", Icon: Ear, color: "#00786f", prompts: ["Que som é mais forte? E o mais sutil?", "Fique com um som até ele mudar."], loops: ["agua", "vento"] },
  { id: "tocar", label: "Tocar", Icon: Hand, color: "#bd6d2d", prompts: ["Sinta o apoio do corpo e a temperatura da pele.", "Toque a tela: cada toque desenha uma onda."], loops: [] },
  { id: "cheirar", label: "Cheirar", Icon: Flower2, color: "#8a6cb8", prompts: ["Há algum cheiro por perto? Se não, lembre de um cheiro agradável.", "Inspire devagar e perceba se algo muda."], loops: ["vento"] },
  { id: "saborear", label: "Saborear", Icon: Cookie, color: "#f35e78", prompts: ["Perceba o gosto na boca neste instante.", "Se puder, tome um gole de água devagar."], loops: ["gotas"] },
];
interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; hue: number; age: number }
interface Ripple { x: number; y: number; age: number; color: string }
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Pelos sentidos: escolha os sentidos; cada um vira uma camada visual que se move no ritmo do som quando você toca. */
export function SensesPractice({ paused, motion }: { paused: boolean; motion: boolean }) {
  const [active, setActive] = useState<Sense[]>(["ver", "ouvir"]);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lab = useRef<SoundLab | null>(null);
  const activeRef = useRef(active);
  const pausedRef = useRef(paused);
  const ripples = useRef<Ripple[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { activeRef.current = active; pausedRef.current = paused; });

  const loopsFor = useCallback((senses: Sense[]) => new Set(senses.flatMap(id => SENSES.find(sense => sense.id === id)!.loops)), []);
  const syncSound = useCallback((senses: Sense[], on: boolean) => {
    const sound = lab.current; if (!sound?.ready) return;
    const wanted = on ? loopsFor(senses) : new Set<LoopName>();
    for (const name of ["sinos", "agua", "vento", "chuva", "gotas"] as LoopName[]) { if (wanted.has(name)) sound.start(name); else sound.stop(name); }
  }, [loopsFor]);

  const toggleSound = async () => {
    lab.current ??= new SoundLab();
    if (playing) { setPlaying(false); syncSound(active, false); return; }
    if (!(await lab.current.ensure())) return;
    lab.current.setVolume(volume / 100); setPlaying(true); syncSound(active, true);
  };
  const toggleSense = (id: Sense) => setActive(values => { const next = values.includes(id) ? values.filter(value => value !== id) : [...values, id]; syncSound(next, playing); return next; });
  useEffect(() => { if (paused && playing) { syncSound(active, false); setPlaying(false); } }, [paused, playing, active, syncSound]);
  useEffect(() => () => { lab.current?.dispose(); lab.current = null; }, []);
  useEffect(() => { lab.current?.setVolume(volume / 100); }, [volume]);

  useEffect(() => {
    const element = canvas.current; const g = element?.getContext("2d"); if (!element || !g) return;
    let frame = 0, last = performance.now(), t = 0, w = 1, h = 1, dpr = 1;
    const parts: Record<Sense, Particle[]> = { ver: [], ouvir: [], tocar: [], cheirar: [], saborear: [] };
    const seed = () => {
      parts.ver = Array.from({ length: 22 }, () => ({ x: rand(0, w), y: rand(0, h), vx: rand(-6, 6), vy: rand(-8, 4), r: rand(14, 46), a: rand(0.18, 0.4), hue: rand(0, 360), age: rand(0, 9) }));
      parts.tocar = Array.from({ length: 70 }, () => ({ x: rand(0, w), y: rand(0, h), vx: 0, vy: 0, r: rand(2, 5), a: rand(0.3, 0.7), hue: 0, age: 0 }));
      parts.cheirar = Array.from({ length: 14 }, () => ({ x: rand(0, w), y: rand(h * 0.5, h), vx: rand(-5, 5), vy: rand(-30, -14), r: rand(40, 90), a: rand(0.06, 0.14), hue: 270, age: rand(0, 6) }));
      parts.saborear = Array.from({ length: 24 }, () => ({ x: rand(0, w), y: rand(-h, h), vx: 0, vy: rand(24, 60), r: rand(4, 11), a: rand(0.35, 0.7), hue: 0, age: 0 }));
    };
    const resize = () => { const r = element.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); dpr = Math.min(window.devicePixelRatio || 1, 1.6); element.width = Math.round(w * dpr); element.height = Math.round(h * dpr); seed(); frameDraw(0, 0); };
    function frameDraw(dt: number, level: number) {
      g!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = g!.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#fffdf8"); bg.addColorStop(1, "#f4e9d6"); g!.fillStyle = bg; g!.fillRect(0, 0, w, h);
      const on = activeRef.current, boost = 1 + level * 2.2;
      if (on.includes("ver")) for (const p of parts.ver) {
        p.age += dt; p.x += p.vx * dt * boost; p.y += p.vy * dt * boost; if (p.x < -60) p.x = w + 60; if (p.x > w + 60) p.x = -60; if (p.y < -60) p.y = h + 60; if (p.y > h + 60) p.y = -60;
        const rr = Math.max(1, p.r * (1 + level * 0.8 + Math.sin(p.age) * 0.08)), grad = g!.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
        grad.addColorStop(0, `hsla(${(p.hue + t * 6) % 360},70%,62%,${p.a})`); grad.addColorStop(1, `hsla(${(p.hue + t * 6) % 360},70%,62%,0)`); g!.fillStyle = grad; g!.beginPath(); g!.arc(p.x, p.y, rr, 0, Math.PI * 2); g!.fill();
      }
      if (on.includes("cheirar")) for (const p of parts.cheirar) {
        p.age += dt; p.y += p.vy * dt * boost; p.x += Math.sin(p.age * 0.8 + p.y * 0.01) * 14 * dt; if (p.y < -p.r) { p.y = h + p.r; p.x = rand(0, w); }
        const grad = g!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1 + level * 0.5)); grad.addColorStop(0, `rgba(138,108,184,${p.a})`); grad.addColorStop(1, "rgba(138,108,184,0)"); g!.fillStyle = grad; g!.beginPath(); g!.arc(p.x, p.y, p.r * (1 + level * 0.5), 0, Math.PI * 2); g!.fill();
      }
      if (on.includes("saborear")) for (const p of parts.saborear) {
        p.y += p.vy * dt * boost; if (p.y > h + 12) { p.y = -12; p.x = rand(0, w); }
        g!.fillStyle = `rgba(243,94,120,${p.a})`; g!.beginPath(); g!.ellipse(p.x, p.y, p.r * 0.7, p.r * 1.1, 0, 0, Math.PI * 2); g!.fill(); g!.fillStyle = "rgba(255,255,255,.55)"; g!.beginPath(); g!.arc(p.x - p.r * 0.25, p.y - p.r * 0.3, p.r * 0.22, 0, Math.PI * 2); g!.fill();
      }
      if (on.includes("tocar")) for (const p of parts.tocar) {
        const m = pointer.current; if (m) { const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy); if (d < 110) { p.vx += (dx / (d + 1)) * 160 * dt; p.vy += (dy / (d + 1)) * 160 * dt; } }
        p.vx *= 0.94; p.vy *= 0.94; p.x += p.vx * dt * 8 + Math.sin(t + p.r) * 0.1; p.y += p.vy * dt * 8 + Math.cos(t * 0.8 + p.r) * 0.1;
        g!.fillStyle = `rgba(189,109,45,${p.a})`; g!.beginPath(); g!.arc(p.x, p.y, p.r, 0, Math.PI * 2); g!.fill();
      }
      if (on.includes("ouvir")) {
        const rings = 4; for (let i = 0; i < rings; i++) { const ph = ((t * 0.18 + i / rings) % 1), rad = Math.max(0.5, ph * Math.min(w, h) * (0.5 + level * 0.3)); g!.strokeStyle = `rgba(0,120,111,${(1 - ph) * (0.3 + level * 0.5)})`; g!.lineWidth = 2 + level * 3; g!.beginPath(); g!.arc(w / 2, h / 2, rad, 0, Math.PI * 2); g!.stroke(); }
      }
      ripples.current = ripples.current.filter(r => r.age < 2.2);
      for (const r of ripples.current) { r.age += dt; for (let k = 0; k < 3; k++) { const rad = (r.age * 120) - k * 24; if (rad > 0.5) { g!.strokeStyle = `rgba(189,109,45,${Math.max(0, 0.5 - r.age * 0.23)})`; g!.lineWidth = 2; g!.beginPath(); g!.arc(r.x, r.y, rad, 0, Math.PI * 2); g!.stroke(); } } }
    }
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick); const dt = Math.min(0.08, (now - last) / 1000); last = now; if (document.hidden || pausedRef.current) return;
      t += dt; frameDraw(dt, lab.current?.level() ?? 0);
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null; observer?.observe(element); resize();
    if (motion) frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [motion]);

  const tap = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); ripples.current.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, age: 0, color: "#bd6d2d" });
    if (lab.current?.ready) lab.current.shot("toque", 500 + Math.random() * 500);
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }; };

  const prompts = SENSES.filter(item => active.includes(item.id));
  return <div className="ps-senses">
    <canvas ref={canvas} className="ps-observe-canvas" role="img" aria-label="Campo de movimento dos sentidos escolhidos. Toque na tela para criar ondas." onPointerDown={tap} onPointerMove={move} onPointerLeave={() => { pointer.current = null; }} />
    <div className="ps-prompts" aria-live="polite">{prompts.length ? prompts.map(item => <p key={item.id}><strong style={{ color: item.color }}>{item.label}:</strong> {item.prompts[0]}</p>) : <p>Escolha um ou mais sentidos que façam sentido agora.</p>}</div>
    <div className="ps-observe-bar">
      <div className="ps-modes" role="group" aria-label="Sentidos">{SENSES.map(({ id, label, Icon }) => <button type="button" key={id} className="fv-chip" aria-pressed={active.includes(id)} onClick={() => toggleSense(id)}><Icon size={14} aria-hidden="true" />{label}</button>)}</div>
      <div className="ps-modes">
        <button type="button" className="ps-round" aria-label={playing ? "Pausar sons dos sentidos" : "Tocar sons dos sentidos"} aria-pressed={playing} onClick={() => void toggleSound()}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}</button>
        <input className="ps-volume" type="range" min="0" max="100" value={volume} aria-label="Volume dos sentidos" onChange={event => setVolume(Number(event.target.value))} />
      </div>
    </div>
  </div>;
}

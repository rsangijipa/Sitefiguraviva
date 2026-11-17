"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Ear, Eye, MoveRight, Orbit, Sparkles, Volume2 } from "lucide-react";
import type { ExperienceProps } from "../experience-types";
import { UNIVERSES, type UniverseKind } from "./universe-scenes";
import type { UniverseHandle } from "./universe-engine";
import { LagoScene, RiachoScene, SantuarioScene } from "./LegacyScenes";
import { MasterToggle, MinToggle } from "./SceneControls";
import "./worlds.css";

/** Modo do recurso → ambiente. Permite abrir direto pelo link (?modo=casa). */
export const WORLD_MODES: Record<string, UniverseKind> = { casa: "house", jardim: "garden", ponte: "bridge", atelie: "studio", ilha: "island", observatorio: "observatory" };
const ORDER = Object.values(WORLD_MODES);
type SceneId = UniverseKind | "riacho" | "santuario" | "lago";
const EXTRA: Record<"riacho" | "santuario" | "lago", { label: string; Scene: () => React.JSX.Element }> = {
  riacho: { label: "Riacho 3D", Scene: RiachoScene }, santuario: { label: "Santuário 3D", Scene: SantuarioScene }, lago: { label: "Lago 3D", Scene: LagoScene },
};
const EXTRA_IDS = Object.keys(EXTRA) as ("riacho" | "santuario" | "lago")[];
const initialScene = (mode: string): SceneId => (mode in EXTRA ? (mode as SceneId) : WORLD_MODES[mode] ?? "house");

/**
 * Ambientes Imersivos: seletor no topo e uma cena que ocupa o espaço da janela.
 * Os convites são abertos — sem pontuação, sem resposta certa, nada é guardado.
 */
export function WorldsExperience({ mode }: ExperienceProps) {
  const [kind, setKind] = useState<SceneId>(initialScene(mode));
  return <div className="fv-worlds">
    <div className="fv-worlds-bar" role="tablist" aria-label="Ambientes imersivos">
      {[...ORDER, ...EXTRA_IDS].map(value => <button key={value} id={`world-tab-${value}`} role="tab" type="button" className="fv-worlds-tab" aria-selected={kind === value} aria-controls="world-panel" onClick={() => setKind(value)}>{value in EXTRA ? EXTRA[value as keyof typeof EXTRA].label : UNIVERSES[value as UniverseKind].label}</button>)}
    </div>
    <div id="world-panel" role="tabpanel" aria-labelledby={`world-tab-${kind}`} className="fv-worlds-panel">{kind in EXTRA ? (() => { const { Scene } = EXTRA[kind as keyof typeof EXTRA]; return <div className="fv-world"><Scene key={kind} /></div>; })() : <World key={kind} kind={kind as UniverseKind} />}</div>
  </div>;
}

function World({ kind }: { kind: UniverseKind }) {
  const config = UNIVERSES[kind];
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<UniverseHandle | null>(null);
  const pickRef = useRef<(index: number) => void>(() => undefined);
  const optionsRef = useRef({ lowStim: false, autoOrbit: false });
  const [current, setCurrent] = useState<number | null>(null);
  const [lowStim, setLowStim] = useState(false);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [psycho, setPsycho] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "off">("loading");
  const invitation = current === null ? null : config.invitations[current];

  useEffect(() => { pickRef.current = index => { setPsycho(false); setCurrent(index); }; optionsRef.current = { lowStim, autoOrbit }; });
  useEffect(() => { if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setLowStim(true); }, []);
  useEffect(() => {
    const container = host.current;
    let cancelled = false;
    // Three.js só é baixado quando o ambiente abre.
    import("./universe-engine").then(({ createUniverse, webglAvailable }) => {
      if (cancelled || !container) return;
      if (!webglAvailable()) { setStatus("off"); return; }
      try {
        handle.current = createUniverse(container, config, optionsRef.current, { onPick: index => pickRef.current(index), onFailure: () => setStatus("off") });
        setStatus("ready");
      } catch { setStatus("off"); }
    }).catch(() => { if (!cancelled) setStatus("off"); });
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null; };
  }, [config]);
  useEffect(() => { handle.current?.setOptions({ lowStim, autoOrbit }); }, [lowStim, autoOrbit]);
  useEffect(() => { handle.current?.setActive(current ?? -1); }, [current, status]);
  useEffect(() => () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  const speak = () => {
    if (!invitation || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(invitation.text); utterance.lang = "pt-BR"; utterance.rate = .87;
    window.speechSynthesis.speak(utterance);
  };
  const next = () => { setPsycho(false); setCurrent(value => ((value ?? -1) + 1) % config.invitations.length); };

  return <div className="fv-world" data-scene-root data-controls="shown" data-state={status}>
    <div ref={host} className="fv-world-canvas" role="img" aria-label={`Cena 3D: ${config.title}. Arraste para girar e toque nos pontos luminosos para escolher um convite. O painel traz as mesmas possibilidades.`} />
    {status !== "ready" && <p className="fv-world-fallback" role="status">{status === "loading" ? "Preparando o ambiente…" : "O 3D não está disponível neste dispositivo. Os convites continuam acessíveis no painel."}</p>}
    <div className="fv-world-tools fv-overlay" role="group" aria-label="Configurações do ambiente">
      <button type="button" className="fv-chip" aria-pressed={lowStim} onClick={() => setLowStim(value => !value)}><Eye size={15} aria-hidden="true" />Menos estímulos</button>
      <button type="button" className="fv-chip" aria-pressed={autoOrbit} disabled={lowStim || status !== "ready"} onClick={() => setAutoOrbit(value => !value)}><Orbit size={15} aria-hidden="true" />Câmera lenta</button>
      <button type="button" className="fv-chip" aria-pressed={psycho} onClick={() => setPsycho(value => !value)}><Sparkles size={15} aria-hidden="true" />Entender</button>
    </div>
    <aside className="fv-world-card fv-overlay fv-minimizable" aria-label="Convites do ambiente">
      <div className="fv-world-card-head fv-minhead"><span className="fv-label">{config.title}</span><span className="fv-world-count">{current === null ? "—" : current + 1} / {config.invitations.length}</span><MinToggle label="convites" /></div>
      {psycho ? <p className="fv-world-text" role="note">{config.psycho}</p> : invitation ? <><strong className="fv-world-title">{invitation.title}</strong><p className="fv-world-text">{invitation.text}</p></> : <p className="fv-world-text">{config.tagline} Toque num ponto luminoso ou escolha um convite.</p>}
      <div className="fv-world-chips" role="group" aria-label="Convites">
        {config.invitations.map((item, index) => <button key={item.title} type="button" className="fv-chip" aria-pressed={current === index} onClick={() => { setPsycho(false); setCurrent(index); }}>{item.title}</button>)}
      </div>
      <div className="fv-world-actions">
        <button type="button" className="fv-button fv-button--secondary" onClick={speak} disabled={!invitation || psycho}><Volume2 size={15} aria-hidden="true" />Ouvir</button>
        <button type="button" className="fv-button" onClick={next}>Outro convite<MoveRight size={15} aria-hidden="true" /></button>
      </div>
      <p className="fv-world-note"><Ear size={13} aria-hidden="true" /> Convite aberto, sem resposta certa. Você pode pular, pausar ou trocar de ambiente.</p>
    </aside>
    <MasterToggle />
  </div>;
}

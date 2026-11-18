"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Bell } from "lucide-react";
import { resourceAudioManager } from "../audio-manager";
import { ambientSounds } from "../immersive/ambient-sounds";
import { BowlSynth } from "./bowl-synth";

type Mode = "silencio" | "ambiente" | "tigelas";
const CHANNEL = "sala-de-pausa";

/** Barra inferior da Sala de Pausa: sons à esquerda, controles da prática à direita, percepção numa linha só. */
export function PauseDock({ paused, hideSound, seconds, reflection, onReflection, onTogglePause, onSwitch, onEndWithout, onEnd }: {
  paused: boolean; hideSound?: boolean; seconds: number; reflection: string; onReflection: (value: string) => void;
  onTogglePause: () => void; onSwitch: () => void; onEndWithout: () => void; onEnd: () => void;
}) {
  const [mode, setMode] = useState<Mode>("silencio");
  const [ambientId, setAmbientId] = useState<string>(ambientSounds[0].id);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [error, setError] = useState("");
  const bowls = useRef<BowlSynth | null>(null);
  const wasPlaying = useRef(false);

  const stopAll = useCallback(() => { resourceAudioManager.stop(CHANNEL); bowls.current?.stop(); }, []);
  const start = useCallback(async (nextMode: Mode, id: string, level: number) => {
    stopAll(); setError("");
    if (nextMode === "tigelas") { bowls.current ??= new BowlSynth(); bowls.current.setVolume(level / 100); bowls.current.start(); setPlaying(true); return; }
    if (nextMode === "ambiente") {
      const sound = ambientSounds.find(item => item.id === id) ?? ambientSounds[0];
      try {
        if (await resourceAudioManager.activateFromGesture() && await resourceAudioManager.play(CHANNEL, sound.path)) { resourceAudioManager.setVolume(CHANNEL, level / 100); setPlaying(true); return; }
      } catch { /* cai para a mensagem abaixo */ }
      setError("Som indisponível. Você pode seguir em silêncio."); setPlaying(false);
    }
  }, [stopAll]);

  useEffect(() => () => { resourceAudioManager.stop(CHANNEL); bowls.current?.dispose(); }, []);
  // A pausa da prática também pausa o som e o retoma depois.
  useEffect(() => {
    if (paused) { wasPlaying.current = playing; if (playing) { stopAll(); setPlaying(false); } }
    else if (wasPlaying.current) { wasPlaying.current = false; void start(mode, ambientId, volume); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const choose = (next: Mode) => { setMode(next); if (next === "silencio") { stopAll(); setPlaying(false); } else if (playing) void start(next, ambientId, volume); };
  const toggle = () => { if (mode === "silencio") return; if (playing) { stopAll(); setPlaying(false); } else void start(mode, ambientId, volume); };
  const changeVolume = (value: number) => { setVolume(value); resourceAudioManager.setVolume(CHANNEL, value / 100); bowls.current?.setVolume(value / 100); };

  return <div className="ps-dock">
    <input className="ps-note" aria-label="Uma percepção, se quiser" placeholder="Uma percepção, se quiser…" maxLength={500} value={reflection} onChange={event => onReflection(event.target.value)} />
    <div className="ps-dock-row">
      {!hideSound && <div className="ps-sound" role="group" aria-label="Sons da pausa">
        <div className="ps-modes" role="group" aria-label="Tipo de som">
          {([["silencio", "Silêncio"], ["ambiente", "Ambiente"], ["tigelas", "Tigelas"]] as [Mode, string][]).map(([value, label]) => <button type="button" className="fv-chip" key={value} aria-pressed={mode === value} onClick={() => choose(value)}>{label}</button>)}
        </div>
        {mode === "ambiente" && <select className="ps-select" aria-label="Escolher som ambiente" value={ambientId} onChange={event => { setAmbientId(event.target.value); if (playing) void start("ambiente", event.target.value, volume); }}>{ambientSounds.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>}
        {mode === "tigelas" && <button type="button" className="fv-chip" onClick={() => { bowls.current ??= new BowlSynth(); bowls.current.setVolume(volume / 100); bowls.current.strike(); }}><Bell size={13} aria-hidden="true" />Tocar</button>}
        <button type="button" className="ps-round" disabled={mode === "silencio"} aria-label={playing ? "Pausar som" : "Tocar som"} aria-pressed={playing} onClick={toggle}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}</button>
        <input className="ps-volume" type="range" min="0" max="100" value={volume} aria-label="Volume" disabled={mode === "silencio"} onChange={event => changeVolume(Number(event.target.value))} />
        {error && <span className="ps-error" role="status">{error}</span>}
      </div>}
      <div className="ps-actions" role="group" aria-label="Controles da prática">
        <span className="ps-time" aria-live="off">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
        <button type="button" className="fv-chip" onClick={onTogglePause}>{paused ? "Retomar" : "Pausar"}</button>
        <button type="button" className="fv-chip" onClick={onSwitch}>Trocar prática</button>
        <button type="button" className="fv-chip" onClick={onEndWithout}>Encerrar sem registrar</button>
        <button type="button" className="fv-button" onClick={onEnd}>Encerrar pausa</button>
      </div>
    </div>
  </div>;
}

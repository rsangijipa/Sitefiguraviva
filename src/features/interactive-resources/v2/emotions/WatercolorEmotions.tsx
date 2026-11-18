"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Minus } from "lucide-react";
import type { EditorialItem } from "../editorial-schema";
import { BLOBS, createWatercolor, type WatercolorHandle } from "./watercolor-engine";
import "./watercolor.css";

export interface PickedEmotion { id: string; intensity: number }
export const MAX_EMOTIONS = 12;
const LABELS = ["", "Bem leve", "Leve", "Presente", "Forte", "Muito forte"];

/** Pigmento (aquarela) associado a cada emoção, por posição no acervo. */
export const blobIndexOf = (items: EditorialItem[], id: string) => Math.max(0, items.findIndex(item => item.id === id)) % BLOBS.length;

export function WatercolorEmotions({ items, picked, onChange, motion }: { items: EditorialItem[]; picked: PickedEmotion[]; onChange: (next: PickedEmotion[]) => void; motion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<WatercolorHandle | null>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const pickedRef = useRef(picked);
  const itemsRef = useRef(items);
  const [open, setOpen] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { pickedRef.current = picked; itemsRef.current = items; });

  // Cartões flutuantes acompanham o pigmento a que pertencem (como se fossem parte da aquarela).
  const place = useCallback(() => {
    const handle = engine.current; if (!handle) return;
    const seen: Record<number, number> = {};
    for (const entry of pickedRef.current) {
      const element = cards.current.get(entry.id); if (!element) continue;
      const blob = blobIndexOf(itemsRef.current, entry.id);
      const anchor = handle.anchor(blob); if (!anchor) continue;
      const n = (seen[blob] = (seen[blob] ?? -1) + 1);
      const angle = n * 2.2 + blob;
      const reach = 36 + n * 22 + anchor.scale * 30;
      element.style.transform = `translate(calc(${anchor.x + Math.cos(angle) * reach}px - 50%), calc(${anchor.y + Math.sin(angle) * reach * 0.6}px - 50%))`;
    }
  }, []);

  useEffect(() => {
    const element = canvas.current; if (!element) return;
    try { engine.current = createWatercolor(element, { motion }, place); } catch { setFailed(true); return; }
    return () => { engine.current?.dispose(); engine.current = null; };
    // O motor é criado uma vez; movimento e pesos são atualizados pelos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);
  useEffect(() => { engine.current?.setMotion(motion); }, [motion]);
  useEffect(() => {
    const weights = BLOBS.map(() => 0);
    for (const entry of picked) weights[blobIndexOf(items, entry.id)] += entry.intensity;
    engine.current?.setWeights(weights); place();
  }, [picked, items, place]);

  const pickedOf = (id: string) => picked.find(entry => entry.id === id);
  const toggle = (id: string) => {
    if (!pickedOf(id)) {
      if (picked.length >= MAX_EMOTIONS) return;
      onChange([...picked, { id, intensity: 3 }]); setOpen(id); return;
    }
    setOpen(value => (value === id ? null : id));
  };
  const setIntensity = (id: string, intensity: number) => onChange(picked.map(entry => (entry.id === id ? { ...entry, intensity } : entry)));
  const remove = (id: string) => { onChange(picked.filter(entry => entry.id !== id)); setOpen(null); };
  const titleOf = (id: string) => items.find(item => item.id === id)?.title ?? id;

  return <div className="wc-stage" data-motion={motion}>
    <canvas ref={canvas} className="wc-canvas" role="img" aria-label="Seis aquarelas vivas. Arraste uma mancha para movê-la; elas crescem conforme as emoções que você nomeia." />
    {failed && <p className="wc-fallback" role="status">As aquarelas não puderam ser exibidas neste navegador. Você ainda pode escolher as emoções abaixo.</p>}
    <div className="wc-center" aria-hidden="true"><span className="wc-center-ring" /><span className="wc-center-text">Perceber<br />e nomear</span>{!!picked.length && <small>{picked.length} {picked.length === 1 ? "emoção" : "emoções"}</small>}</div>
    <div className="wc-cards" aria-hidden="true">
      {picked.map(entry => <span key={entry.id} ref={element => { if (element) cards.current.set(entry.id, element); else cards.current.delete(entry.id); }} className="wc-card" data-intensity={entry.intensity} style={{ ["--tint" as string]: BLOBS[blobIndexOf(items, entry.id)].color }}>{titleOf(entry.id)}</span>)}
    </div>
    <div className="wc-strips" role="group" aria-label="Emoções para nomear">
      {items.map(item => {
        const entry = pickedOf(item.id), isOpen = open === item.id && !!entry;
        return <div key={item.id} className="wc-strip" data-picked={!!entry} data-open={isOpen} style={{ ["--tint" as string]: BLOBS[blobIndexOf(items, item.id)].color }}>
          <button type="button" className="wc-strip-main" aria-expanded={isOpen} aria-pressed={!!entry} onClick={() => toggle(item.id)}>
            <span className="wc-dot" aria-hidden="true" />{item.title}{entry && <span className="wc-level" aria-label={`Intensidade ${entry.intensity} de 5`}>{entry.intensity}</span>}
          </button>
          {isOpen && entry && <div className="wc-intensity" role="group" aria-label={`Intensidade de ${item.title}`}>
            <span className="wc-intensity-label">{LABELS[entry.intensity]}</span>
            <div className="wc-scale">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" aria-pressed={entry.intensity === n} aria-label={`Intensidade ${n} de 5: ${LABELS[n]}`} onClick={() => setIntensity(item.id, n)}>{n}</button>)}</div>
            <button type="button" className="wc-remove" onClick={() => remove(item.id)}><Minus size={13} aria-hidden="true" />Retirar</button>
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

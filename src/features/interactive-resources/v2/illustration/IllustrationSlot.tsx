"use client";
import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import type { IllustrationSlotDef } from "./slots";

const RATIOS = { "3:2": "3 / 2", "16:9": "16 / 9", "4:3": "4 / 3", "1:1": "1 / 1", "5:2": "5 / 2" } as const;

/**
 * Espaço reservado para uma ilustração. Mostra o arquivo de `public/` quando
 * ele existe; senão, um quadro vazio identificado (o nome esperado só aparece
 * fora de produção). O conteúdo essencial nunca depende da imagem.
 */
export function IllustrationSlot({ slot, decorative = false, className }: { slot: IllustrationSlotDef; decorative?: boolean; className?: string }) {
  const [missing, setMissing] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A imagem renderizada no servidor pode falhar antes da hidratação, e o onError se perde.
    const element = image.current;
    setMissing(!!element && element.complete && element.naturalWidth === 0);
  }, [slot.path]);
  const style = { aspectRatio: RATIOS[slot.ratio] };
  if (missing) return <div className={`fv-slot fv-slot--empty ${className ?? ""}`} style={style} data-slot={slot.path} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : slot.alt} aria-hidden={decorative || undefined}>
    <ImageIcon size={22} aria-hidden="true" />
    <span>Espaço para ilustração</span>
    {process.env.NODE_ENV !== "production" && <code>{slot.path.replace("/brand/recursos/", "")}</code>}
  </div>;
  return <img ref={image} className={`fv-slot ${className ?? ""}`} style={style} src={slot.path} alt={decorative ? "" : slot.alt} loading="lazy" decoding="async" onError={() => setMissing(true)} data-slot={slot.path} />;
}

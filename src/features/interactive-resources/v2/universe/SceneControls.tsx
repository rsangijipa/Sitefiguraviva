"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, EyeOff, SlidersHorizontal } from "lucide-react";

/** Oculta ou mostra todos os controles sobrepostos de uma cena (o 3D fica livre). */
export function MasterToggle() {
  const [hidden, setHidden] = useState(false);
  return <button type="button" className="fv-chip fv-master" aria-pressed={hidden}
    aria-label={hidden ? "Mostrar controles" : "Ocultar controles"} title={hidden ? "Mostrar controles" : "Ocultar controles"}
    onClick={event => { const next = !hidden; setHidden(next); event.currentTarget.closest("[data-scene-root]")?.setAttribute("data-controls", next ? "hidden" : "shown"); }}>
    {hidden ? <SlidersHorizontal size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />}<span>{hidden ? "Controles" : "Ocultar"}</span>
  </button>;
}

/** Minimiza um painel (`.fv-minimizable`) deixando só o cabeçalho; o conteúdo continua montado. */
export function MinToggle({ label = "painel" }: { label?: string }) {
  const [min, setMin] = useState(false);
  return <button type="button" className="fv-min-toggle" aria-expanded={!min} aria-label={min ? `Expandir ${label}` : `Minimizar ${label}`} title={min ? `Expandir ${label}` : `Minimizar ${label}`}
    onClick={event => { const next = !min; setMin(next); event.currentTarget.closest(".fv-minimizable")?.setAttribute("data-min", String(next)); }}>
    {min ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
  </button>;
}

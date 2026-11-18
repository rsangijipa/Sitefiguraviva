"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { BodyPoint, BODY_REGIONS } from "../contracts";
import { BodySilhouette } from "../illustration/BodySilhouette";
import { webglSupported } from "../universe/webgl-support";
import type { BodyHandle } from "./body-engine";
import type { Side } from "./body-types";
import "./body3d.css";

type Region = typeof BODY_REGIONS[number];
type View = "frente" | "costas";

/** Corpo em 3D (clicável, com frente/costas, lados e halos). Sem WebGL, cai na silhueta 2D acessível. */
export function Body3DView({ view, onViewChange, points, region, side, onSelect, reduced, locked }: {
  view: View; onViewChange: (view: View) => void; points: BodyPoint[]; region: Region; side?: Side; onSelect: (region: Region, side?: Side) => void; reduced: boolean; locked?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<BodyHandle | null>(null);
  const latest = useRef({ onSelect, onViewChange, locked });
  const [status, setStatus] = useState<"loading" | "ready" | "off">("loading");

  useEffect(() => { latest.current = { onSelect, onViewChange, locked }; });
  useEffect(() => {
    const element = host.current; if (!element) return;
    if (!webglSupported()) { setStatus("off"); return; }
    let cancelled = false;
    import("./body-engine").then(({ createBody3D }) => {
      if (cancelled) return;
      try {
        engine.current = createBody3D(element, { onSelect: (r, s) => { if (!latest.current.locked) latest.current.onSelect(r as Region, s); }, onViewChange: v => latest.current.onViewChange(v) }, reduced);
        setStatus("ready");
      } catch { setStatus("off"); }
    }).catch(() => { if (!cancelled) setStatus("off"); });
    return () => { cancelled = true; engine.current?.dispose(); engine.current = null; };
    // O motor é criado uma única vez; as props abaixo são sincronizadas por efeitos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { engine.current?.setReduced(reduced); }, [reduced]);
  useEffect(() => { engine.current?.setView(view); }, [view, status]);
  useEffect(() => { engine.current?.setCurrent(region, side); }, [region, side, status]);
  useEffect(() => { engine.current?.setMarks(points.map(point => ({ region: point.region, side: point.side, view: point.view, intensity: point.intensity }))); }, [points, status]);

  if (status === "off") return <div className="bd-fallback"><BodySilhouette view={view} points={points} current={region} onSelect={part => onSelect(part)} /></div>;
  return <div className="bd-view">
    <div ref={host} className="bd-canvas" role="img" aria-label="Corpo em três dimensões. Toque numa região para escolhê-la; arraste para girar. A lista de regiões ao lado oferece as mesmas opções." />
    {status === "loading" && <p className="bd-loading" role="status">Preparando o corpo…</p>}
    <button type="button" className="bd-reset" onClick={() => { engine.current?.resetCamera(); onViewChange("frente"); }} aria-label="Voltar à frente e reenquadrar"><RotateCcw size={14} aria-hidden="true" />Reenquadrar</button>
  </div>;
}

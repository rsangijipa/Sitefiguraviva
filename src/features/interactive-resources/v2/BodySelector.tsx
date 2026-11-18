"use client";
import { useState, useEffect } from "react";
import { BODY_REGIONS, SENSATIONS, type BodyPoint } from "./contracts";
import { RangeScale, TextField } from "./ui";
import type { EditorialItem } from "./editorial-schema";
import { Body3DView } from "./body3d/Body3DView";
import { isPaired, type Side } from "./body3d/body-types";
import { useResourceMotion } from "./ResourceShell";

type Region = typeof BODY_REGIONS[number];
type View = "frente" | "costas";
const SIDE_LABEL: Record<Side, string> = { direito: "Direito", esquerdo: "Esquerdo" };
const pointKey = (region: Region, view: View, side?: Side) => `${region}|${view}|${side ?? ""}`;
const sameSlot = (point: BodyPoint, region: Region, view: View, side?: Side) => point.region === region && point.view === view && (point.side ?? undefined) === side;

function RegionFields({ region, view, side, point, onRegister, onEdit }: { region: Region; view: View; side?: Side; point?: BodyPoint; onRegister: (point: BodyPoint) => void; onEdit: (point: BodyPoint) => void }) {
  const [sensation, setSensation] = useState<typeof SENSATIONS[number]>(point?.sensation ?? "não sei");
  const [intensity, setIntensity] = useState(point?.intensity ?? 1);
  const [note, setNote] = useState(point?.note ?? "");
  const base = { region, view, ...(side ? { side } : {}) };
  const edit = (patch: Partial<BodyPoint>) => onEdit({ ...base, sensation, intensity, note, ...patch });
  const where = `${region}${side ? ` (${SIDE_LABEL[side].toLowerCase()})` : ""}`;
  return <div className="bd-fields">
    <h3>O que você percebe em {where}?</h3>
    <div className="bd-chips" role="group" aria-label="Sensação">{SENSATIONS.map(item => <button type="button" className="fv-chip" key={item} aria-pressed={sensation === item} onClick={() => { setSensation(item); edit({ sensation: item }); }}>{item}</button>)}</div>
    {sensation === "outra" && <TextField label="Uma sensação nas suas palavras" value={note} onChange={value => { setNote(value); edit({ note: value }); }} />}
    <RangeScale label="Intensidade percebida" min={1} max={5} value={intensity} onChange={value => { setIntensity(value); edit({ intensity: value }); }} ends={["1", "5"]} />
    <button type="button" className="fv-button" onClick={() => onRegister({ ...base, sensation, intensity, note: sensation === "outra" ? note : "" })}>Registrar percepção nesta tela</button>
  </div>;
}

export function BodySelector({ value, onChange, currentRegion, illustrations = [], onPendingChange }: { value: BodyPoint[]; onChange: (points: BodyPoint[]) => void; currentRegion?: Region; illustrations?: EditorialItem[]; onPendingChange?: (points: BodyPoint[]) => void }) {
  const reduced = useResourceMotion();
  const [drafts, setDrafts] = useState<Record<string, BodyPoint>>({});
  useEffect(() => { onPendingChange?.(Object.values(drafts)); }, [drafts, onPendingChange]);
  const [view, setView] = useState<View>("frente");
  const [selected, setSelected] = useState<Region>("cabeça");
  const [side, setSide] = useState<Side | undefined>(undefined);
  const region = currentRegion ?? selected;
  const paired = isPaired(region);
  const activeSide = paired ? side : undefined;
  const art = illustrations.find(item => item.format === view && !!item.asset);
  const choose = (part: Region, chosenSide?: Side) => { setSelected(part); setSide(isPaired(part) ? chosenSide : undefined); };
  const k = pointKey(region, view, activeSide);
  const register = (point: BodyPoint) => {
    setDrafts(previous => { const copy = { ...previous }; delete copy[k]; return copy; });
    onChange([...value.filter(item => !sameSlot(item, region, view, activeSide)), point]);
  };
  const label = (item: BodyPoint) => `${item.region}${item.side ? ` ${item.side}` : ""} · ${item.view}`;
  return <div className="bd-app">
    <div className="bd-layout">
      <div className="bd-figure">
        {art && <img className="fv-art" src={art.asset} alt={art.title} />}
        <Body3DView view={view} onViewChange={setView} points={value} region={region} side={activeSide} reduced={reduced} locked={!!currentRegion} onSelect={(part, s) => { if (!currentRegion) choose(part, s); }} />
        <div className="bd-views" role="group" aria-label="Vista do corpo">{(["frente", "costas"] as const).map(option => <button type="button" className="fv-chip" key={option} aria-pressed={view === option} onClick={() => setView(option)}>{option === "frente" ? "Frente" : "Costas"}</button>)}</div>
      </div>
      <div className="bd-controls">
        {!currentRegion && <div className="bd-regions" role="group" aria-label="Escolher região">{BODY_REGIONS.map(part => <button type="button" className="fv-chip" key={part} aria-pressed={region === part} onClick={() => choose(part, isPaired(part) && part === region ? side : undefined)}>{part}{value.some(item => item.region === part && item.view === view) ? " ✓" : ""}</button>)}</div>}
        {paired && !currentRegion && <div className="bd-sides" role="group" aria-label="Lado do corpo"><span>Lado</span>{([undefined, "direito", "esquerdo"] as (Side | undefined)[]).map(option => <button type="button" className="fv-chip" key={option ?? "ambos"} aria-pressed={side === option} onClick={() => setSide(option)}>{option ? SIDE_LABEL[option] : "Ambos"}</button>)}</div>}
        <RegionFields key={k} region={region} view={view} side={activeSide} point={drafts[k] ?? value.find(point => sameSlot(point, region, view, activeSide))} onEdit={point => setDrafts(previous => ({ ...previous, [k]: point }))} onRegister={register} />
        {!!Object.keys(drafts).length && <p className="fv-note">Há {Object.keys(drafts).length} {Object.keys(drafts).length === 1 ? "região com edição pendente" : "regiões com edições pendentes"}. Use Registrar em cada região para incluir no mapa.</p>}
      </div>
    </div>
    <p className="fv-mode-status" role="status">{value.length ? `${value.length} ${value.length === 1 ? "percepção registrada" : "percepções registradas"} nesta tela.` : "Nenhuma percepção registrada nesta tela."}</p>
    {!!value.length && <ul className="bd-summary">{value.map(item => <li key={pointKey(item.region, item.view, item.side)}><span>{label(item)}: {item.sensation}{item.note ? ` — ${item.note}` : ""}, intensidade {item.intensity} de 5.</span><button type="button" className="fv-chip" onClick={() => onChange(value.filter(point => point !== item))}>Retirar marcação</button></li>)}</ul>}
  </div>;
}

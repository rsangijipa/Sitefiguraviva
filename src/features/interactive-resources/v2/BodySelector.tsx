"use client";
import { useState } from "react";
import { BODY_REGIONS, SENSATIONS, type BodyPoint } from "./contracts";
import { Button, RangeScale, SelectableCard, TextField } from "./ui";
import type {EditorialItem} from "./editorial-schema";
import { BodySilhouette } from "./illustration/BodySilhouette";

export function BodySelector({ value, onChange, currentRegion,illustrations=[] }: { value: BodyPoint[]; onChange: (points: BodyPoint[]) => void; currentRegion?: typeof BODY_REGIONS[number];illustrations?:EditorialItem[] }) {
  const [view, setView] = useState<"frente" | "costas">("frente");
  const [selected, setSelected] = useState<typeof BODY_REGIONS[number]>("cabeça");
  const [sensation, setSensation] = useState<typeof SENSATIONS[number]>("não sei");
  const [intensity, setIntensity] = useState(1);
  const [note, setNote] = useState("");
  const region = currentRegion ?? selected;
  const art=illustrations.find(item=>item.format===view && !!item.asset);
  const choose = (part: typeof BODY_REGIONS[number]) => { setSelected(part); const old = value.find(item => item.region === part && item.view === view); setSensation(old?.sensation ?? "não sei"); setIntensity(old?.intensity ?? 1); setNote(old?.note ?? ""); };
  const register = () => {
    const point: BodyPoint = { region, view, sensation, intensity, note };
    onChange([...value.filter(item => item.region !== region || item.view !== view), point]);
  };
  return <div>
    <div className="fv-body-layout">
      <div className="fv-body-figure">
        {/* Arte licenciada da equipe substitui a silhueta provisória quando existir. */}
        {art ? <img className="fv-art" src={art.asset} alt={art.title}/> : <BodySilhouette view={view} points={value} current={region} onSelect={part => { if (!currentRegion) choose(part); }} />}
        <div className="fv-options" role="group" aria-label="Vista do corpo">{(["frente","costas"] as const).map(side => <SelectableCard key={side} label={side === "frente" ? "Frente" : "Costas"} selected={view === side} onSelect={() => setView(side)} />)}</div>
      </div>
      <div>
    {!currentRegion && <><h3>Regiões do corpo</h3><div className="fv-options" role="group" aria-label="Escolher região">{BODY_REGIONS.map(part => <SelectableCard key={part} label={part} selected={region === part} onSelect={() => choose(part)} />)}</div></>}
    <h3 style={{marginTop:24}}>O que você percebe em {region}?</h3>
    <div className="fv-options" role="group" aria-label="Sensação">{SENSATIONS.map(item => <SelectableCard key={item} label={item} selected={sensation === item} onSelect={() => setSensation(item)} />)}</div>
    {sensation === "outra" && <TextField label="Uma sensação nas suas palavras" value={note} onChange={setNote} />}
    <RangeScale label="Intensidade percebida" min={1} max={5} value={intensity} onChange={setIntensity} ends={["1","5"]} />
    <Button onClick={register}>Registrar percepção nesta tela</Button>
      </div>
    </div>
    {!!value.length && <ul className="fv-list" style={{marginTop:24}}>{value.map(item => <li key={item.region+item.view}>{item.region} · {item.view}: {item.sensation}{item.note ? ` — ${item.note}` : ""}, intensidade {item.intensity} de 5. <Button secondary onClick={() => onChange(value.filter(point => point !== item))}>Retirar marcação</Button></li>)}</ul>}
  </div>;
}

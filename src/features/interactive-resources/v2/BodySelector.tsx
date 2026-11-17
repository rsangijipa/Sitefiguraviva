"use client";
import { useState,useEffect } from "react";
import { BODY_REGIONS, SENSATIONS, type BodyPoint } from "./contracts";
import { Button, RangeScale, SelectableCard, TextField } from "./ui";
import type {EditorialItem} from "./editorial-schema";
import { BodySilhouette } from "./illustration/BodySilhouette";

function RegionFields({region,view,point,onRegister,onEdit}:{region:typeof BODY_REGIONS[number];view:"frente"|"costas";point?:BodyPoint;onRegister:(point:BodyPoint)=>void;onEdit:(point:BodyPoint)=>void}) {
  const [sensation,setSensation]=useState<typeof SENSATIONS[number]>(point?.sensation ?? "não sei");
  const [intensity,setIntensity]=useState(point?.intensity ?? 1);
  const [note,setNote]=useState(point?.note ?? "");
  const edit=(patch:Partial<BodyPoint>)=>onEdit({region,view,sensation,intensity,note,...patch});
  return <>
    <h3>O que você percebe em {region}?</h3>
    <p className="fv-support">Vista: {view}. Use o botão abaixo para registrar esta percepção nesta tela.</p>
    <div className="fv-options" role="group" aria-label="Sensação">{SENSATIONS.map(item=><SelectableCard key={item} label={item} selected={sensation===item} onSelect={()=>{setSensation(item);edit({sensation:item});}}/>)}</div>
    {sensation==="outra" && <TextField label="Uma sensação nas suas palavras" value={note} onChange={value=>{setNote(value);edit({note:value});}}/>}
    <RangeScale label="Intensidade percebida" min={1} max={5} value={intensity} onChange={value=>{setIntensity(value);edit({intensity:value});}} ends={["1","5"]}/>
    <Button onClick={()=>onRegister({region,view,sensation,intensity,note:sensation==="outra" ? note : ""})}>Registrar percepção nesta tela</Button>
  </>;
}

export function BodySelector({ value, onChange, currentRegion,illustrations=[],onPendingChange }: { value: BodyPoint[]; onChange: (points: BodyPoint[]) => void; currentRegion?: typeof BODY_REGIONS[number];illustrations?:EditorialItem[];onPendingChange?:(points:BodyPoint[])=>void }) {
  const [drafts,setDrafts]=useState<Record<string,BodyPoint>>({});
  useEffect(()=>{onPendingChange?.(Object.values(drafts));},[drafts,onPendingChange]);
  const [view, setView] = useState<"frente" | "costas">("frente");
  const [selected, setSelected] = useState<typeof BODY_REGIONS[number]>("cabeça");
  const region = currentRegion ?? selected;
  const art=illustrations.find(item=>item.format===view && !!item.asset);
  const choose = (part: typeof BODY_REGIONS[number]) => setSelected(part);
  const register = (point:BodyPoint) => {
    setDrafts(previous=>{const copy={...previous};delete copy[region+view];return copy;});
    onChange([...value.filter(item => item.region !== region || item.view !== view), point]);
  };
  return <div>
    <div className="fv-body-layout">
      <div className="fv-body-figure"><span className="fv-label">Corpo completo · {view}</span>
        {/* Arte licenciada da equipe substitui a silhueta provisória quando existir. */}
        {art && <img className="fv-art" src={art.asset} alt={art.title}/>}
        <BodySilhouette view={view} points={value} current={region} onSelect={part => { if (!currentRegion) choose(part); }} />
        <div className="fv-options" role="group" aria-label="Vista do corpo">{(["frente","costas"] as const).map(side => <SelectableCard key={side} label={side === "frente" ? "Frente" : "Costas"} selected={view === side} onSelect={() => setView(side)} />)}</div>
      </div>
      <div className="fv-body-controls">
    {!currentRegion && <><h3>Regiões do corpo</h3><div className="fv-body-regions" role="group" aria-label="Escolher região">{BODY_REGIONS.map(part => <button type="button" key={part} aria-pressed={region===part} onClick={()=>choose(part)}>{part}{value.some(item=>item.region===part && item.view===view) ? " ✓" : ""}</button>)}</div></>}
    <RegionFields key={`${region}-${view}`} region={region} view={view} point={drafts[region+view] ?? value.find(point=>point.region===region && point.view===view)} onEdit={point=>setDrafts(previous=>({...previous,[region+view]:point}))} onRegister={register}/>
    {!!Object.keys(drafts).length && <p className="fv-note">Há {Object.keys(drafts).length} {Object.keys(drafts).length===1 ? "região com edição pendente" : "regiões com edições pendentes"}. Use Registrar em cada região para incluir no mapa.</p>}
      </div>
    </div>
    <p className="fv-mode-status" role="status">{value.length ? `${value.length} ${value.length===1 ? "percepção registrada" : "percepções registradas"} nesta tela.` : "Nenhuma percepção registrada nesta tela."}</p>
    {!!value.length && <ul className="fv-body-summary">{value.map(item => <li key={item.region+item.view}>{item.region} · {item.view}: {item.sensation}{item.note ? ` — ${item.note}` : ""}, intensidade {item.intensity} de 5. <Button secondary onClick={() => onChange(value.filter(point => point !== item))}>Retirar marcação</Button></li>)}</ul>}
  </div>;
}

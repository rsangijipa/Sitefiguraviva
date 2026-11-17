"use client";
import { useState } from "react";
import { BODY_REGIONS, type BodyPoint } from "./contracts";
import { BodySelector } from "./BodySelector";
import { Button, TextField, TextArea, RangeScale, SelectableCard, EmptyContent, ReferenceLine } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import type { EditorialItem } from "./editorial-schema";
import { EmotionWheel } from "./EmotionWheel";
import {ExperienceIntro} from "./immersive/ExperienceIntro";
import {NeedsCards} from "./immersive/NeedsCards";
import "./immersive/immersive.css";
import { TwoChairsArt } from "./illustration/scenes";

// Exemplos tocáveis (guia, seção 5.6); a pessoa pode nomear os lados livremente.
const POLE_EXAMPLES: [string,string][] = [["dominador","dominado"],["aproximar","afastar"],["controlar","soltar"],["o que exige","o que resiste"]];

function ItemSelection({ items, value, onChange, max = 1 }: { items: EditorialItem[]; value: string[]; onChange: (ids: string[]) => void; max?: number }) {
  return !items.length ? <p className="fv-support">As opções deste acervo aguardam revisão docente. Você pode pular esta etapa.</p> :
    <><div className="fv-options" role="group" aria-label="Opções do acervo revisado">{items.map(item => <SelectableCard key={item.id} label={item.title} selected={value.includes(item.id)} onSelect={() => onChange(value.includes(item.id) ? value.filter(id => id !== item.id) : max === 1 ? [item.id] : value.length < max ? [...value,item.id] : value)}><span>{item.text}</span></SelectableCard>)}</div>{max>1 && <p className="fv-mode-status" role="status">{value.length} de {max} escolhidas.{value.length>=max ? " Limite atingido. Retire uma escolha para selecionar outra." : ""}</p>}</>;
}
export {ArrivalExperience} from "./arrival/ArrivalExperience";
/** Fechamento descritivo (guia 5.2): só o que foi marcado, nas palavras da interface, sem padrões nem recomendações. */
const IN: Record<string,string> = { "cabeça":"na cabeça","pescoço":"no pescoço",ombros:"nos ombros",peito:"no peito","abdômen":"no abdômen","braços":"nos braços","mãos":"nas mãos",quadril:"no quadril",pernas:"nas pernas","pés":"nos pés" };
export function describeBody(points: BodyPoint[]) {
  const parts = points.filter(point => point.sensation !== "não sei").map(point => `${point.sensation === "outra" ? point.note || "outra sensação" : point.sensation} ${IN[point.region] ?? point.region}`);
  if (!parts.length) return "";
  return `Você notou ${parts.length > 1 ? `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}` : parts[0]}.`;
}
export function BodyExperience(props: ExperienceProps) {
  const [pending,setPending]=useState<BodyPoint[]>([]);
  const [regions,setRegions] = useState<BodyPoint[]>([]); const [index,setIndex] = useState(0);
  const mode = props.mode === "percorrer" ? "percorrer" : "mapear";
  const payload = { regions,mode };
  useExperienceDraft({...payload,pending},props.onDraft);
  return <div className="im-body"><div className="bm-intro"><h2>{mode === "percorrer" ? `Percorrer: ${BODY_REGIONS[index]}` : "Um mapa do que você percebe"}</h2><p>1. Escolha uma região · 2. Perceba uma sensação · 3. Registre no mapa</p></div><BodySelector onPendingChange={setPending} value={regions} onChange={setRegions} illustrations={props.version?.configuration.items} currentRegion={mode==="percorrer" ? BODY_REGIONS[index] : undefined} />
    {!!describeBody(regions) && <p className="fv-mode-status" aria-live="polite">{describeBody(regions)}</p>}
    {mode==="percorrer" && <p className="fv-note">O roteiro permanece em texto. Áudio docente aparece quando houver gravação revisada e licenciada.</p>}
    <div className="fv-actions">{mode==="percorrer" && index<BODY_REGIONS.length-1 ? <><Button onClick={() => setIndex(index+1)}>Próxima região</Button><Button secondary onClick={() => setIndex(index+1)}>Pular região</Button></> : <Button onClick={() => props.onComplete(payload)}>Concluir percepção</Button>}{index>0 && mode==="percorrer" && <Button secondary onClick={() => setIndex(index-1)}>Região anterior</Button>}</div>
  </div>;
}
export function EmotionExperience(props: ExperienceProps) {
  const [listOnly,setListOnly] = useState(props.mode==="lista");
  const [emotionId,setEmotion] = useState(""); const [intensity,setIntensity] = useState(1); const [reflection,setReflection] = useState("");
  const payload = { emotionId,intensity,reflection };
  useExperienceDraft(payload,props.onDraft);
  const items = props.version?.configuration.items.filter(item => item.kind==="emotion") ?? [];
  if (!items.length) return <EmptyContent />;
  const item = items.find(value => value.id===emotionId);
  return <><ExperienceIntro asset="emocoes/orbita" title="Encontre uma palavra, se quiser" description="Explore a roda em 3D ou use a lista. As cores e posições não classificam as emoções."/><div className="im-toolbar"><Button secondary aria-pressed={listOnly} onClick={()=>setListOnly(value=>!value)}>{listOnly?"Ver a roda":"Usar apenas a lista"}</Button></div><div className="im-columns">{!listOnly && <EmotionWheel items={items} selected={emotionId} onSelect={setEmotion}/>}<div className="im-panel"><p className="fv-mode-status" role="status">{item ? `Emoção escolhida: ${item.title}.` : "Nenhuma emoção escolhida. Você pode seguir sem escolher."}</p><ItemSelection items={items} value={emotionId ? [emotionId] : []} onChange={ids => setEmotion(ids[0] ?? "")} /><RangeScale label="Intensidade" min={1} max={5} value={intensity} onChange={setIntensity} ends={["Mais leve","Mais intensa"]} /><p className="fv-support">Intensidade percebida: {intensity} de 5.</p><TextArea label="Uma percepção, se quiser" value={reflection} onChange={setReflection} />{item && <ReferenceLine item={item} />}<div className="fv-actions"><Button onClick={() => props.onComplete(payload)}>Concluir</Button><Button secondary onClick={() => props.onComplete(null)}>Não sei · encerrar sem registrar</Button></div></div></div></>;
}
export function NeedsExperience(props: ExperienceProps) {
  const [ids,setIds] = useState<string[]>([]); const [reflection,setReflection] = useState("");
  const [listOnly,setListOnly]=useState(false);
  const payload = { ids,reflection }; useExperienceDraft(payload,props.onDraft);
  const items = props.version?.configuration.items.filter(item => item.kind==="need") ?? [];
  if (!items.length) return <EmptyContent />;
  const toggle=(id:string)=>setIds(values=>values.includes(id) ? values.filter(value=>value!==id) : values.length<3 ? [...values,id] : values);
  return <><ExperienceIntro asset="necessidades/jardim" title="Que necessidades aparecem agora?" description="Escolha até três possibilidades. Você pode retirar uma escolha, trocar ou seguir sem escolher."/><div className="im-toolbar"><Button secondary aria-pressed={listOnly} onClick={()=>setListOnly(value=>!value)}>{listOnly ? "Ver cartas 3D" : "Usar lista simples"}</Button><span>Sem ordem de importância</span></div>
  {listOnly ? <ItemSelection items={items} value={ids} onChange={setIds} max={3}/> : <><NeedsCards items={items} selected={ids} onSelect={toggle}/><p className="fv-mode-status" role="status">{ids.length} de 3 escolhidas.{ids.length>=3 ? " Limite atingido. Retire uma escolha para selecionar outra." : ""}</p></>}
  {!!ids.length && <ul className="im-selected" aria-label="Necessidades escolhidas">{ids.map(id=><li key={id}><button type="button" onClick={()=>toggle(id)} aria-label={`Retirar ${items.find(item=>item.id===id)?.title}`}>{items.find(item=>item.id===id)?.title} ×</button></li>)}</ul>}
  <TextArea label="Uma percepção nas suas palavras" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete(payload)}>Concluir</Button><Button secondary onClick={() => props.onComplete({ids:[],reflection})}>Não sei</Button></div></>;
}
export function PolarityExperience(props: ExperienceProps) {
  const [names,setNames] = useState<[string,string]>(["",""]); const [position,setPosition] = useState(5);
  const [side,setSide] = useState<0|1>(0); const [text,setText] = useState("");
  const [turns,setTurns] = useState<{side:0|1;text:string}[]>([]); const [reflection,setReflection] = useState("");
  const payload = { names,position,turns: text.trim() && turns.length<12 ? [...turns,{side,text}] : turns,reflection }; useExperienceDraft(payload,props.onDraft);
  const add = () => { if(text.trim() && turns.length<12) { setTurns(values => [...values,{side,text}]); setText(""); setSide(side===0 ? 1 : 0); } };
  return <><TwoChairsArt /><h2>Como você nomeia os dois lados?</h2><p className="fv-note">Este é um experimento de escrita da formação. Ele não substitui a cadeira vazia conduzida em processo terapêutico.</p>
    <TextField label="Primeiro lado" value={names[0]} maxLength={60} onChange={value => setNames([value,names[1]])} /><TextField label="Segundo lado" value={names[1]} maxLength={60} onChange={value => setNames([names[0],value])} />
    <div className="fv-field"><span>Exemplos, se quiser</span><div className="fv-actions fv-chips" role="group" aria-label="Exemplos de polos">{POLE_EXAMPLES.map(([first,second]) => <Button key={first} secondary aria-pressed={names[0]===first && names[1]===second} onClick={() => setNames([first,second])}>{first} / {second}</Button>)}</div></div>
    {props.mode === "dialogo" ? <><p className="fv-mode-status" aria-live="polite">Cadeira ativa: <strong>{names[side] || `lado ${side+1}`}</strong> · {turns.length} de 12 falas registradas.{turns.length>=12 ? " Você pode revisar suas falas ou concluir." : ""}</p><div className="fv-options">{([0,1] as const).map(index => <SelectableCard key={index} label={names[index] || `Lado ${index+1}`} selected={side===index} onSelect={() => setSide(index)} />)}</div><div onKeyDown={event => { if(event.key==="Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); add(); } }}><TextArea label={`Escrever como ${names[side] || `lado ${side+1}`}`} value={text} onChange={setText} /></div><p className="fv-support">Atalho: Ctrl + Enter registra a fala e troca de cadeira.</p><Button onClick={add} disabled={!text.trim() || turns.length>=12}>Registrar fala e trocar de lado</Button><ul className="fv-list">{turns.map((turn,index) => <li key={index}><strong>{names[turn.side] || `Lado ${turn.side+1}`}</strong><TextArea label={`Revisar fala ${index+1}`} value={turn.text} onChange={value=>setTurns(values=>values.map((entry,position)=>position===index ? {...entry,text:value} : entry))}/></li>)}</ul></> : <RangeScale label="Onde você se percebe agora?" value={position} onChange={setPosition} ends={[names[0]||"Primeiro lado",names[1]||"Segundo lado"]} />}
    <TextArea label="O que cada lado ouviu do outro?" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete({...payload,turns:text.trim() && turns.length<12 ? [...turns,{side,text}] : turns})}>Concluir</Button><Button secondary onClick={() => props.onComplete(payload)}>Parar</Button></div>
  </>;
}

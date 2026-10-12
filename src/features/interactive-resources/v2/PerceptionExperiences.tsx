"use client";
import { useState } from "react";
import { BODY_REGIONS, type BodyPoint } from "./contracts";
import { BodySelector } from "./BodySelector";
import { Button, TextField, TextArea, RangeScale, SelectableCard, EmptyContent, ReferenceLine } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import type { EditorialItem } from "./editorial-schema";
import { EmotionWheel } from "./EmotionWheel";
import { TwoChairs } from "./illustration/scenes";

function ItemSelection({ items, value, onChange, max = 1 }: { items: EditorialItem[]; value: string[]; onChange: (ids: string[]) => void; max?: number }) {
  return !items.length ? <p className="fv-support">As opções deste acervo aguardam revisão docente. Você pode pular esta etapa.</p> :
    <div className="fv-options" role="group" aria-label="Opções do acervo revisado">{items.map(item => <SelectableCard key={item.id} label={item.title} selected={value.includes(item.id)} onSelect={() => onChange(value.includes(item.id) ? value.filter(id => id !== item.id) : max === 1 ? [item.id] : value.length < max ? [...value,item.id] : value)}><span>{item.text}</span></SelectableCard>)}</div>;
}
export function ArrivalExperience(props: ExperienceProps) {
  const [chosen, setChosen] = useState(["palavra","corpo","emocao","intensidade","necessidade","permanencia"]);
  const [step, setStep] = useState(-1);
  const [word,setWord] = useState(""); const [body,setBody] = useState<BodyPoint[]>([]);
  const [emotion,setEmotion] = useState(""); const [intensity,setIntensity] = useState<number|null>(null);
  const [needs,setNeeds] = useState<string[]>([]); const [reflection,setReflection] = useState("");
  const payload = { word,body,emotion,intensity,needs,reflection };
  useExperienceDraft(payload,props.onDraft);
  const steps = props.mode === "breve" ? ["palavra","intensidade"] : chosen;
  const labels: Record<string,string> = { palavra:"Palavra",corpo:"Corpo",emocao:"Emoção",intensidade:"Intensidade",necessidade:"Necessidade",permanencia:"Permanência" };
  const current = steps[step];
  const next = () => step + 1 >= steps.length ? props.onComplete(payload) : setStep(step+1);
  if (step < 0) return <><h2>Como você chega agora?</h2><p>Escolha as etapas que fazem sentido. Tudo é opcional.</p>{props.mode !== "breve" && <div className="fv-options">{Object.entries(labels).map(([key,label]) => <SelectableCard key={key} label={label} selected={chosen.includes(key)} onSelect={() => setChosen(values => Object.keys(labels).filter(id => id === key ? !values.includes(id) : values.includes(id)))} />)}</div>}<div className="fv-actions"><Button onClick={() => steps.length ? setStep(0) : props.onComplete(payload)}>Começar</Button><Button secondary onClick={() => props.onComplete(payload)}>Encerrar sem responder</Button></div></>;
  return <><div className="fv-progress"><span>Etapa {step+1} de {steps.length}</span><ol aria-label="Progresso">{steps.map((id,index) => <li key={id} data-done={index<step} aria-label={`${labels[id]}: ${index<step ? "concluída" : "por percorrer"}`} />)}</ol></div>
    {current === "palavra" && <><h2>Uma palavra para este momento</h2><TextField label="Como você chega agora?" value={word} onChange={setWord} /><div className="fv-options">{["Sons ao redor","Minha respiração","Silêncio presente","Toque dos pés no chão"].map(text => <SelectableCard key={text} label={text} selected={word===text} onSelect={() => setWord(text)} />)}</div></>}
    {current === "corpo" && <><h2>O que você percebe no corpo?</h2><BodySelector value={body} onChange={setBody} /></>}
    {current === "emocao" && <><h2>Que emoção aparece?</h2><ItemSelection items={props.emotions} value={emotion ? [emotion] : []} onChange={ids => setEmotion(ids[0] ?? "")} /></>}
    {current === "intensidade" && <><h2>Que intensidade você percebe?</h2><RangeScale label="Intensidade" value={intensity ?? 0} onChange={setIntensity} /><Button secondary onClick={() => setIntensity(null)}>Não sei</Button></>}
    {current === "necessidade" && <><h2>Alguma necessidade se apresenta?</h2><p>Escolha até três, se quiser.</p><ItemSelection items={props.needs} value={needs} onChange={setNeeds} max={3} /></>}
    {current === "permanencia" && <><h2>O que acontece quando você permanece alguns instantes com isso?</h2><TextArea label="Nas suas palavras, se quiser" value={reflection} onChange={setReflection} /></>}
    <div className="fv-actions"><Button onClick={next}>{step+1===steps.length ? "Concluir chegada" : "Continuar"}</Button><Button secondary onClick={next}>Pular</Button>{step>0 && <Button secondary onClick={() => setStep(step-1)}>Voltar à etapa anterior</Button>}</div>
  </>;
}
export function BodyExperience(props: ExperienceProps) {
  const [regions,setRegions] = useState<BodyPoint[]>([]); const [index,setIndex] = useState(0);
  const mode = props.mode === "percorrer" ? "percorrer" : "mapear";
  const payload = { regions,mode };
  useExperienceDraft(payload,props.onDraft);
  return <><h2>{mode === "percorrer" ? `Percorrer: ${BODY_REGIONS[index]}` : "Perceber o corpo"}</h2>
    <p>Você pode não perceber uma região. “Não sei” também cabe aqui.</p><BodySelector value={regions} onChange={setRegions} illustrations={props.version?.configuration.items} currentRegion={mode==="percorrer" ? BODY_REGIONS[index] : undefined} />
    {mode==="percorrer" && <p className="fv-note">O roteiro permanece em texto. Áudio docente aparece quando houver gravação revisada e licenciada.</p>}
    <div className="fv-actions">{mode==="percorrer" && index<BODY_REGIONS.length-1 ? <><Button onClick={() => setIndex(index+1)}>Próxima região</Button><Button secondary onClick={() => setIndex(index+1)}>Pular região</Button></> : <Button onClick={() => props.onComplete(payload)}>Concluir percepção</Button>}{index>0 && mode==="percorrer" && <Button secondary onClick={() => setIndex(index-1)}>Região anterior</Button>}</div>
  </>;
}
export function EmotionExperience(props: ExperienceProps) {
  const [listOnly,setListOnly] = useState(props.mode==="lista");
  const [emotionId,setEmotion] = useState(""); const [intensity,setIntensity] = useState(1); const [reflection,setReflection] = useState("");
  const payload = { emotionId,intensity,reflection };
  useExperienceDraft(payload,props.onDraft);
  const items = props.version?.configuration.items.filter(item => item.kind==="emotion") ?? [];
  if (!items.length) return <EmptyContent />;
  const item = items.find(value => value.id===emotionId);
  return <><h2>Encontre uma palavra, se quiser</h2><Button secondary aria-pressed={listOnly} onClick={()=>setListOnly(value=>!value)}>{listOnly?"Ver a roda":"Usar apenas a lista"}</Button>{!listOnly && <EmotionWheel items={items} selected={emotionId} onSelect={setEmotion}/>}<ItemSelection items={items} value={emotionId ? [emotionId] : []} onChange={ids => setEmotion(ids[0] ?? "")} /><RangeScale label="Intensidade" min={1} max={5} value={intensity} onChange={setIntensity} ends={["1","5"]} /><TextArea label="Uma percepção, se quiser" value={reflection} onChange={setReflection} />{item && <ReferenceLine item={item} />}<div className="fv-actions"><Button onClick={() => props.onComplete(payload)}>Concluir</Button><Button secondary onClick={() => props.onComplete(null)}>Não sei · encerrar sem registrar</Button></div></>;
}
export function NeedsExperience(props: ExperienceProps) {
  const [ids,setIds] = useState<string[]>([]); const [reflection,setReflection] = useState("");
  const payload = { ids,reflection }; useExperienceDraft(payload,props.onDraft);
  const items = props.version?.configuration.items.filter(item => item.kind==="need") ?? [];
  if (!items.length) return <EmptyContent />;
  return <><h2>Que necessidades aparecem agora?</h2><p>Escolha até três. Você também pode seguir sem escolher.</p><ItemSelection items={items} value={ids} onChange={setIds} max={3} /><TextArea label="Uma percepção nas suas palavras" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete(payload)}>Concluir</Button><Button secondary onClick={() => props.onComplete({ids:[],reflection})}>Não sei</Button></div></>;
}
export function PolarityExperience(props: ExperienceProps) {
  const [names,setNames] = useState<[string,string]>(["",""]); const [position,setPosition] = useState(5);
  const [side,setSide] = useState<0|1>(0); const [text,setText] = useState("");
  const [turns,setTurns] = useState<{side:0|1;text:string}[]>([]); const [reflection,setReflection] = useState("");
  const payload = { names,position,turns,reflection }; useExperienceDraft(payload,props.onDraft);
  const add = () => { if(text.trim() && turns.length<12) { setTurns(values => [...values,{side,text}]); setText(""); setSide(side===0 ? 1 : 0); } };
  return <><h2>Como você nomeia os dois lados?</h2><p className="fv-note">Este é um experimento de escrita da formação. Ele não substitui a cadeira vazia conduzida em processo terapêutico.</p>
    <TextField label="Primeiro lado" value={names[0]} maxLength={60} onChange={value => setNames([value,names[1]])} /><TextField label="Segundo lado" value={names[1]} maxLength={60} onChange={value => setNames([names[0],value])} />
    {props.mode === "dialogo" ? <><TwoChairs active={side} names={names} /><div className="fv-options">{([0,1] as const).map(index => <SelectableCard key={index} label={names[index] || `Lado ${index+1}`} selected={side===index} onSelect={() => setSide(index)} />)}</div><TextArea label={`Escrever como ${names[side] || `lado ${side+1}`}`} value={text} onChange={setText} /><Button onClick={add} disabled={!text.trim() || turns.length>=12}>Registrar fala e trocar de lado</Button><ul className="fv-list">{turns.map((turn,index) => <li key={index}><strong>{names[turn.side] || `Lado ${turn.side+1}`}</strong><p>{turn.text}</p></li>)}</ul></> : <RangeScale label="Onde você se percebe agora?" value={position} onChange={setPosition} ends={[names[0]||"Primeiro lado",names[1]||"Segundo lado"]} />}
    <TextArea label="O que cada lado ouviu do outro?" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete({...payload,turns:text.trim() && turns.length<12 ? [...turns,{side,text}] : turns})}>Concluir</Button><Button secondary onClick={() => props.onComplete(payload)}>Parar</Button></div>
  </>;
}

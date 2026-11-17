"use client";
import { useState } from "react";
import { Button, TextArea, SelectableCard, EmptyContent, ReferenceLine } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import { ContactBoundary } from "./illustration/scenes";
import { useDiscardConfirmation } from "./useDiscardConfirmation";
import {InteractiveCycle} from "./cycle/InteractiveCycle";
import "./cycle/cycle.css";
import {FigureGroundStudies} from "./figure-ground/FigureGroundStudies";

export {CardsExperience} from "./cards/CardsExperience";

type Layer = "figura" | "fundo";
/**
 * Figura e Fundo (seções 7.3 e 8 do guia):
 * - perceptivo: estudos visuais originais, sem interpretação de respostas;
 * - clínico: "Mesa posta" quando a rodada traz necessidades (alternativas):
 *   a figura muda conforme a necessidade escolhida;
 * - sessão: "Figura na sessão": cada trecho é marcado como figura ou fundo.
 */
export function FigureExperience(props: ExperienceProps) {
  return props.mode==="perceptivo" ? <FigureGroundStudies {...props}/> : <EditorialFigureExperience {...props}/>;
}
function EditorialFigureExperience(props: ExperienceProps) {
  const [index,setIndex] = useState(0); const [selected,setSelected] = useState("");
  const [need,setNeed] = useState(""); const [layers,setLayers] = useState<Record<string,Layer>>({});
  const [reflection,setReflection] = useState(""); const [compare,setCompare] = useState(false);
  const {requestChange,confirmation}=useDiscardConfirmation();
  const hasResponse=!!(selected || need || Object.keys(layers).length || reflection.trim());
  useExperienceDraft({index,selected,need,layers,reflection},props.onDraft);
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===props.mode);
  const current=items[index];
  if(!current) return <EmptyContent />;
  const next=() => requestChange(hasResponse,()=>{setIndex(index+1);setSelected("");setNeed("");setLayers({});setReflection("");setCompare(false);});
  const chosen=current.segments.find(item => item.id===selected);
  const chosenNeed=current.alternatives.find(item => item.id===need);
  const session=props.mode==="sessao";
  const marked=Object.keys(layers).length;
  return <>{confirmation}<p className="fv-tag">Rodada {index+1} de {items.length} · situação fictícia</p><h2>{current.title}</h2>
    <div>
      <div><p className="fv-summary">{current.text}</p>
        {!!current.alternatives.length && <><h3>Mesa posta: com qual necessidade você chega?</h3><div className="fv-options" role="group" aria-label="Necessidade">{current.alternatives.map(item => <SelectableCard key={item.id} label={item.text} selected={need===item.id} onSelect={() => setNeed(item.id)} />)}</div>
          {chosenNeed && <p className="fv-note" aria-live="polite">Com {chosenNeed.text.toLocaleLowerCase("pt-BR")}, costuma virar figura: <strong>{chosenNeed.comment}</strong></p>}</>}
        <p>{current.prompt}</p>
        {session ? <ul className="fv-list fv-layer-list" aria-label="Trechos da sessão">{current.segments.map(item => <li key={item.id}><p>{item.text}</p>
            <div className="fv-actions fv-layer-toggle" role="group" aria-label={`Camada de: ${item.text}`}>{(["figura","fundo"] as const).map(layer => <Button key={layer} secondary aria-pressed={layers[item.id]===layer} onClick={() => setLayers(values => ({...values,[item.id]:layer}))}>{layer==="figura" ? "Figura" : "Fundo"}</Button>)}</div></li>)}</ul>
          : <><div className="fv-options" role="group" aria-label="Elementos do campo">{current.segments.map(item => <SelectableCard key={item.id} label={item.text} selected={selected===item.id} onSelect={() => {setSelected(item.id);setCompare(false);}} />)}</div>
            <p className="fv-mode-status" aria-live="polite">{chosen ? <>Figura agora: <strong>{chosen.text}</strong>. O restante continua no campo, como fundo.</> : "Escolha o que se destaca para você."}</p></>}
        {session && <p className="fv-mode-status" aria-live="polite">{marked} de {current.segments.length} trechos marcados. Não há marcação certa.</p>}
      </div></div>
    <TextArea label="O que apareceu como figura para você?" value={reflection} onChange={setReflection} />
    {compare && <section><h3>Leitura docente para comparar</h3><p>{current.teacherResponse}</p></section>}<ReferenceLine item={current} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length ? <Button onClick={next}>Próxima rodada</Button> : <Button onClick={() => props.onComplete(null)}>Concluir</Button>}<Button secondary onClick={() => props.onComplete(null)}>Pular e encerrar</Button></div></>;
}
/** Ciclo do Contato (seção 8): lentes com referência própria e "Onde o ciclo se interrompeu?". */
export function CycleExperience(props: ExperienceProps) {
  const [model,setModel] = useState<"zinker"|"phg"|"ribeiro">("zinker"); const [index,setIndex] = useState(0);
  const [sequence,setSequence] = useState<string[]>([]); const [interruption,setInterruption] = useState(""); const [reflection,setReflection] = useState(""); const [compare,setCompare] = useState(false);
  const {requestChange,confirmation}=useDiscardConfirmation();
  const hasResponse=!!(sequence.length || interruption || reflection.trim());
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===model);
  const item=items[index]; const payload={itemId:item?.id ?? "",model,sequence,reflection:[interruption && `Interrupção percebida: ${item?.segments.find(phase => phase.id===interruption)?.text ?? ""}`,reflection].filter(Boolean).join("\n").slice(0,500)}; useExperienceDraft(payload,props.onDraft);
  if(!(props.version?.configuration.items.length)) return <EmptyContent />;
  const reset=() => {setSequence([]);setInterruption("");setReflection("");setCompare(false);};
  const toggle=(id:string)=>setSequence(values=>values.includes(id) ? values.filter(value=>value!==id) : [...values,id]);
  return <div className="cy-app">{confirmation}<div className="cy-models"><div><span className="fv-label">Modelo de estudo</span><h2>Escolha uma lente</h2></div><div className="cy-model-options" role="group" aria-label="Modelo do ciclo">{(["zinker","phg","ribeiro"] as const).map(id=><button type="button" key={id} aria-pressed={model===id} onClick={()=>{if(id!==model)requestChange(hasResponse,()=>{setModel(id);setIndex(0);reset();});}}>{id==="zinker" ? "Zinker" : id==="phg" ? "PHG" : "Jorge Ponciano Ribeiro"}</button>)}</div></div>
  {item ? <><div className="cy-workspace"><section className="cy-situation" aria-labelledby="cy-situation-title">{item.id==="zinker-1" && <img src="/brand/recursos/ciclo/sala-reuniao.webp" alt="" className="cy-room"/>}<div className="cy-situation-copy"><span className="fv-label">Situação {index+1} de {items.length} · estudo fictício</span><h2 id="cy-situation-title">{item.title}</h2><p>{item.text}</p><p className="cy-prompt">{item.prompt}</p></div></section><section className="cy-cycle" aria-label="Ciclo do contato"><div className="cy-section-head"><div><span className="fv-label">Sua observação</span><h2>O ciclo em movimento</h2></div><span className="cy-counter" aria-live="polite">{sequence.length} de {item.segments.length} marcadas</span></div><InteractiveCycle phases={item.segments} marked={sequence} onToggle={toggle}/><div className="cy-phases" role="group" aria-label="Etapas do ciclo">{item.segments.map((phase,index)=><button type="button" key={phase.id} aria-pressed={sequence.includes(phase.id)} onClick={()=>toggle(phase.id)}><span>{index+1}</span>{phase.text}</button>)}</div></section></div>
  <section className="cy-reading" aria-label="Sua leitura"><div className="cy-section-head"><div><span className="fv-label">Descreva o que percebe</span><h2>Sua leitura da situação</h2></div></div><div className="cy-form"><label className="fv-field"><span>Onde o ciclo se interrompeu?</span><select value={interruption} onChange={event=>setInterruption(event.target.value)}><option value="">Não se interrompeu / não sei</option>{item.segments.map(phase=><option key={phase.id} value={phase.id}>{phase.text}</option>)}</select></label><TextArea label="Sua leitura da situação, se quiser" value={reflection} onChange={setReflection}/></div>
  {item.teacherResponse && <><Button secondary aria-expanded={compare} onClick={()=>setCompare(value=>!value)}>{compare ? "Recolher leitura docente" : "Comparar leituras"}</Button>{compare && <div className="cy-compare"><section><h3>Sua leitura</h3><p>{reflection.trim() || "Você ainda não escreveu uma leitura."}</p></section><section><h3>Leitura docente</h3><p>{item.teacherResponse}</p></section></div>}</>}
  <details className="cy-references"><summary>Referências do modelo</summary><ReferenceLine item={item}/></details><div className="fv-actions">{index+1<items.length && <Button secondary onClick={()=>requestChange(hasResponse,()=>{setIndex(index+1);reset();})}>Outra situação</Button>}<Button onClick={()=>props.onComplete(payload)}>Concluir estudo</Button></div></section></> : <EmptyContent/>}</div>;

}
export function BoundariesExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [hypotheses,setHypotheses]=useState<string[]>([]); const [reflection,setReflection]=useState(""); const [compare,setCompare]=useState(false);
  const {requestChange,confirmation}=useDiscardConfirmation();
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",hypotheses,reflection}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <>{confirmation}<ContactBoundary /><p className="fv-tag">Vinheta {index+1} de {items.length} · situação fictícia</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><div className="fv-options">{item.alternatives.map(hypothesis => <SelectableCard key={hypothesis.id} label={hypothesis.text} selected={hypotheses.includes(hypothesis.id)} onSelect={() => setHypotheses(values => values.includes(hypothesis.id) ? values.filter(value => value!==hypothesis.id) : [...values,hypothesis.id])} />)}</div><Button secondary onClick={() => setHypotheses([])}>Não sei</Button><TextArea label="Uma hipótese nas suas palavras, se quiser" value={reflection} onChange={setReflection} />{compare && <><h3>Leitura docente</h3><p>{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length && <Button secondary onClick={() => requestChange(!!(hypotheses.length || reflection.trim()),()=>{setIndex(index+1);setHypotheses([]);setReflection("");setCompare(false);})}>Outra vinheta</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir</Button></div></>;
}
export function CaseExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [observable,setObservable]=useState(""); const [question,setQuestion]=useState(""); const [experiment,setExperiment]=useState(""); const [field,setField]=useState(""); const [compare,setCompare]=useState(false);
  const {requestChange,confirmation}=useDiscardConfirmation();
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===props.mode); const item=items[index];
  const payload={itemId:item?.id ?? "",observable,question,experiment,field}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <>{confirmation}<p className="fv-tag">Situação {index+1} de {items.length} · fictícia para estudo</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><TextArea label="O que você consegue observar neste trecho?" value={observable} onChange={setObservable} /><TextArea label="Uma pergunta fenomenológica" value={question} onChange={setQuestion} /><TextArea label="Uma possibilidade de experimento" value={experiment} onChange={setExperiment} /><TextArea label="Mudar uma variável do campo e reler" value={field} onChange={setField} />
    {compare && <div className="fv-compare"><section><h3>Sua leitura</h3><p className="fv-summary">{[observable,question,experiment,field].filter(Boolean).join("\n\n") || "Você seguiu sem escrever uma leitura."}</p></section><section><h3>Leitura docente para comparar</h3><p className="fv-summary">{item.teacherResponse}</p></section></div>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length && <Button secondary onClick={() => requestChange(!!(observable.trim() || question.trim() || experiment.trim() || field.trim()),()=>{setIndex(index+1);setObservable("");setQuestion("");setExperiment("");setField("");setCompare(false);})}>Outro caso</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir</Button></div></>;
}

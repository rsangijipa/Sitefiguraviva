"use client";
import { useState } from "react";
import { EXPERIMENT_STEPS } from "./contracts";
import { Button, TextArea, RangeScale, EmptyContent, ReferenceLine, SelectableCard } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";

export function PhenomenologyExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [classification,setClassification]=useState<Record<string,"observacao"|"interpretacao"|"julgamento">>({});
  const [rewrite,setRewrite]=useState(""); const [compare,setCompare]=useState(false);
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",classification:Object.entries(classification).map(([phraseId,kind])=>({phraseId,kind})),rewrite}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><p className="fv-tag">Trecho fictício para estudo</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><ul className="fv-list">{item.segments.map(segment => <li key={segment.id}><p>{segment.text}</p><label className="fv-field"><span>Classificar este trecho</span><select value={classification[segment.id] ?? ""} onChange={event => setClassification(values => {const next={...values}; if(event.target.value) next[segment.id]=event.target.value as typeof classification[string]; else delete next[segment.id]; return next;})}><option value="">Não sei / pular</option><option value="observacao">Observação</option><option value="interpretacao">Interpretação</option><option value="julgamento">Julgamento</option></select></label></li>)}</ul><TextArea label="Reescrever somente com descrição, se quiser" value={rewrite} onChange={setRewrite} maxLength={2000} />
    {compare && <><h3>Reescrita docente</h3><p className="fv-summary">{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar reescritas</Button>{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setClassification({});setRewrite("");setCompare(false);}}>Outro trecho</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir laboratório</Button></div></>;
}
export function ExperimentExperience(props: ExperienceProps) {
  const [caseId,setCase]=useState(""); const [support,setSupport]=useState(5);
  const [texts,setTexts]=useState<Record<string,string>>({}); const [compare,setCompare]=useState(false);
  const selected=props.cases.find(item => item.id===caseId); const guidance=props.version?.configuration.items[0];
  const payload={caseId,support,steps:EXPERIMENT_STEPS.map(id=>({id,text:texts[id] ?? ""}))}; useExperienceDraft(payload,props.onDraft);
  if(!guidance || !props.cases.length) return <EmptyContent />;
  const labels: Record<string,string>={preparar:"Preparar o terreno",consenso:"Consenso",graduacao:"Graduação",energia:"Foco na energia",execucao:"Execução",fechamento:"Fechamento"};
  const examples=guidance.alternatives.filter(item => item.id===(support<=5 ? "suporte" : "desafio"));
  return <><h2>Escolher um microcaso</h2><div className="fv-options">{props.cases.filter(item => item.format==="microcaso").map(item => <SelectableCard key={item.id} label={item.title} selected={caseId===item.id} onSelect={() => {setCase(item.id);setCompare(false);}} />)}</div>{selected && <><p className="fv-summary">{selected.text}</p><ReferenceLine item={selected} /></>}<p>{guidance.text}</p><RangeScale label="Graduação da proposta" value={support} onChange={setSupport} ends={["Mais suporte","Mais desafio"]} />{examples.map(item => <p key={item.id}>{item.text}</p>)}{EXPERIMENT_STEPS.map(id => <TextArea key={id} label={labels[id]} value={texts[id] ?? ""} onChange={value => setTexts(previous => ({...previous,[id]:value}))} />)}{compare && <><h3>Proposta docente para comparar</h3><p className="fv-summary">{guidance.teacherResponse}</p></>}<ReferenceLine item={guidance} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar propostas</Button><Button disabled={!selected} onClick={() => props.onComplete(payload)}>Concluir ateliê</Button><Button secondary onClick={() => props.onComplete(null)}>Pular e encerrar</Button></div></>;
}
export function DialogicalExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [response,setResponse]=useState(""); const [compare,setCompare]=useState(false);
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",response}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><p className="fv-tag">Fala fictícia para estudo</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><TextArea label="O que você responderia?" value={response} onChange={setResponse} maxLength={1000} />
    {compare && <><h3>Possibilidades para comparar</h3><ul className="fv-list">{item.alternatives.map(alternative => <li key={alternative.id}><p>{alternative.text}</p><p className="fv-support">{alternative.comment}</p></li>)}</ul><p className="fv-summary">{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions">{!compare && <><Button onClick={() => setCompare(true)}>Ver possibilidades comentadas</Button><Button secondary onClick={() => setCompare(true)}>Pular resposta</Button></>}{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setResponse("");setCompare(false);}}>Outra fala</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir escuta</Button></div></>;
}

"use client";
import { useState } from "react";
import { EXPERIMENT_STEPS } from "./contracts";
import { Button, TextArea, RangeScale, EmptyContent, ReferenceLine, SelectableCard } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";

type Kind = "observacao"|"interpretacao"|"julgamento";
const KIND_LABEL: Record<Kind,string> = { observacao:"Observação", interpretacao:"Interpretação", julgamento:"Julgamento" };
const LAB_STEPS = ["Classificar","Suspender","Reescrever","Horizontalizar","Comparar","Refletir"] as const;
/**
 * Laboratório Fenomenológico (guia próprio): classificar, suspender
 * pressupostos (epoché), reescrever só com descrição, horizontalizar, comparar
 * com "Uma possibilidade de descrição" e refletir. A chave docente fica nas
 * alternativas do item (id da frase → tipo + comentário) e só aparece depois
 * que a pessoa classifica; leituras diferentes não são tratadas como erro.
 * Só classificação e reescrita podem ser guardadas; o resto fica nesta tela.
 */
export function PhenomenologyExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [step,setStep]=useState(0);
  const [classification,setClassification]=useState<Record<string,Kind>>({}); const [showKey,setShowKey]=useState(false);
  const [epoche,setEpoche]=useState(""); const [rewrite,setRewrite]=useState(""); const [horizon,setHorizon]=useState("");
  const [debrief,setDebrief]=useState<[string,string,string]>(["","",""]);
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",classification:Object.entries(classification).map(([phraseId,kind])=>({phraseId,kind})),rewrite}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  const key=Object.fromEntries(item.alternatives.map(entry => [entry.id,entry])) as Record<string,{text:string;comment:string}|undefined>;
  const reset=(next:number) => {setIndex(next);setStep(0);setClassification({});setShowKey(false);setEpoche("");setRewrite("");setHorizon("");setDebrief(["","",""]);};
  const current=LAB_STEPS[step];
  return <><p className="fv-tag">Trecho fictício para estudo · {index+1} de {items.length}</p><h2>{item.title}</h2>
    <div className="fv-progress"><span>Etapa {step+1} de {LAB_STEPS.length}: {current}</span><ol aria-label="Etapas do laboratório">{LAB_STEPS.map((label,position) => <li key={label} data-done={position<step} aria-label={`${label}: ${position<step ? "concluída" : position===step ? "atual" : "por percorrer"}`} />)}</ol></div>
    <section className="fv-transcript" aria-label="Cena"><p className="fv-summary">{item.text}</p><ol>{item.segments.map(segment => <li key={segment.id}>{segment.text}</li>)}</ol></section>
    {current==="Classificar" && <><p>{item.prompt || "Classifique cada frase como observação, interpretação ou julgamento."}</p><ul className="fv-list">{item.segments.map(segment => {
      const mine=classification[segment.id]; const docente=key[segment.id];
      return <li key={segment.id}><p>{segment.text}</p><div className="fv-actions fv-chips" role="group" aria-label={`Classificar: ${segment.text}`}>{(Object.keys(KIND_LABEL) as Kind[]).map(kind => <Button key={kind} secondary aria-pressed={mine===kind} onClick={() => setClassification(values => ({...values,[segment.id]:kind}))}>{KIND_LABEL[kind]}</Button>)}<Button secondary aria-pressed={mine===undefined} onClick={() => setClassification(values => {const next={...values};delete next[segment.id];return next;})}>Não sei</Button></div>
        {showKey && docente && <p className={`fv-feedback${mine && mine!==docente.text ? " fv-feedback--differs" : ""}`}><strong>Leitura docente: {KIND_LABEL[docente.text as Kind] ?? docente.text}.</strong> {docente.comment}{mine && mine!==docente.text && " Sua leitura foi outra; ela pode ser defensável. Vale observar onde a frase vai além do que a cena mostra."}</p>}</li>;
    })}</ul>{!!item.alternatives.length && <Button secondary onClick={() => setShowKey(true)} disabled={showKey}>Ver comentários da docência</Button>}</>}
    {current==="Suspender" && <><p>Antes de reescrever, anote os pressupostos que você percebe em si diante desta cena. Não é preciso eliminá-los: só colocá-los entre parênteses.</p><TextArea label="Pressupostos que coloco em suspensão" value={epoche} onChange={setEpoche} maxLength={1000} /></>}
    {current==="Reescrever" && <TextArea label="Reescrever somente com descrição" value={rewrite} onChange={setRewrite} maxLength={2000} />}
    {current==="Horizontalizar" && <><p>Liste os elementos da cena, um por linha, sem ordenar por importância. Tudo o que aparece tem, a princípio, o mesmo peso.</p><TextArea label="Elementos da cena, um por linha" value={horizon} onChange={setHorizon} maxLength={1000} />
      {!!horizon.trim() && <ul className="fv-horizon" aria-label="Elementos lado a lado">{horizon.split("\n").map(line => line.trim()).filter(Boolean).map((line,position) => <li key={position}>{line}</li>)}</ul>}</>}
    {current==="Comparar" && <div className="fv-compare"><section><h3>Sua reescrita</h3><p className="fv-summary">{rewrite || "Você não escreveu uma reescrita. Tudo bem."}</p></section><section><h3>Uma possibilidade de descrição</h3><p className="fv-summary">{item.teacherResponse}</p></section></div>}
    {current==="Refletir" && <>{(["O que se tornou figura?","O que ficou como pressuposto?","O que ainda precisa ser perguntado?"] as const).map((question,position) => <TextArea key={question} label={question} value={debrief[position]} onChange={value => setDebrief(values => values.map((old,i) => i===position ? value : old) as [string,string,string])} />)}<p className="fv-note">As anotações de suspensão, horizontalização e reflexão ficam só nesta tela.</p></>}
    <ReferenceLine item={item} />
    <div className="fv-actions">{step>0 && <Button secondary onClick={() => setStep(step-1)}>Etapa anterior</Button>}{step+1<LAB_STEPS.length ? <Button onClick={() => setStep(step+1)}>Continuar</Button> : <Button onClick={() => props.onComplete(payload)}>Concluir laboratório</Button>}{index+1<items.length && <Button secondary onClick={() => reset(index+1)}>Outro trecho</Button>}</div></>;
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
const RESPONSE_KIND: Record<string,string> = { interpretar:"Interpretar", aconselhar:"Aconselhar", refletir:"Refletir", incluir:"Incluir" };
/**
 * Escuta Dialógica (guia, seção 9.3): a pessoa escreve a própria resposta
 * antes de ver quatro respostas comentadas (interpretar, aconselhar, refletir,
 * incluir), sem certo e errado, com apoio sobre presença, inclusão e confirmação.
 */
export function DialogicalExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [response,setResponse]=useState(""); const [compare,setCompare]=useState(false);
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",response}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><p className="fv-tag">Fala fictícia para estudo · {index+1} de {items.length}</p><h2>{item.title}</h2><blockquote className="fv-quote">{item.text}</blockquote>
    <TextArea label="O que você responderia?" value={response} onChange={setResponse} maxLength={1000} />
    {compare && <><h3>Possibilidades para comparar</h3><p className="fv-support">Não há resposta certa. Cada uma produz um encontro diferente.</p><ul className="fv-list fv-responses">{item.alternatives.map(alternative => <li key={alternative.id}>{RESPONSE_KIND[alternative.id] && <span className="fv-label">{RESPONSE_KIND[alternative.id]}</span>}<p>{alternative.text}</p><p className="fv-support">{alternative.comment}</p></li>)}</ul>{item.teacherResponse && <p className="fv-summary">{item.teacherResponse}</p>}</>}
    <details className="fv-details"><summary>Presença, inclusão e confirmação</summary><p><strong>Presença:</strong> estar disponível ao encontro sem se esconder no papel profissional.</p><p><strong>Inclusão:</strong> imaginar o lado do outro sem deixar de ser quem se é.</p><p><strong>Confirmação:</strong> reconhecer a pessoa no que ela é e no que pode vir a ser.</p><p className="fv-reference">BUBER, M. · Eu e Tu · 1923 · HYCNER, R. · De pessoa a pessoa: psicoterapia dialógica · 1995</p></details>
    <ReferenceLine item={item} /><div className="fv-actions">{!compare && <><Button onClick={() => setCompare(true)}>Ver possibilidades comentadas</Button><Button secondary onClick={() => setCompare(true)}>Pular resposta</Button></>}{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setResponse("");setCompare(false);}}>Outra fala</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir escuta</Button></div></>;
}

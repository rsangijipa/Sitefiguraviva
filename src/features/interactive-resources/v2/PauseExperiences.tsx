"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button, TextArea, SelectableCard } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import { resourceAudioManager } from "./audio-manager";
import Link from "next/link";
const WaterStage = dynamic(() => import("./WaterStage").then(module => module.WaterStage), { ssr:false, loading:() => <p role="status">Preparando a superfície…</p> });
const PRACTICES = [
  { id:"respirar",title:"Respirar",text:"Perceba sua respiração natural, no seu ritmo." },
  { id:"observar",title:"Observar",text:"Uma cor, uma forma ou uma textura no espaço em que você está." },
  { id:"pelos-sentidos",title:"Pelos sentidos",text:"Escolha os sentidos que fazem sentido agora." },
  { id:"ouvir",title:"Ouvir",text:"Um som perto, um som longe." },
  { id:"movimentar",title:"Movimentar",text:"Mãos, ombros ou imobilidade." },
  { id:"desacelerar",title:"Desacelerar",text:"Deixe uma tarefa de lado por um instante." },
];
const SENSES = ["O que você vê?","O que você toca?","O que você ouve?","Algum cheiro aparece?","Algum sabor aparece?"];
export function PauseExperience(props: ExperienceProps) {
  const [practice,setPractice] = useState(props.mode || "respirar");
  const [started,setStarted] = useState(false); const [paused,setPaused] = useState(false);
  const [seconds,setSeconds] = useState(0); const [sense,setSense] = useState(0); const [reflection,setReflection] = useState("");
  const payload={practice,seconds,reflection}; useExperienceDraft(payload,props.onDraft);
  useEffect(() => {
    if(!started || paused) return;
    let last=Date.now();
    const timer=window.setInterval(() => { const now=Date.now(); setSeconds(value => Math.min(86400,value+Math.floor((now-last)/1000))); last=now; },1000);
    const hide=() => { if(document.hidden) { setPaused(true); resourceAudioManager.stopAll(); } };
    document.addEventListener("visibilitychange",hide);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange",hide); resourceAudioManager.stopAll(); };
  },[started,paused]);
  const selected=PRACTICES.find(item => item.id===practice) ?? PRACTICES[0];
  if(!started) return <><h2>Que tipo de pausa cabe agora?</h2><p>Você pode adaptar, trocar ou encerrar quando quiser.</p><div className="fv-options">{PRACTICES.map(item => <SelectableCard key={item.id} label={item.title} selected={practice===item.id} onSelect={() => setPractice(item.id)}><span>{item.text}</span></SelectableCard>)}</div><div className="fv-actions"><Button onClick={() => setStarted(true)}>Começar pausa</Button></div></>;
  return <><h2>{selected.title}</h2><p>{selected.text}</p><p aria-live="off">Tempo nesta pausa: {Math.floor(seconds/60)} min {seconds%60} s · sem meta</p>
    {practice==="pelos-sentidos" && <><h3>{SENSES[sense]}</h3><div className="fv-actions"><Button secondary onClick={() => setSense((sense+1)%SENSES.length)}>Próximo sentido</Button><Button secondary onClick={() => setSense((sense+1)%SENSES.length)}>Não sei</Button></div></>}
    {practice==="desacelerar" && <><WaterStage /><Link href="/recursos/igarape">Abrir experiência completa</Link></>}
    {practice==="ouvir" && <Link href="/recursos/sons-para-awareness">Abrir Sons para Awareness</Link>}
    <TextArea label="Uma percepção, se quiser" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button secondary onClick={() => setPaused(value => !value)}>{paused ? "Retomar" : "Pausar"}</Button><Button secondary onClick={() => {setStarted(false);setPaused(false);setSeconds(0);}}>Trocar prática</Button><Button onClick={() => props.onComplete(payload)}>Encerrar pausa</Button></div>
  </>;
}
export function ListeningExperience(props: ExperienceProps) {
  const [reflection,setReflection] = useState(""); const [sceneId,setScene] = useState("");
  const [observations,setObservations] = useState<string[]>([]); const [text,setText] = useState(""); const [error,setError] = useState("");
  const payload={sceneId,observations,reflection}; useExperienceDraft(payload,props.onDraft);
  const recordings=props.version?.configuration.audio ?? [];
  const play=async (id:string,path:string) => { setError(""); try { if(await resourceAudioManager.activateFromGesture() && await resourceAudioManager.play("sons-para-awareness",path)) setScene(id); else setError("A gravação está indisponível. Você pode continuar em texto."); } catch {setError("A gravação está indisponível. Você pode continuar em texto.");} };
  useEffect(() => () => resourceAudioManager.stop("sons-para-awareness"),[]);
  return <><h2>O que você escuta no entorno?</h2><p>Você pode continuar sem áudio ou observar os sons do lugar onde está.</p>{recordings.length ? <ul className="fv-list">{recordings.map(item => <li key={item.id}><h3>{item.title}</h3><p className="fv-reference">{item.credit} · {item.license}</p><Button secondary onClick={() => void play(item.id,item.path)}>Ouvir {item.title}</Button></li>)}</ul> : <p className="fv-note">As gravações do Instituto aguardam revisão e licenciamento.</p>}{error && <p className="fv-error" role="alert">{error}</p>}
    <TextArea label="Uma observação sonora" value={text} onChange={setText} /><Button secondary disabled={!text.trim() || observations.length>=10} onClick={() => {setObservations(values => [...values,text]);setText("");}}>Adicionar observação</Button><ul className="fv-list">{observations.map((item,index) => <li key={index}>{item}</li>)}</ul><TextArea label="O que fica desta escuta?" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button secondary onClick={() => resourceAudioManager.stop("sons-para-awareness")}>Parar som</Button><Button onClick={() => props.onComplete({...payload,observations:text.trim() && observations.length<10 ? [...observations,text] : observations})}>Concluir escuta</Button></div>
  </>;
}
export function WaterExperience(props: ExperienceProps) {
  useExperienceDraft(null,props.onDraft);
  return <><WaterStage forceStatic={props.mode==="estatico"} /><div className="fv-actions"><Button onClick={() => props.onComplete(null)}>Encerrar experiência</Button></div></>;
}

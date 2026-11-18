"use client";
import { useEffect, useRef, useState } from "react";
import { makeLeaf, leafPosition } from "@/features/interactive-resources/thought-river/engine/leafMotion";
import { advanceScene } from "@/features/interactive-resources/thought-river/engine/riverScene";
import type { RiverLeaf } from "@/features/interactive-resources/thought-river/types";
import { useResourceMotion } from "./ResourceShell";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import { Button, TextArea } from "./ui";
import {ExperienceIntro} from "./immersive/ExperienceIntro";
import "./immersive/immersive.css";

export function ThoughtLandscape(props: ExperienceProps) {
  const [text,setText] = useState(""); const [leaves,setLeaves] = useState<RiverLeaf[]>([]);
  const [focused,setFocused]=useState<string|null>(null);
  const [reflection,setReflection] = useState(""); const [paused,setPaused] = useState(false);
  const reduced=useResourceMotion(); const mode=props.mode === "rio" ? "rio" : "jardim";
  const live=useRef(leaves); useEffect(() => {live.current=leaves;},[leaves]);
  const payload={mode,thoughts:mode==="jardim" ? leaves.map(item => item.text) : [],reflection};
  useExperienceDraft({...payload,pendingText:text},props.onDraft);
  useEffect(() => {
    if(mode!=="rio" || reduced || paused) return;
    let last=0; let frame=0;
    const run=(time:number) => {
      if(!document.hidden && time-last>100) {
        const result=advanceScene(live.current,last ? time-last : 0);
        live.current=result.active; setLeaves(result.active); last=time;
      }
      if(document.hidden) last=time;
      frame=requestAnimationFrame(run);
    };
    frame=requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  },[mode,reduced,paused]);
  const add=() => {if(text.trim() && leaves.length<20) {setLeaves(values => [...values,makeLeaf(crypto.randomUUID(),text,Date.now())]);setText("");}};
  return <><ExperienceIntro asset={`pensamentos/${mode}`} title={mode==="rio" ? "Deixar passar" : "Pousar e revisitar"} description={mode==="rio" ? "Uma folha pode levar uma escrita por esta paisagem. A passagem pode ser pausada." : "Pouse uma escrita no jardim. Toque em uma folha para revisitar e editar."}/><p>Pensar também é um acontecimento do momento. Você pode observar, sem precisar resolver.</p>{mode==="rio" && <p className="fv-note">Ao deixar passar, esta escrita permanece apenas durante a experiência e não entra no histórico. Você pode pausar a passagem.</p>}<TextArea label="Uma escrita breve, se quiser" value={text} onChange={setText} /><Button onClick={add} disabled={!text.trim() || leaves.length>=20}>{mode==="rio" ? "Deixar passar nesta tela" : "Pousar nesta tela"}</Button>
    {mode==="jardim" ? <div className="im-landscape im-landscape--jardim" role="group" aria-label="Jardim de pensamentos">{leaves.length ? leaves.map(item=><button key={item.id} type="button" className="im-thought" aria-pressed={focused===item.id} onClick={()=>setFocused(focused===item.id ? null : item.id)}>{item.text}</button>) : <p className="im-thought-empty">O jardim está aberto para uma escrita sua.</p>}</div> : <div className="im-landscape im-landscape--rio" aria-hidden="true">{leaves.length ? leaves.map((item,index)=>{const position=reduced ? {x:100+(index%3)*140,y:30+Math.floor(index/3)*70} : leafPosition(item,500,280);return <div key={item.id} className="im-floating-leaf" style={{left:`${position.x/5}%`,top:position.y}}>{item.text}</div>;}) : <p className="im-thought-empty">Você também pode apenas acompanhar o rio.</p>}</div>}
    <ul className="fv-list" aria-label="Escritas nesta experiência" style={{marginTop:24}}>{leaves.map(item => <li key={item.id}>{mode==="jardim" && focused===item.id ? <TextArea label="Revisar escrita no jardim" value={item.text} onChange={text=>setLeaves(values=>values.map(leaf=>leaf.id===item.id ? {...leaf,text} : leaf))}/> : <p>{item.text}</p>}<Button secondary onClick={() => setLeaves(values => values.filter(value => value.id!==item.id))}>{mode==="rio" ? "Deixar passar" : "Retirar desta tela"}</Button></li>)}</ul>
    {mode==="rio" && <p className="fv-note">As escritas que passam não entram no histórico. A reflexão final só é guardada se você escolher.</p>}
    {mode==="rio" && <Button secondary aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Retomar passagem" : "Pausar passagem"}</Button>}
    <TextArea label="Uma reflexão para o fechamento, se quiser" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete({...payload,thoughts:mode==="jardim" && text.trim() && leaves.length<20 ? [...payload.thoughts,text] : payload.thoughts})}>Concluir</Button></div>
  </>;
}

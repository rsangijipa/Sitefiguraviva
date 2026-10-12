"use client";
import { useEffect, useRef, useState } from "react";
import { makeLeaf, leafPosition } from "@/features/interactive-resources/thought-river/engine/leafMotion";
import { advanceScene } from "@/features/interactive-resources/thought-river/engine/riverScene";
import type { RiverLeaf } from "@/features/interactive-resources/thought-river/types";
import { useResourceMotion } from "./ResourceShell";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import { Button, TextArea } from "./ui";

export function ThoughtLandscape(props: ExperienceProps) {
  const [text,setText] = useState(""); const [leaves,setLeaves] = useState<RiverLeaf[]>([]);
  const [reflection,setReflection] = useState(""); const [paused,setPaused] = useState(false);
  const reduced=useResourceMotion(); const mode=props.mode === "rio" ? "rio" : "jardim";
  const live=useRef(leaves); useEffect(() => {live.current=leaves;},[leaves]);
  const payload={mode,thoughts:mode==="jardim" ? leaves.map(item => item.text) : [],reflection};
  useExperienceDraft(payload,props.onDraft);
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
  return <><h2>{mode==="rio" ? "Deixar passar" : "Pousar e revisitar"}</h2><p>Pensar também é um acontecimento do momento. Você pode observar, sem precisar resolver.</p><TextArea label="Uma escrita breve, se quiser" value={text} onChange={setText} /><Button onClick={add} disabled={!text.trim() || leaves.length>=20}>{mode==="rio" ? "Deixar passar nesta tela" : "Pousar nesta tela"}</Button>
    {mode==="rio" && !reduced && <div className="fv-river" aria-hidden="true">{leaves.map(item => {const position=leafPosition(item,500,240);return <div key={item.id} className="fv-river-text" style={{left:`${position.x/5}%`,top:position.y}}>{item.text}</div>;})}</div>}
    <ul className="fv-list" aria-label="Escritas nesta experiência" style={{marginTop:24}}>{leaves.map(item => <li key={item.id}><p>{item.text}</p><Button secondary onClick={() => setLeaves(values => values.filter(value => value.id!==item.id))}>{mode==="rio" ? "Deixar passar" : "Retirar desta tela"}</Button></li>)}</ul>
    {mode==="rio" && <p className="fv-note">As escritas que passam não entram no histórico. A reflexão final só é guardada se você escolher.</p>}
    {mode==="rio" && <Button secondary aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Retomar passagem" : "Pausar passagem"}</Button>}
    <TextArea label="Uma reflexão para o fechamento, se quiser" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete({...payload,thoughts:mode==="jardim" && text.trim() && leaves.length<20 ? [...payload.thoughts,text] : payload.thoughts})}>Concluir</Button></div>
  </>;
}

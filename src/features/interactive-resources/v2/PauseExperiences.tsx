"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { Button, TextArea, SelectableCard } from "./ui";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import { resourceAudioManager } from "./audio-manager";
import {PausePractice} from "./immersive/PausePractice";
import {PauseDock} from "./pause/PauseDock";
import "./pause/pause.css";
import {SoundScene} from "./immersive/SoundScene";
import {ambientSounds} from "./immersive/ambient-sounds";
import {useResourceMotion} from "./ResourceShell";
import "./immersive/immersive.css";
import { PracticeArt } from "./illustration/scenes";
import { useDiscardConfirmation } from "./useDiscardConfirmation";
const WaterStage = dynamic(() => import("./WaterStage").then(module => module.WaterStage), { ssr:false, loading:() => <p role="status">Preparando a superfície…</p> });
const PRACTICE_HELP: Record<string,string> = {
  respirar:"escolha um tipo de respiração e acompanhe a mandala: ela abre ao inspirar e fecha ao expirar. Se houver tontura, volte à respiração natural.",
  observar:"escolha o que observar (cor, forma, textura ou espaço) e deixe o olhar repousar na cena lenta. Depois, procure algo parecido no ambiente em que você está.",
  "pelos-sentidos":"escolha os sentidos que fazem sentido agora. Cada um ganha uma camada em movimento; toque em play para ouvir os sons e veja as formas se moverem com eles.",
  ouvir:"toque o som e mova o controle de perto a longe (ou deixe o passeio automático). Note como volume, brilho, eco e lado mudam com a distância.",
  movimentar:"escolha mãos, ombros ou imobilidade e acompanhe a figura no seu ritmo. Pule ou adapte qualquer parte e interrompa se sentir dor.",
  desacelerar:"liste suas tarefas com prioridade e tempo; o relógio monta blocos de foco com descansos. Você pode deixar uma tarefa de lado a qualquer momento.",
};
const PRACTICES = [
  { id:"respirar",title:"Respirar",text:"Perceba sua respiração natural, no seu ritmo." },
  { id:"observar",title:"Observar",text:"Uma cor, uma forma ou uma textura no espaço em que você está." },
  { id:"pelos-sentidos",title:"Pelos sentidos",text:"Escolha os sentidos que fazem sentido agora." },
  { id:"ouvir",title:"Ouvir",text:"Um som perto, um som longe." },
  { id:"movimentar",title:"Movimentar",text:"Mãos, ombros ou imobilidade." },
  { id:"desacelerar",title:"Desacelerar",text:"Deixe uma tarefa de lado por um instante." },
];
export function PauseExperience(props: ExperienceProps) {
  const motion=!useResourceMotion();
  const [practice,setPractice] = useState(props.mode || "respirar");
  const [started,setStarted] = useState(false); const [paused,setPaused] = useState(false);
  const [seconds,setSeconds] = useState(0); const [reflection,setReflection] = useState("");
  const {requestChange,confirmation}=useDiscardConfirmation();
  const payload={practice,seconds,reflection}; useExperienceDraft(reflection.trim() ? payload : null,props.onDraft);
  useEffect(() => {
    if(!started || paused) return;
    let last=Date.now();
    const timer=window.setInterval(() => { const now=Date.now(); setSeconds(value => Math.min(86400,value+Math.floor((now-last)/1000))); last=now; },1000);
    const hide=() => { if(document.hidden) { setPaused(true); resourceAudioManager.stopAll(); } };
    document.addEventListener("visibilitychange",hide);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange",hide); resourceAudioManager.stopAll(); };
  },[started,paused]);
  useEffect(()=>{const root=document.querySelector<HTMLElement>("[data-scroll-root]");if(root)root.scrollTop=0;},[started]);
  const selected=PRACTICES.find(item => item.id===practice) ?? PRACTICES[0];
  if(!started) return <div className="ps-intro"><div className="pause-intro"><h2>Que tipo de pausa cabe agora?</h2><p>Um ambiente para se demorar um instante. Você pode adaptar, trocar ou encerrar quando quiser.</p></div><div className="pause-catalog">{PRACTICES.map(item => <SelectableCard key={item.id} label={item.title} selected={practice===item.id} onSelect={() => setPractice(item.id)}><PracticeArt practice={item.id} className="fv-illustration fv-practice-art" /><span>{item.text}</span></SelectableCard>)}</div><div className="fv-actions"><Button onClick={() => setStarted(true)}>Começar pausa</Button></div></div>;
  return <>{confirmation}<div className="ps-app" data-paused={paused}>
    <header className="ps-head"><h2>{selected.title}</h2><p><strong>Como usar:</strong> {PRACTICE_HELP[selected.id] ?? selected.text}</p></header>
    <div className="ps-body"><PausePractice practice={practice} title={selected.title} paused={paused} motion={motion}/></div>
    <PauseDock paused={paused} hideSound={practice==="ouvir" || practice==="pelos-sentidos"} seconds={seconds} reflection={reflection} onReflection={setReflection} onTogglePause={() => setPaused(value => !value)} onSwitch={() => {setStarted(false);setPaused(false);setSeconds(0);}} onEndWithout={() => requestChange(!!reflection.trim(),()=>props.onComplete(null))} onEnd={() => props.onComplete(payload)}/>
  </div></>;
}
export function ListeningExperience(props: ExperienceProps) {
  const [reflection,setReflection] = useState(""); const [sceneId,setScene] = useState("");
  const [observations,setObservations] = useState<string[]>([]); const [text,setText] = useState(""); const [error,setError] = useState("");
  const payload={sceneId,observations:text.trim() && observations.length<10 ? [...observations,text] : observations,reflection}; useExperienceDraft(payload,props.onDraft);
  const [playback,setPlayback]=useState<ReturnType<typeof resourceAudioManager.getPlayback>>(null);
  const [loadingId,setLoadingId]=useState("");
  const [openScene,setOpenScene]=useState<string|null>(null);
  const playbackRequest=useRef(0);
  const recordings=props.mode==="texto" ? [] : props.version?.configuration.audio.length ? props.version.configuration.audio : ambientSounds;
  const play=async (id:string,path:string) => { const request=++playbackRequest.current;setError("");setLoadingId(id);try { const enabled=await resourceAudioManager.activateFromGesture();if(request!==playbackRequest.current)return;if(enabled && await resourceAudioManager.play("sons-para-awareness",path)){if(request===playbackRequest.current)setScene(id);}else if(request===playbackRequest.current)setError("A gravação está indisponível. Você pode continuar em texto."); } catch {if(request===playbackRequest.current)setError("A gravação está indisponível. Você pode continuar em texto.");}finally{if(request===playbackRequest.current)setLoadingId("");} };
  useEffect(()=>{
    const update=()=>setPlayback(resourceAudioManager.getPlayback("sons-para-awareness"));
    const timer=window.setInterval(update,1000);
    window.addEventListener("fv:resource-audio-state",update);
    return ()=>{clearInterval(timer);window.removeEventListener("fv:resource-audio-state",update);resourceAudioManager.stop("sons-para-awareness");};
  },[]);
  const selectedTrack=recordings.find(item=>item.id===openScene);
  const closeScene=()=>{playbackRequest.current++;setLoadingId("");resourceAudioManager.stop("sons-para-awareness");setOpenScene(null);};
  return <><div className="sound-intro"><h2>O que você escuta no entorno?</h2><p>Escolha uma paisagem sonora ou perceba os sons do lugar onde você está. O áudio começa somente quando você escolher ouvir.</p></div>{recordings.length ? <ul className="sound-catalog">{recordings.map(item=><li key={item.id}><button type="button" className="sound-catalog-card" onClick={()=>setOpenScene(item.id)}><img src={`/brand/recursos/sons/${"art" in item ? item.art : "floresta"}.webp`} alt=""/><span><strong>{item.title}</strong><small>{"description" in item ? item.description : "Explore esta paisagem sonora."}</small><b>Abrir ambiente →</b></span></button></li>)}</ul> : <p className="fv-note">Neste modo, perceba os sons do lugar onde está, sem reproduzir gravações.</p>}{error && <p className="fv-error" role="alert">{error}</p>}
    {selectedTrack && <SoundScene error={error} track={selectedTrack} playback={sceneId===selectedTrack.id ? playback : null} loading={loadingId===selectedTrack.id} onPlay={()=>void play(selectedTrack.id,selectedTrack.path)} onPause={()=>{if(playback?.paused)void resourceAudioManager.resume("sons-para-awareness").then(ok=>{if(!ok)setError("Não foi possível retomar o som.");});else resourceAudioManager.pause("sons-para-awareness");}} onVolume={value=>resourceAudioManager.setVolume("sons-para-awareness",value)} onClose={closeScene}/>}
    <TextArea label="Uma observação sonora" value={text} onChange={setText} /><Button secondary disabled={!text.trim() || observations.length>=10} onClick={() => {setObservations(values => [...values,text]);setText("");}}>Adicionar observação</Button><p className="fv-mode-status" role="status">{observations.length} de 10 observações adicionadas.</p><ul className="fv-list">{observations.map((item,index) => <li key={index}>{item}</li>)}</ul><TextArea label="O que fica desta escuta?" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button secondary onClick={() => resourceAudioManager.stop("sons-para-awareness")}>Parar som</Button><Button onClick={() => props.onComplete({...payload,observations:text.trim() && observations.length<10 ? [...observations,text] : observations})}>Concluir escuta</Button></div>
  </>;
}
export function WaterExperience(props: ExperienceProps) {
  useExperienceDraft(null,props.onDraft);
  return <WaterStage forceStatic={props.mode==="estatico"} showAmbient />;
}

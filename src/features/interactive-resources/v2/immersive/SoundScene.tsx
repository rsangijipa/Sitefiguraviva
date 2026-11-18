"use client";
import {useEffect,useRef,useState,type PointerEvent} from "react";
import {useResourceMotion} from "../ResourceShell";
import {Button} from "../ui";
import {createWorld,type WorldHandle,type WorldScene} from "./sound-world";
import {SoundLab} from "../pause/sound-lab";
import "./immersive.css";

type Track={id:string;title:string;path:string;credit:string;license:string;source?:string;licenseUrl?:string;description?:string;art?:string};
type Playback={paused:boolean;position:number;duration:number;volume:number}|null;
/** Convites de awareness que se alternam em cada ambiente (perguntas abertas, sem resposta certa). */
const PROMPTS:Record<WorldScene,string[]>={
 floresta:["Siga com o olhar um pássaro até ele sair da cena.","Onde a luz toca o chão? Onde há sombra?","Qual som está mais perto? Qual está mais longe?","Perceba os vagalumes: eles acendem e apagam sem pressa.","Toque na cena e veja as folhas se soltarem."],
 riacho:["Acompanhe a água: ela passa, mas o riacho continua.","Escute a água nas pedras. Há um som mais agudo e outro mais grave?","Observe a libélula: para onde ela vai agora?","Veja o peixe saltar e as ondas se abrirem. O que fica depois?","Toque na água e perceba as ondas chegarem à margem."],
 chuva:["Escolha uma gota e acompanhe até ela tocar a água.","Perceba o som da chuva no teto, no chão, nas folhas.","Veja os círculos se abrirem no lago e desaparecerem.","As gotas escorrem pelo vidro: cada uma segue seu caminho.","Há frescor no ar? Perceba a respiração acompanhando a chuva."],
};
export function SoundScene({track,playback,loading,error,onPlay,onPause,onVolume,onClose}:{track:Track;playback:Playback;loading:boolean;error:string;onPlay:()=>void;onPause:()=>void;onVolume:(value:number)=>void;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null),canvas=useRef<HTMLCanvasElement>(null),world=useRef<WorldHandle|null>(null),lab=useRef<SoundLab|null>(null);
 const reduced=useResourceMotion();
 const scene:WorldScene=(["floresta","riacho","chuva"].includes(track.art ?? "") ? track.art : "floresta") as WorldScene;
 const [motion,setMotion]=useState(!reduced),[prompt,setPrompt]=useState(0),[accents,setAccents]=useState(true);
 const audible=!!playback && !playback.paused;
 const flags=useRef({audible,accents});
 useEffect(()=>{flags.current={audible,accents};});
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>{if(element?.open)element.close();};},[]);
 useEffect(()=>{
  const element=canvas.current;if(!element)return;
  const accent=(kind:"passaro"|"gota")=>{
   if(!flags.current.audible || !flags.current.accents)return;
   lab.current??=new SoundLab();const sound=lab.current;
   void sound.ensure().then(ready=>{if(!ready)return;sound.setVolume(.22);sound.shot(kind==="passaro"?"passaro":"gota",kind==="gota"?420:undefined);});
  };
  try{world.current=createWorld(element,scene,!reduced,{onBird:()=>accent("passaro"),onSplash:()=>accent("gota")});}catch{world.current=null;}
  return()=>{world.current?.dispose();world.current=null;lab.current?.dispose();lab.current=null;};
  // O mundo é criado uma vez por cena; o movimento é atualizado pelo efeito seguinte.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[scene]);
 useEffect(()=>{world.current?.setMotion(motion);},[motion]);
 useEffect(()=>{const id=window.setInterval(()=>setPrompt(value=>value+1),12000);return()=>clearInterval(id);},[]);
 const move=(event:PointerEvent<HTMLDivElement>)=>{const r=event.currentTarget.getBoundingClientRect(),x=((event.clientX-r.left)/r.width-.5)*2,y=((event.clientY-r.top)/r.height-.5)*2;world.current?.pointer(x,y);if(motion){event.currentTarget.style.setProperty("--px",x.toFixed(3));event.currentTarget.style.setProperty("--py",y.toFixed(3));}};
 const tap=(event:PointerEvent<HTMLDivElement>)=>{if((event.target as HTMLElement).closest("header,.sound-fullscreen-controls,.sound-world-tools"))return;const r=event.currentTarget.getBoundingClientRect();world.current?.tap(event.clientX-r.left,event.clientY-r.top);};
 const list=PROMPTS[scene];
 return <dialog ref={dialog} className="sound-fullscreen" aria-labelledby="sound-scene-title" onCancel={event=>{event.preventDefault();onClose();}}>
  <div className={`sound-world sound-world--${scene}`} data-motion={motion} onPointerMove={move} onPointerDown={tap}>
   <div className="sound-photo" style={{backgroundImage:`url(/brand/recursos/sons/${scene}.webp)`}}/>
   <canvas ref={canvas} className="sound-canvas" aria-hidden="true"/>
   <p className="sound-prompt" aria-live="off">{list[prompt%list.length]}</p>
   <header className="sound-fullscreen-header"><div><span>PAISAGEM SONORA</span><h2 id="sound-scene-title">{track.title}</h2></div><Button secondary onClick={onClose}>Fechar ambiente</Button></header>
   <div className="sound-fullscreen-controls"><p>{track.description ?? "Observe a paisagem e escolha quando ouvir."}</p><div className="sound-buttons"><Button disabled={loading} onClick={playback ? onPause : onPlay}>{loading ? "Preparando som…" : playback ? playback.paused ? "Retomar som" : "Pausar som" : "Ouvir ambiente"}</Button>{playback && <label>Volume <input aria-label="Volume da gravação" type="range" min="0" max="100" value={Math.round(playback.volume*100)} onChange={event=>onVolume(Number(event.target.value)/100)}/></label>}</div>
    <div className="sound-world-tools" role="group" aria-label="Opções do ambiente"><Button secondary aria-pressed={!motion} disabled={reduced} onClick={()=>setMotion(value=>!value)}>{motion ? "Menos movimento" : "Movimento parado"}</Button>{scene!=="chuva" && <Button secondary aria-pressed={accents} onClick={()=>setAccents(value=>!value)}>{accents ? "Cantos e sons extras: ligados" : "Cantos e sons extras: desligados"}</Button>}</div>
    {error && <p role="alert">{error}</p>}<details><summary>Créditos e licença</summary><p>{track.credit} · {track.license} {track.source && <>· <a href={track.source} target="_blank" rel="noreferrer">Gravação original</a> · <a href={track.licenseUrl} target="_blank" rel="noreferrer">Licença</a></>}</p></details></div>
  </div>
 </dialog>;
}

"use client";
import {useEffect,useRef} from "react";
import {useResourceMotion} from "../ResourceShell";
import {Button} from "../ui";
import "./immersive.css";

type Track={id:string;title:string;path:string;credit:string;license:string;source?:string;licenseUrl?:string;description?:string;art?:string};
type Playback={paused:boolean;position:number;duration:number;volume:number}|null;
export function SoundScene({track,playback,loading,error,onPlay,onPause,onVolume,onClose}:{track:Track;playback:Playback;loading:boolean;error:string;onPlay:()=>void;onPause:()=>void;onVolume:(value:number)=>void;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);const reduced=useResourceMotion();
 const scene=["floresta","riacho","chuva"].includes(track.art ?? "") ? track.art : "floresta";
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>{if(element?.open)element.close();};},[]);
 return <dialog ref={dialog} className="sound-fullscreen" aria-labelledby="sound-scene-title" onCancel={event=>{event.preventDefault();onClose();}}>
  <div className={`sound-world sound-world--${scene}`} data-motion={!reduced} style={{backgroundImage:`url(/brand/recursos/sons/${scene}.webp)`}}>
   <svg className="sound-layer" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {scene==="floresta" && <><g className="sound-sun"><circle cx="810" cy="100" r="48"/><circle cx="810" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="3"/></g><g className="sound-birds" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M150 120 q18 -15 36 0 q18 -15 36 0"/><path d="M285 80 q12 -11 24 0 q12 -11 24 0"/></g>{Array.from({length:14},(_,i)=><path key={i} className="sound-leaf" style={{animationDelay:`-${i*.65}s`}} d="M0 0 Q16 -20 30 0 Q16 20 0 0Z" transform={`translate(${60+i*67} ${100+(i*87)%370})`}/>)}</>}
    {scene==="riacho" && <><g className="sound-glimmers">{Array.from({length:18},(_,i)=><circle key={i} cx={100+(i*89)%800} cy={290+(i*47)%220} r={2+i%4} style={{animationDelay:`-${i*.3}s`}}/>)}</g><g className="sound-fish"><path d="M430 360 Q465 330 500 360 Q465 390 430 360 L415 344 L415 376Z"/><circle cx="486" cy="356" r="3" fill="var(--fv-mata)"/></g><g className="sound-ripples" fill="none" stroke="currentColor" strokeWidth="3"><ellipse cx="465" cy="390" rx="40" ry="10"/><ellipse cx="660" cy="450" rx="70" ry="15"/></g></>}
    {scene==="chuva" && <g className="sound-raindrops" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">{Array.from({length:36},(_,i)=><path key={i} d={`M${(i*97)%1000} ${(i*67)%600} l-12 38`} style={{animationDelay:`-${(i%9)*.16}s`}}/>)}</g>}
   </svg>
   <header className="sound-fullscreen-header"><div><span>PAISAGEM SONORA</span><h2 id="sound-scene-title">{track.title}</h2></div><Button secondary onClick={onClose}>Fechar ambiente</Button></header>
   <div className="sound-fullscreen-controls"><p>{track.description ?? "Observe a paisagem e escolha quando ouvir."}</p><div className="sound-buttons"><Button disabled={loading} onClick={playback ? onPause : onPlay}>{loading ? "Preparando som…" : playback ? playback.paused ? "Retomar som" : "Pausar som" : "Ouvir ambiente"}</Button>{playback && <label>Volume <input aria-label="Volume da gravação" type="range" min="0" max="100" value={Math.round(playback.volume*100)} onChange={event=>onVolume(Number(event.target.value)/100)}/></label>}</div>{error && <p role="alert">{error}</p>}<details><summary>Créditos e licença</summary><p>{track.credit} · {track.license} {track.source && <>· <a href={track.source} target="_blank" rel="noreferrer">Gravação original</a> · <a href={track.licenseUrl} target="_blank" rel="noreferrer">Licença</a></>}</p></details></div>
  </div>
 </dialog>;
}

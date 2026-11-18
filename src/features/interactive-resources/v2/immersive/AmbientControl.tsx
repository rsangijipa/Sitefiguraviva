"use client";
import {useEffect,useState,useRef} from "react";
import {resourceAudioManager} from "../audio-manager";
import {Button} from "../ui";
import {ambientSounds} from "./ambient-sounds";
/** Every playback begins with a gesture; visibility/lesson priority belongs to the shared manager. */
export function AmbientControl({channel,paused=false}:{channel:string;paused?:boolean}) {
 const [selected,setSelected]=useState("riacho"),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const [playback,setPlayback]=useState<ReturnType<typeof resourceAudioManager.getPlayback>>(null);
 const active=useRef(true);
 useEffect(()=>{active.current=true;const update=()=>setPlayback(resourceAudioManager.getPlayback(channel));window.addEventListener("fv:resource-audio-state",update);return()=>{active.current=false;window.removeEventListener("fv:resource-audio-state",update);resourceAudioManager.stop(channel);};},[channel]);
 useEffect(()=>{if(paused)resourceAudioManager.pause(channel);},[channel,paused]);
 const play=async()=>{setError("");setLoading(true);try{const item=ambientSounds.find(item=>item.id===selected)!;if(!await resourceAudioManager.activateFromGesture() || !active.current || !await resourceAudioManager.play(channel,item.path)){if(active.current)setError("Som indisponível. Você pode continuar em silêncio.");}}catch{if(active.current)setError("Som indisponível. Você pode continuar em silêncio.");}finally{if(active.current)setLoading(false);}};
 const item=ambientSounds.find(item=>item.id===selected)!;
 return <section className="im-panel" aria-label="Som ambiente opcional"><div className="im-toolbar"><label>Som ambiente opcional <select aria-label="Escolher som ambiente" value={selected} disabled={loading} onChange={event=>{resourceAudioManager.stop(channel);setSelected(event.target.value);}}>{ambientSounds.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label><Button secondary disabled={loading || paused} onClick={()=>{if(playback && !playback.paused)resourceAudioManager.pause(channel);else if(playback)void resourceAudioManager.resume(channel).then(ok=>{if(!ok)setError("Não foi possível retomar o som.");});else void play();}}>{loading ? "Preparando som…" : playback && !playback.paused ? "Pausar som" : playback ? "Retomar som" : "Ouvir ambiente"}</Button><Button secondary disabled={!playback && !loading} onClick={()=>resourceAudioManager.stop(channel)}>Parar som ambiente</Button></div>
 {playback && <label className="fv-field"><span>Volume ambiente</span><input aria-label="Volume ambiente" type="range" min="0" max="100" value={Math.round(playback.volume*100)} onChange={event=>resourceAudioManager.setVolume(channel,Number(event.target.value)/100)}/></label>}
 <details><summary>Créditos do som</summary><p>{item.credit} · <a href={item.source} target="_blank" rel="noreferrer">Fonte</a> · <a href={item.licenseUrl} target="_blank" rel="noreferrer">{item.license}</a></p><p>{item.description}</p></details>{error && <p role="alert">{error}</p>}</section>;
}

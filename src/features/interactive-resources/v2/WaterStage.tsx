"use client";
import dynamic from "next/dynamic";
import {Component,useCallback,useEffect,useRef,useState,type ReactNode} from "react";
import {useResourceMotion} from "./ResourceShell";
import {ChevronLeft,ChevronRight,CloudRain,Crosshair,Droplets,Image as ImageIcon,Pause,Play,Sunset,Volume2,Wind} from "lucide-react";
import {AmbientControl} from "./immersive/AmbientControl";
import {IllustrationSlot} from "./illustration/IllustrationSlot";
import "./immersive/immersive.css";
const RiverScene=dynamic(()=>import("./immersive/RiverScene"),{ssr:false,loading:()=> <p role="status">Preparando o rio em 3D…</p>});
class RiverBoundary extends Component<{children:ReactNode;fallback:ReactNode;onFailure:()=>void},{failed:boolean}> {
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(error:Error){console.error("Falha ao renderizar o Igarapé:",error);this.props.onFailure();}render(){return this.state.failed ? this.props.fallback : this.props.children;}
}
export function WaterStage({forceStatic=false,showAmbient=false}:{forceStatic?:boolean;showAmbient?:boolean}) {
 const [rain,setRain]=useState(false),[wind,setWind]=useState(false),[sunset,setSunset]=useState(false),[staticChoice,setStatic]=useState(forceStatic),[paused,setPaused]=useState(false),[unavailable,setUnavailable]=useState(false),[touches,setTouches]=useState(0),[touchSignal,setTouchSignal]=useState(0),[visible,setVisible]=useState(true);
 const [view,setView]=useState({yaw:0,pitch:0});
 const updateView=useCallback((next:{yaw:number;pitch:number})=>setView(next),[]);
 const root=useRef<HTMLDivElement>(null);const motion=!useResourceMotion();const reduced=!motion || staticChoice;
 useEffect(()=>{if(!root.current || typeof IntersectionObserver==="undefined")return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));observer.observe(root.current);return()=>observer.disconnect();},[]);
 const art=<IllustrationSlot slot={{path:"/brand/recursos/igarape/margem.webp",ratio:"16:9",alt:"Paisagem em aquarela de um rio entre margens verdes, com reflexos das árvores na água.",brief:""}}/>;
 const off=reduced || unavailable;
 return <><div ref={root} className="im-river-scene" aria-label="Cena do rio">{off ? art : <RiverBoundary fallback={art} onFailure={()=>setUnavailable(true)}><RiverScene view={view} onViewChange={updateView} paused={paused} visible={visible} wind={wind} rain={rain} sunset={sunset} touchSignal={touchSignal} onTouch={()=>setTouches(value=>value+1)} onFailure={()=>setUnavailable(true)}/></RiverBoundary>}
  <div className="im-river-title" role="group" aria-label="Sobre esta cena"><strong>Acompanhar o Igarapé</strong><span>Águas, reflexos e leito para observar.</span></div>
  <p className="im-river-hint">{off ? "Paisagem estática · no seu tempo" : paused ? "Rio em pausa" : "Toque na água · use as setas para olhar ao redor"}</p>
  <div className="im-look" role="group" aria-label="Olhar ao redor">
   <button type="button" className="im-look-btn im-look-left" aria-label="Olhar à esquerda" disabled={off} onClick={()=>setView(value=>({...value,yaw:Math.max(-.38,value.yaw-.12)}))}><ChevronLeft size={22} aria-hidden="true"/></button>
   <button type="button" className="im-look-btn im-look-right" aria-label="Olhar à direita" disabled={off} onClick={()=>setView(value=>({...value,yaw:Math.min(.38,value.yaw+.12)}))}><ChevronRight size={22} aria-hidden="true"/></button>
   <button type="button" className="im-look-btn im-look-center" aria-label="Centralizar visão" disabled={off} onClick={()=>setView({yaw:0,pitch:0})}><Crosshair size={18} aria-hidden="true"/></button>
  </div>
  <div className="im-river-overlay"><div className="im-water-controls" role="group" aria-label="Controles do Igarapé">
   <button type="button" className="fv-chip" aria-label="Tocar a água" disabled={off || paused} onClick={()=>{setTouchSignal(value=>value+1);setTouches(value=>value+1);}}><Droplets size={15} aria-hidden="true"/>Tocar</button>
   <button type="button" className="fv-chip" aria-pressed={rain} disabled={off} onClick={()=>setRain(value=>!value)}><CloudRain size={15} aria-hidden="true"/>Chuva</button>
   <button type="button" className="fv-chip" aria-pressed={wind} disabled={off} onClick={()=>setWind(value=>!value)}><Wind size={15} aria-hidden="true"/>Vento</button>
   <button type="button" className="fv-chip" aria-pressed={sunset} disabled={off} onClick={()=>setSunset(value=>!value)}><Sunset size={15} aria-hidden="true"/>Entardecer</button>
   <button type="button" className="fv-chip" aria-label={paused ? "Retomar água" : "Pausar água"} aria-pressed={paused} disabled={off} onClick={()=>setPaused(value=>!value)}>{paused ? <Play size={15} aria-hidden="true"/> : <Pause size={15} aria-hidden="true"/>}{paused ? "Retomar" : "Pausar"}</button>
   <button type="button" className="fv-chip" aria-label="Modo estático" aria-pressed={off} disabled={!motion || unavailable} onClick={()=>setStatic(value=>!value)}><ImageIcon size={15} aria-hidden="true"/>Estático</button>
   {showAmbient && <details className="im-river-audio"><summary className="fv-chip"><Volume2 size={15} aria-hidden="true"/>Som</summary><AmbientControl channel="igarape"/></details>}
  </div></div></div>{unavailable && <p role="status" className="fv-note">O 3D está indisponível neste navegador. A paisagem permanece disponível.</p>}<span className="im-river-status" aria-live="polite">{touches ? `Toques na água: ${touches}.` : ""} {reduced ? "Movimento reduzido ativo." : ""}</span></>;
}

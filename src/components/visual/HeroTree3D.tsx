"use client";
import {useEffect,useRef,useState} from "react";
import { HERO_FONTS } from "./hero-fonts";
import styles from "./HeroTree3D.module.css";

export default function HeroTree3D({background=false}:{background?:boolean}) {
 const root=useRef<HTMLDivElement>(null);
 const summon=useRef<(() => void) | null>(null);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[phrase,setPhrase]=useState("");
 useEffect(()=>{
  let disposed=false;let cleanup: (()=>void) | undefined;
  void import("./hero-tree-scene").then(({mountHeroTree})=>{
   if(disposed || !root.current)return;
   cleanup=mountHeroTree(root.current, (action:()=>void)=>{if(!disposed){summon.current=action;setReady(true);}}, (message:string)=>{if(!disposed)setPhrase(message);}, background, HERO_FONTS);
  }).catch(()=>{if(!disposed)setFailed(true);});
  return ()=>{disposed=true;summon.current=null;cleanup?.();};
 },[background]);
 return <div className={styles.wrapper}>
  <div ref={root} className={styles.stage}>
   <canvas data-tree-node="scene" className={styles.canvas} tabIndex={background ? -1 : 0} aria-label={background ? undefined : "Árvore Figura Viva em três dimensões. Toque em uma folha ou pressione Enter para receber uma mensagem."} aria-hidden={background || undefined}/>
   <div className={styles.hidden} aria-hidden="true"><div data-tree-node="loading"><span data-tree-node="loading-text"/></div><span data-tree-node="hint"/><button data-tree-node="btn-msg" type="button" tabIndex={-1}/><button data-tree-node="btn-gust" type="button" tabIndex={-1}/><button data-tree-node="btn-dock" type="button" tabIndex={-1}/><div data-tree-node="dock"/><input data-tree-node="wind" type="range" tabIndex={-1}/><span data-tree-node="wind-out"/><input data-tree-node="fall" type="range" tabIndex={-1}/><span data-tree-node="fall-out"/><input data-tree-node="auto" type="checkbox" tabIndex={-1}/><span data-tree-node="phrase-live"/></div>
  </div>
  {!background && <div className={styles.controls}><button type="button" onClick={()=>summon.current?.()} disabled={!ready}>Colher uma mensagem</button><span>Toque nas folhas para descobrir</span></div>}
  <p className={styles.srOnly} aria-live="polite">{phrase}</p>
 </div>;
}

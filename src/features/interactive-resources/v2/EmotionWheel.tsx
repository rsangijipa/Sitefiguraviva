"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import type {EditorialItem} from "./editorial-schema";
import {useResourceMotion} from "./ResourceShell";
import {Button} from "./ui";
import "./immersive/immersive.css";
export function EmotionWheel({items,selected,onSelect}:{items:EditorialItem[];selected:string;onSelect:(id:string)=>void}) {
 const [turn,setTurn]=useState(0),[radius,setRadius]=useState(160);
 const container=useRef<HTMLDivElement>(null);const motion=!useResourceMotion();
 useEffect(()=>{if(!container.current || typeof ResizeObserver==="undefined")return;const resize=new ResizeObserver(entries=>setRadius(entries[0].contentRect.width*.37));resize.observe(container.current);return()=>resize.disconnect();},[]);
 if(items.length>12)return <p className="fv-note">Este acervo tem {items.length} emoções. Use a lista para explorar todos os nomes.</p>;
 return <div className={motion ? "" : "im-reduced"}><div ref={container} className="im-wheel-viewport"><div className="im-wheel" role="group" aria-label="Roda 3D das emoções" style={{"--turn":`${turn}deg`,"--radius":`${radius}px`} as CSSProperties}>
 {items.map((item,index)=><button type="button" className="im-wheel-item" key={item.id} aria-label={item.title} aria-pressed={selected===item.id} style={{"--angle":`${index/items.length*360}deg`} as CSSProperties} onClick={()=>onSelect(selected===item.id ? "" : item.id)}>{item.title}</button>)}<span className="im-wheel-center" aria-hidden="true">Perceber<br/>e nomear</span></div><div className="im-wheel-controls"><Button secondary disabled={!motion} onClick={()=>setTurn(value=>value-360/items.length)}>Girar à esquerda</Button><Button secondary disabled={!motion} onClick={()=>setTurn(value=>value+360/items.length)}>Girar à direita</Button></div></div></div>;
}

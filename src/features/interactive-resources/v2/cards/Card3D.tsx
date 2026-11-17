"use client";

import {useEffect,useRef, type PointerEvent} from "react";
import {RotateCcw, Sparkles} from "lucide-react";
import type {EditorialItem} from "../editorial-schema";
import {ConceptIllustration} from "../illustration/ConceptIllustration";

export function Card3D({item,code,deck,flipped,reduced,onFlip}:{
  item:EditorialItem;code:string;deck:string;flipped:boolean;reduced:boolean;onFlip:()=>void;
}) {
  const tilt=useRef<HTMLDivElement>(null);
  const card=useRef<HTMLDivElement>(null);
  const restoreFocus=useRef(false);
  useEffect(()=>{
    if(!restoreFocus.current)return;
    card.current?.querySelector<HTMLButtonElement>('.cg-face[aria-hidden="false"] button')?.focus({preventScroll:true});
    restoreFocus.current=false;
  },[flipped]);
  const flip=()=>{restoreFocus.current=true;onFlip();};
  const resetTilt=()=>{
    tilt.current?.style.setProperty("--card-tilt-x","0deg");
    tilt.current?.style.setProperty("--card-tilt-y","0deg");
  };
  const move=(event:PointerEvent<HTMLDivElement>)=>{
    if(reduced || event.pointerType!=="mouse")return;
    const bounds=event.currentTarget.getBoundingClientRect();
    tilt.current?.style.setProperty("--card-tilt-x",`${(0.5-(event.clientY-bounds.top)/bounds.height)*8}deg`);
    tilt.current?.style.setProperty("--card-tilt-y",`${((event.clientX-bounds.left)/bounds.width-0.5)*10}deg`);
  };
  const firstSentence=item.text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? item.text;
  return <div className="cg-scene" data-reduced={reduced} onPointerMove={move} onPointerLeave={resetTilt}>
    <div className="cg-tilt" ref={tilt}>
      <div className="cg-card" ref={card} data-flipped={flipped} aria-label={`Carta ${item.title}`}>
        <div className="cg-face cg-front" aria-hidden={flipped} inert={flipped}>
          <div className="cg-card-meta"><span>{deck}</span><span>{code}</span></div>
          <div className="cg-art"><ConceptIllustration item={item} decorative/></div>
          <div className="cg-card-copy"><span className="cg-eyebrow">Um conceito para explorar</span><h3>{item.title}</h3><p>{firstSentence}</p></div>
          <button type="button" className="cg-flip" tabIndex={flipped ? -1 : 0} onClick={flip} aria-label={`Virar carta: ${item.title}`}><RotateCcw size={18} aria-hidden="true"/><span>Virar para refletir</span></button>
        </div>
        <div className="cg-face cg-back" aria-hidden={!flipped} inert={!flipped}>
          <div className="cg-card-meta"><span>Para ficar com isso</span><Sparkles size={18} aria-hidden="true"/></div>
          <div className="cg-question"><span className="cg-eyebrow">{item.title}</span><p>{item.prompt || "O que esta carta desperta em você agora?"}</p></div>
          <p className="cg-back-note">Não é preciso encontrar uma resposta agora.</p>
          <button type="button" className="cg-flip" tabIndex={flipped ? 0 : -1} onClick={flip} aria-label={`Ver conceito: ${item.title}`}><RotateCcw size={18} aria-hidden="true"/><span>Voltar ao conceito</span></button>
        </div>
      </div>
    </div>
  </div>;
}

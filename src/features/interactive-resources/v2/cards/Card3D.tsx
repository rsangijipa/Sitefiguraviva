"use client";

import {useRef, type PointerEvent} from "react";
import {Sparkles} from "lucide-react";
import type {EditorialItem} from "../editorial-schema";
import {ConceptIllustration} from "../illustration/ConceptIllustration";

/** Carta em 3D: inclinação com o ponteiro e giro ao virar. O botão de virar fica na barra de ações abaixo da carta. */
export function Card3D({item,code,deck,flipped,reduced,onFlip}:{
  item:EditorialItem;code:string;deck:string;flipped:boolean;reduced:boolean;onFlip:()=>void;
}) {
  const tilt=useRef<HTMLDivElement>(null);
  const resetTilt=()=>{
    tilt.current?.style.setProperty("--card-tilt-x","0deg");
    tilt.current?.style.setProperty("--card-tilt-y","0deg");
    tilt.current?.style.setProperty("--card-shine-x","50%");
  };
  const move=(event:PointerEvent<HTMLDivElement>)=>{
    if(reduced || event.pointerType!=="mouse")return;
    const bounds=event.currentTarget.getBoundingClientRect();
    const px=(event.clientX-bounds.left)/bounds.width, py=(event.clientY-bounds.top)/bounds.height;
    tilt.current?.style.setProperty("--card-tilt-x",`${(0.5-py)*12}deg`);
    tilt.current?.style.setProperty("--card-tilt-y",`${(px-0.5)*16}deg`);
    tilt.current?.style.setProperty("--card-shine-x",`${px*100}%`);
  };
  const firstSentence=item.text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? item.text;
  return <div className="cg-scene" data-reduced={reduced} onPointerMove={move} onPointerLeave={resetTilt} onClick={onFlip}>
    <div className="cg-tilt" ref={tilt}>
      <div className="cg-card" data-flipped={flipped} aria-label={`Carta ${item.title}`}>
        <div className="cg-face cg-front" aria-hidden={flipped} inert={flipped}>
          <div className="cg-card-meta"><span>{deck}</span><span>{code}</span></div>
          <div className="cg-art"><ConceptIllustration item={item} decorative/></div>
          <div className="cg-card-copy"><span className="cg-eyebrow">Um conceito para explorar</span><h3>{item.title}</h3><p>{firstSentence}</p></div>
          <span className="cg-shine" aria-hidden="true"/>
        </div>
        <div className="cg-face cg-back" aria-hidden={!flipped} inert={!flipped}>
          <div className="cg-card-meta"><span>Para ficar com isso</span><Sparkles size={18} aria-hidden="true"/></div>
          <div className="cg-question"><span className="cg-eyebrow">{item.title}</span><p>{item.prompt || "O que esta carta desperta em você agora?"}</p></div>
          <p className="cg-back-note">Não é preciso encontrar uma resposta agora.</p>
        </div>
      </div>
    </div>
  </div>;
}

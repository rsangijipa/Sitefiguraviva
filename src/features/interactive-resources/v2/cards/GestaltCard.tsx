"use client";

import type {ReactNode} from "react";
import {Bookmark,BookOpen,Check,Maximize2,RotateCcw,Star} from "lucide-react";
import type {EditorialItem} from "../editorial-schema";
import {ReferenceLine} from "../ui";
import {ConceptIllustration} from "../illustration/ConceptIllustration";

export type CardMark="favorite"|"review"|"known";
export const firstSentence=(text:string)=>text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;

/**
 * Carta 2:3 da grade: frente com a ilustração do conceito, verso em papel com a
 * pergunta. As duas faces ocupam a mesma célula, então virar não muda a altura.
 * Os controles ficam fora das faces e não giram com a carta.
 */
export function GestaltCard({item,code,deck,flipped,marks,onFlip,onOpen,onDeepen,onToggle,children}:{
  item:EditorialItem;code:string;deck:string;flipped:boolean;
  marks:Record<CardMark,boolean>;
  onFlip:()=>void;onOpen:()=>void;onDeepen:()=>void;onToggle:(mark:CardMark)=>void;
  children?:ReactNode;
}) {
  const extra=item.references.length-1;
  return <article className="fv-gcard cg-gcard" aria-label={`${item.title}, ${flipped ? "verso" : "frente"}`}>
    <div className="cg-gcard-faces" data-flipped={flipped}>
      <div className="fv-gcard-face cg-gcard-front" aria-hidden={flipped} inert={flipped}>
        <span className="fv-gcard-label">{deck} · {code}</span>
        <div className="fv-gcard-art"><ConceptIllustration item={item} decorative/></div>
        <h3>{item.title}</h3>
        <p className="fv-gcard-text">{firstSentence(item.text)}</p>
        {/* A frente leva a primeira referência; a lista completa fica em "Aprofundar". */}
        {!!item.references.length && <ReferenceLine item={{...item,references:item.references.slice(0,1)}}/>}
        {extra>0 && <span className="fv-gcard-more">+{extra} {extra===1 ? "referência" : "referências"} em Aprofundar</span>}
      </div>
      <div className="fv-gcard-face cg-gcard-back" aria-hidden={!flipped} inert={!flipped}>
        <span className="fv-gcard-label fv-gcard-label--back">Para ficar com isso</span>
        <p className="fv-gcard-question">{item.prompt || "O que esta carta desperta em você agora?"}</p>
        <span className="fv-gcard-meta">{item.title} · {code}</span>
      </div>
    </div>
    <div className="fv-gcard-actions">
      <button type="button" className="fv-button fv-button--secondary" onClick={onFlip} aria-label={`${flipped ? "Ver conceito" : "Virar carta"}: ${item.title}`}><RotateCcw size={16} aria-hidden="true"/>{flipped ? "Ver conceito" : "Virar carta"}</button>
      <button type="button" className="fv-button fv-button--secondary" onClick={onOpen} data-open-card={item.id} aria-label={`Abrir em destaque: ${item.title}`}><Maximize2 size={16} aria-hidden="true"/>Abrir em destaque</button>
      <button type="button" className="fv-button fv-button--secondary" onClick={onDeepen} aria-label={`Aprofundar: ${item.title}`}><BookOpen size={16} aria-hidden="true"/>Aprofundar</button>
    </div>
    <div className="fv-gcard-actions fv-gcard-actions--marks" role="group" aria-label={`Marcar ${item.title}`}>
      <button type="button" className="fv-button fv-button--secondary" aria-pressed={marks.favorite} onClick={()=>onToggle("favorite")}><Star size={15} aria-hidden="true"/>Favorita</button>
      <button type="button" className="fv-button fv-button--secondary" aria-pressed={marks.review} onClick={()=>onToggle("review")}><Bookmark size={15} aria-hidden="true"/>Rever</button>
      <button type="button" className="fv-button fv-button--secondary" aria-pressed={marks.known} onClick={()=>onToggle("known")}><Check size={15} aria-hidden="true"/>Já li</button>
    </div>
    {children}
  </article>;
}

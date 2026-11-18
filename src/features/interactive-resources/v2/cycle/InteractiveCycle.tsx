"use client";
import type {KeyboardEvent} from "react";
export function InteractiveCycle({phases,marked,onToggle}:{phases:{id:string;text:string}[];marked:string[];onToggle:(id:string)=>void}) {
 const count=phases.length;
 const key=(event:KeyboardEvent<SVGGElement>,id:string)=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();onToggle(id);}};
 return <div className="cy-diagram"><svg viewBox="0 0 400 360" role="group" aria-label="Ciclo do contato interativo">
  <defs><linearGradient id="cycle-wash" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--fv-areia)"/><stop offset="1" stopColor="var(--fv-creme-papel)"/></linearGradient></defs>
  <ellipse cx="200" cy="180" rx="160" ry="145" fill="url(#cycle-wash)"/>
  <ellipse cx="200" cy="180" rx="125" ry="116" fill="none" stroke="var(--fv-nevoa)" strokeWidth="12"/>
  <ellipse cx="200" cy="180" rx="125" ry="116" fill="none" stroke="var(--fv-verde-igarape)" strokeWidth="2" strokeDasharray="4 7"/>
  <circle cx="200" cy="180" r="69" fill="var(--fv-creme-papel)" stroke="var(--fv-nevoa)" strokeWidth="1"/><text x="200" y="172" textAnchor="middle" className="cy-center">CONTATO</text><text x="200" y="195" textAnchor="middle" className="cy-center-sub">em movimento</text>
  {phases.map((phase,index)=>{const angle=index/Math.max(count,1)*Math.PI*2-Math.PI/2;const x=200+125*Math.cos(angle),y=180+116*Math.sin(angle),selected=marked.includes(phase.id);return <g key={phase.id} role="button" tabIndex={0} aria-label={`Fase ${index+1}: ${phase.text}`} aria-pressed={selected} onClick={()=>onToggle(phase.id)} onKeyDown={event=>key(event,phase.id)} className="cy-node"><circle cx={x} cy={y} r="21" fill={selected ? "var(--fv-verde-raiz)" : "var(--fv-creme-papel)"} stroke="var(--fv-verde-raiz)" strokeWidth="2"/><text x={x} y={y+5} textAnchor="middle" fill={selected ? "var(--fv-creme-papel)" : "var(--fv-verde-raiz)"} fontSize="15" fontWeight="700">{index+1}</text><title>{phase.text}</title></g>;})}
 </svg><p>Toque nos pontos ou use a lista para marcar as etapas percebidas.</p></div>;
}

"use client";
import type { EditorialItem } from "./editorial-schema";
export function EmotionWheel({items,selected,onSelect}:{items:EditorialItem[];selected:string;onSelect:(id:string)=>void}) {
 const count=items.length;
 return <svg className="fv-emotion-wheel" viewBox="0 0 400 400" role="group" aria-label="Roda das emoções do acervo revisado"><circle cx="200" cy="200" r="192" fill="var(--fv-creme-papel)" stroke="var(--fv-nevoa)" strokeWidth="2"/>{items.map((item,index)=>{
  const angle=index/count*Math.PI*2-Math.PI/2;const x=200+128*Math.cos(angle);const y=200+128*Math.sin(angle);
  return <g key={item.id} role="button" tabIndex={0} aria-label={item.title} aria-pressed={selected===item.id} onClick={()=>onSelect(item.id)} onKeyDown={event=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();onSelect(item.id);}}}><circle cx={x} cy={y} r={Math.min(40,360/count)} fill={selected===item.id?"var(--fv-verde-raiz)":"var(--fv-areia)"} stroke="var(--fv-verde-raiz)" strokeWidth="2"/><text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={selected===item.id?"var(--fv-creme-papel)":"var(--fv-mata)"} fontSize="12">{item.title.slice(0,18)}</text><title>{item.title}</title></g>;
 })}<circle cx="200" cy="200" r="54" fill="var(--fv-creme-papel)" stroke="var(--fv-nevoa)" strokeWidth="2"/><text x="200" y="200" textAnchor="middle" dominantBaseline="central" fill="var(--fv-mata)" fontSize="16">Perceber</text></svg>;
}

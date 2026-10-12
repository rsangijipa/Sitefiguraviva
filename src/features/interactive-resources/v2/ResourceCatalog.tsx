"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { resourceCatalog,resourceHref,isPublicResource,type ResourceCategory } from "@/components/resources/resourceCatalog";
import { Button } from "./ui";
const CATEGORIES:ResourceCategory[]=["APRENDER","EXPERIMENTAR","PERCEBER","PAUSAR"];
const CATEGORY_HINTS:Record<ResourceCategory,string>={
 APRENDER:"Conceitos e situações para estudar no seu ritmo.",
 EXPERIMENTAR:"Propostas para experimentar e observar o que acontece.",
 PERCEBER:"Perceber o que está presente em você agora.",
 PAUSAR:"Pausas breves para desacelerar.",
};
const categoryName=(value:ResourceCategory)=>value.charAt(0)+value.slice(1).toLocaleLowerCase("pt-BR");
export function ResourceCatalog({formation=false,preview=false,released=[]}:{formation?:boolean;preview?:boolean;released?:string[]}) {
 const [category,setCategory]=useState<ResourceCategory|null>(null);
 const Heading=formation ? "h1" : "h2";
 const items=resourceCatalog.filter(item=>formation ? item.visibility==="published" || item.visibility==="draft" && (preview || released.includes(item.slug)) : isPublicResource(item));
 const available=CATEGORIES.filter(value=>items.some(item=>item.category===value));
 return <section className="fv-resources" data-register="institucional" aria-label="Recursos Interativos"><div className="fv-content">
  {formation && <header className="fv-header"><span className="fv-label">Figura Viva · Formação</span><Heading>{"Recursos da formação"}</Heading><p>Escolha uma possibilidade para este encontro.</p></header>}
  {available.length>1 && <div className="fv-actions fv-catalog-filter" role="group" aria-label="Filtrar por categoria"><Button secondary aria-pressed={!category} onClick={()=>setCategory(null)}>Todos <span className="fv-count">{items.length}</span></Button>{available.map(value=><Button secondary key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{categoryName(value)} <span className="fv-count">{items.filter(item=>item.category===value).length}</span></Button>)}</div>}
  {available.filter(value=>!category || category===value).map(value=>{
   const grouped=items.filter(item=>item.category===value);
   return <section className="fv-catalog-group" key={value} aria-labelledby={`categoria-${value.toLowerCase()}`}><header className="fv-catalog-heading"><h2 id={`categoria-${value.toLowerCase()}`}>{categoryName(value)}</h2><p>{CATEGORY_HINTS[value]}</p></header><div className="fv-cards">{grouped.map(item=>{const Icon=item.icon;return <article className="fv-card fv-resource-card" key={item.slug}><Icon size={24} strokeWidth={2} aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p><span className="fv-reference">{item.duration==="livre" ? "Tempo livre" : item.duration}</span><div className="fv-actions"><Link className="fv-card-action" href={preview ? `/portal/recursos/${item.slug}?previa=1` : resourceHref(item)}>{preview && item.visibility==="draft" ? "Abrir prévia" : "Abrir recurso"}<span className="sr-only">: {item.title}</span></Link></div></article>;})}</div></section>;
  })}
  {!items.length && <p className="fv-note" role="status">Nenhum recurso disponível no momento.</p>}
  {formation ? <div className="fv-actions"><Link href="/portal/recursos/meus-registros">Meus registros privados</Link>{preview && <Link href="/portal/recursos/revisao">Trabalho editorial</Link>}</div>
   : <aside className="fv-catalog-cta" aria-label="Recursos da formação"><div><span className="fv-label">Para quem está em formação</span><p>Alunos matriculados encontram recursos de estudo exclusivos e um histórico privado de registros.</p></div><Link className="fv-card-action" href="/portal/recursos">Entrar nos recursos da formação <ArrowRight size={18} aria-hidden="true" /></Link></aside>}
 </div></section>;
}

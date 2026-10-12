"use client";
import Link from "next/link";
import { useState } from "react";
import { resourceCatalog,resourceHref,isPublicResource,type ResourceCategory } from "@/components/resources/resourceCatalog";
import { Button } from "./ui";
const CATEGORIES:ResourceCategory[]=["APRENDER","EXPERIMENTAR","PERCEBER","PAUSAR"];
export function ResourceCatalog({formation=false,preview=false,released=[]}:{formation?:boolean;preview?:boolean;released?:string[]}) {
 const [category,setCategory]=useState<ResourceCategory|null>(null);
 const Heading=formation ? "h1" : "h2";
 const items=resourceCatalog.filter(item=>formation ? item.visibility==="published" || item.visibility==="draft" && (preview || released.includes(item.slug)) : isPublicResource(item));
 return <section className="fv-resources" data-register="institucional" aria-label="Recursos Interativos"><div className="fv-content">
  {formation && <header className="fv-header"><span className="fv-label">Figura Viva · Formação</span><Heading>{"Recursos da formação"}</Heading><p>Escolha uma possibilidade para este encontro.</p></header>}
  {formation && <div className="fv-actions" role="group" aria-label="Categorias"><Button secondary aria-pressed={!category} onClick={()=>setCategory(null)}>Todos</Button>{CATEGORIES.map(value=><Button secondary key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value.charAt(0)+value.slice(1).toLocaleLowerCase("pt-BR")}</Button>)}</div>}
  {CATEGORIES.filter(value=>!category || category===value).map(value=>{
   const grouped=items.filter(item=>item.category===value);
   return grouped.length ? <section className="fv-catalog-group" key={value}><h2>{value.charAt(0)+value.slice(1).toLocaleLowerCase("pt-BR")}</h2><div className="fv-cards">{grouped.map(item=>{const Icon=item.icon;return <article className="fv-card fv-resource-card" key={item.slug}><Icon size={24} strokeWidth={2} aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p><span className="fv-reference">{item.duration}</span><div className="fv-actions"><Link className="fv-card-action" href={preview ? `/portal/recursos/${item.slug}?previa=1` : resourceHref(item)}>{preview && item.visibility==="draft" ? "Abrir prévia" : "Abrir recurso"}</Link></div></article>;})}</div></section> : null;
  })}
  <div className="fv-actions"><Link href={formation ? "/portal/recursos/meus-registros" : "/portal/recursos"}>{formation ? "Meus registros privados" : "Entrar nos recursos da formação"}</Link>{preview && <Link href="/portal/recursos/revisao">Trabalho editorial</Link>}</div>
 </div></section>;
}

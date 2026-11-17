"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { resourceCatalog,resourceHref,isPublicResource,type ResourceCategory } from "@/components/resources/resourceCatalog";
import { Button } from "./ui";
import { IllustrationSlot } from "./illustration/IllustrationSlot";
import { SLOTS,conceptSlot } from "./illustration/slots";
const CATEGORIES:ResourceCategory[]=["APRENDER","EXPERIMENTAR","PERCEBER","PAUSAR"];
const CATEGORY_HINTS:Record<ResourceCategory,string>={
 APRENDER:"Conceitos e situações para estudar no seu ritmo.",
 EXPERIMENTAR:"Propostas para experimentar e observar o que acontece.",
 PERCEBER:"Perceber o que está presente em você agora.",
 PAUSAR:"Pausas breves para desacelerar.",
};
const categoryName=(value:ResourceCategory)=>value.charAt(0)+value.slice(1).toLocaleLowerCase("pt-BR");
const INTENTS:Record<ResourceCategory,string>={APRENDER:"Quero estudar",EXPERIMENTAR:"Quero experimentar",PERCEBER:"Quero me perceber",PAUSAR:"Quero uma pausa"};
const COVERS={
 "cartas-gestalticas":SLOTS.copa,"figura-e-fundo":SLOTS.rubin,"ciclo-do-contato":conceptSlot("autorregulacao"),
 "fronteiras-de-contato":SLOTS.fronteira,casoteca:conceptSlot("campo"),"polaridades-e-cadeiras":SLOTS.cadeiras,
 chegada:{path:"/brand/recursos/chegada/abertura.webp",ratio:"16:9" as const,alt:"",brief:""},"mapa-do-corpo":conceptSlot("corpo"),"roda-das-emocoes":conceptSlot("polaridades"),
 "necessidades-agora":conceptSlot("presenca"),"paisagem-de-pensamentos":conceptSlot("territorio"),
 "sons-para-awareness":SLOTS.practice("ouvir"),"sala-de-pausa":SLOTS.practice("respirar"),igarape:SLOTS.practice("desacelerar"),
 "laboratorio-fenomenologico":conceptSlot("descricao"),"atelie-do-experimento":conceptSlot("ajustamento"),"escuta-dialogica":conceptSlot("eu-tu"),
};
export function ResourceCatalog({formation=false,preview=false,released=[]}:{formation?:boolean;preview?:boolean;released?:string[]}) {
 const [category,setCategory]=useState<ResourceCategory|null>(null);
 const [duration,setDuration]=useState("all");
 const Heading=formation ? "h1" : "h2";
 const items=resourceCatalog.filter(item=>formation ? item.visibility==="published" || item.visibility==="draft" && (preview || released.includes(item.slug)) : isPublicResource(item));
 const available=CATEGORIES.filter(value=>items.some(item=>item.category===value));
 const filtered=items.filter(item=>{
  if(category && item.category!==category)return false;
  if(duration==="all")return true;
  if(duration==="free")return item.duration==="livre";
  const maximum=Number(item.duration.match(/\d+/g)?.at(-1));
  return duration==="short" ? maximum<=5 : maximum>5;
 });
 return <section className="fv-resources" data-register="institucional" aria-label="Recursos Interativos"><div className="fv-content">
  {formation && <header className="fv-header"><span className="fv-label">Figura Viva · Formação</span><Heading>{"Recursos da formação"}</Heading><p>Escolha uma possibilidade para este encontro.</p></header>}
  <div className="fv-catalog-discovery"><div><span className="fv-label">O que cabe agora?</span><p>Escolha pelo que você procura e pelo tempo disponível.</p></div><label className="fv-field"><span>Tempo disponível</span><select value={duration} onChange={event=>setDuration(event.target.value)}><option value="all">Qualquer duração</option><option value="short">Até 5 minutos</option><option value="long">Mais de 5 minutos</option><option value="free">Tempo livre</option></select></label></div>
  {available.length>1 && <div className="fv-actions fv-catalog-filter" role="group" aria-label="Filtrar por categoria"><Button secondary aria-pressed={!category} onClick={()=>setCategory(null)}>Todos <span className="fv-count">{items.length}</span></Button>{available.map(value=><Button secondary key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{categoryName(value)} <span className="fv-count">{items.filter(item=>item.category===value).length}</span></Button>)}</div>}
  <p className="fv-mode-status" role="status">{filtered.length} {filtered.length===1 ? "recurso disponível" : "recursos disponíveis"}.{category ? ` ${INTENTS[category]}.` : ""}</p>
  {available.filter(value=>filtered.some(item=>item.category===value)).map(value=>{
   const grouped=filtered.filter(item=>item.category===value);
   return <section className="fv-catalog-group" key={value} aria-labelledby={`categoria-${value.toLowerCase()}`}><header className="fv-catalog-heading"><h2 id={`categoria-${value.toLowerCase()}`}>{categoryName(value)}</h2><p>{CATEGORY_HINTS[value]}</p></header><div className="fv-cards">{grouped.map(item=>{const Icon=item.icon;const cover=COVERS[item.slug as keyof typeof COVERS];return <article className="fv-card fv-resource-card" key={item.slug}>{cover && <IllustrationSlot slot={cover} decorative className="fv-catalog-cover"/>}<Icon size={24} strokeWidth={2} aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p><span className="fv-reference">{item.duration==="livre" ? "Tempo livre" : item.duration}</span><div className="fv-actions"><Link className="fv-card-action" href={preview ? `/portal/recursos/${item.slug}?previa=1` : formation ? `/portal/recursos/${item.slug}` : resourceHref(item)} aria-label={`${preview && item.visibility==="draft" ? "Abrir prévia" : "Abrir recurso"}: ${item.title}`}>{preview && item.visibility==="draft" ? "Abrir prévia" : "Abrir recurso"}</Link></div></article>;})}</div></section>;
  })}
  {!filtered.length && <div className="fv-note"><p>Nenhum recurso corresponde a esta combinação.</p><Button secondary onClick={()=>{setCategory(null);setDuration("all");}}>Limpar filtros</Button></div>}
  {formation ? <div className="fv-actions"><Link href="/portal/recursos/meus-registros">Meus registros privados</Link>{preview && <Link href="/portal/recursos/revisao">Trabalho editorial</Link>}</div>
   : <aside className="fv-catalog-cta" aria-label="Recursos da formação"><div><span className="fv-label">Para quem está em formação</span><p>Alunos matriculados encontram recursos de estudo exclusivos e um histórico privado de registros.</p></div><Link className="fv-card-action" href="/portal/recursos">Entrar nos recursos da formação <ArrowRight size={18} aria-hidden="true" /></Link></aside>}
 </div></section>;
}

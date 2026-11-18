"use client";

import {useState} from "react";
import {ArrowLeft,ArrowRight,Bookmark,BookOpen,Check,Layers,RotateCcw,Search,Shuffle,ShoppingCart,Star} from "lucide-react";
import {DECKS,type EditorialItem} from "../editorial-schema";
import {useExperienceDraft,type ExperienceProps} from "../experience-types";
import {useResourceMotion} from "../ResourceShell";
import {Button,Dialog,EmptyContent,TextArea} from "../ui";
import {amazonLinkFor} from "./amazon-links";
import {ConceptIllustration} from "../illustration/ConceptIllustration";
import {Canopy} from "../illustration/scenes";
import {Card3D} from "./Card3D";
import "./cards.css";

type View="acervo"|"selecao"|"acaso";
type Selection="todas"|"favoritas"|"rever"|"lidas";
const normalize=(text:string)=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
const deckTitle=(id:string)=>DECKS.find(deck=>deck.id===id)?.title ?? "Conceitos";
const cardCode=(index:number)=>`FV-C${String(index+1).padStart(3,"0")}`;

export function CardsExperience(props:ExperienceProps) {
  const [view,setView]=useState<View>(props.mode==="copa" ? "acaso" : props.mode==="revisar" ? "selecao" : "acervo");
  const [selection,setSelection]=useState<Selection>(props.mode==="revisar" ? "rever" : "todas");
  const [deck,setDeck]=useState("");
  const [search,setSearch]=useState("");
  const [currentId,setCurrentId]=useState<string|null>(null);
  const [flippedId,setFlippedId]=useState<string|null>(null);
  const [detailId,setDetailId]=useState<string|null>(null);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [review,setReview]=useState<string[]>([]);
  const [known,setKnown]=useState<string[]>([]);
  const [reflection,setReflection]=useState("");
  const [leaf,setLeaf]=useState<number|null>(null);
  const reduced=useResourceMotion();
  const payload={favorites,review,known,reflection};
  useExperienceDraft(payload,props.onDraft);
  const items=props.version?.configuration.items.filter(item=>item.kind==="card") ?? [];
  if(!items.length)return <EmptyContent/>;

  const marked=new Set([...favorites,...review,...known]);
  const selectedIds=selection==="favoritas" ? favorites : selection==="rever" ? review : selection==="lidas" ? known : [...marked];
  const query=normalize(search.trim());
  const visible=view==="acaso" ? items : items.filter(item=>(!deck || item.deck===deck) && (!query || normalize(`${item.title} ${item.text} ${deckTitle(item.deck)}`).includes(query)) && (view!=="selecao" || selectedIds.includes(item.id)));
  const current=visible.find(item=>item.id===currentId) ?? visible[0];
  const position=current ? visible.findIndex(item=>item.id===current.id) : -1;
  const detail=items.find(item=>item.id===detailId);
  const code=(item:EditorialItem)=>cardCode(items.findIndex(value=>value.id===item.id));
  const choose=(id:string)=>{setCurrentId(id);setFlippedId(null);};
  const toggle=(id:string,update:React.Dispatch<React.SetStateAction<string[]>>)=>update(values=>values.includes(id) ? values.filter(value=>value!==id) : [...values,id]);
  const pick=(pickedLeaf:number|null=null)=>{
    const candidates=items.filter(item=>item.id!==(currentId ?? current?.id));
    const next=(candidates.length ? candidates : items)[Math.floor(Math.random()*(candidates.length || items.length))];
    choose(next.id);setLeaf(pickedLeaf);
  };
  const changeView=(next:View)=>{
    setView(next);setFlippedId(null);setDeck("");setSearch("");
    if(next==="acaso")pick();
  };
  const resetFilters=()=>{setDeck("");setSearch("");setFlippedId(null);};
  const openRelated=(id:string)=>{
    setView("acervo");resetFilters();choose(id);setDetailId(null);
  };

  const flipLabel=current ? (flippedId===current.id ? `Ver conceito: ${current.title}` : `Virar carta: ${current.title}`) : "";
  const flipCurrent=()=>current && setFlippedId(value=>value===current.id ? null : current.id);
  const decks=DECKS.filter(value=>items.some(item=>item.deck===value.id));

  return <div className="cg-app" data-reduced={reduced}>
    <div className="cg-bar">
      <div className="cg-tabs" role="group" aria-label="Como explorar as cartas">
        <button type="button" aria-pressed={view==="acervo"} onClick={()=>changeView("acervo")}><Layers size={15} aria-hidden="true"/>Explorar acervo</button>
        <button type="button" aria-pressed={view==="selecao"} onClick={()=>changeView("selecao")}><Bookmark size={15} aria-hidden="true"/>Minhas cartas <span className="cg-count">{marked.size}</span></button>
        <button type="button" aria-pressed={view==="acaso"} onClick={()=>changeView("acaso")}><Shuffle size={15} aria-hidden="true"/>Colher ao acaso</button>
      </div>
      {view!=="acaso" && <div className="cg-search" role="search"><Search size={16} aria-hidden="true"/><input type="search" aria-label="Buscar carta ou conceito" value={search} placeholder="Buscar conceito, autor, awareness…" onChange={event=>{setSearch(event.target.value);setFlippedId(null);}}/><select aria-label="Assunto" value={deck} onChange={event=>{setDeck(event.target.value);setFlippedId(null);}}><option value="">Todos os assuntos</option>{decks.map(value=><option key={value.id} value={value.id}>{value.title}</option>)}</select></div>}
    </div>
    {view==="selecao" && <div className="cg-selection" role="group" aria-label="Filtrar minhas cartas">{([['todas','Todas',marked.size],['favoritas','Favoritas',favorites.length],['rever','Para rever',review.length],['lidas','Já li',known.length]] as const).map(([value,label,count])=><button type="button" key={value} aria-pressed={selection===value} onClick={()=>{setSelection(value);setFlippedId(null);}}>{label} <span>{count}</span></button>)}</div>}

    {!current ? <section className="cg-empty"><Bookmark size={28} aria-hidden="true"/><h3>{view==="selecao" && !marked.size ? "Sua seleção começa por uma carta." : "Nenhuma carta por aqui ainda."}</h3><p>{view==="selecao" && !marked.size ? "Ao explorar, marque uma favorita, uma carta para rever ou uma leitura concluída. Suas escolhas aparecem aqui." : "Experimente outro assunto, outra busca ou outro filtro de seleção."}</p><div className="fv-actions"><Button secondary onClick={resetFilters}>Limpar busca e baralho</Button><Button onClick={()=>{setSelection("todas");changeView("acervo");}}>Explorar acervo</Button></div></section> : <>
      <div className="cg-workspace">
        <aside className="cg-browser" aria-label={view==="acaso" ? "Colher uma carta" : "Cartas disponíveis"}>
          {view==="acaso" ? <div className="cg-random"><span className="cg-eyebrow">Um encontro com o acaso</span><h3>O que esta carta desperta?</h3><p>Permaneça com ela pelo tempo que fizer sentido.</p><Button secondary onClick={()=>pick()}><Shuffle size={16} aria-hidden="true"/>Colher outra carta</Button><details><summary>Escolher uma folha da árvore</summary><Canopy onPick={pick} picked={leaf}/></details></div> : <>
            <div className="cg-browser-heading"><h3>{view==="selecao" ? "Sua seleção" : "Baralho"}</h3><span>{visible.length}</span></div>
            <label className="cg-mobile-picker"><span>Escolher carta</span><select value={current.id} onChange={event=>choose(event.target.value)}>{visible.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <ol className="cg-tiles">{visible.map((item,index)=><li key={item.id}><button type="button" title={`${item.title} · ${deckTitle(item.deck)}`} aria-label={item.title} aria-pressed={current.id===item.id} data-fav={favorites.includes(item.id)} onClick={()=>choose(item.id)}>{String(index+1).padStart(2,"0")}</button></li>)}</ol>
          </>}
        </aside>

        <section className="cg-reader" aria-label="Carta em destaque">
          <p className="cg-position" role="status">{view==="acaso" ? "Sua carta do momento" : `Carta ${position+1} de ${visible.length}`}<span> · {current.title}</span></p>
          <Card3D key={current.id} item={current} code={code(current)} deck={deckTitle(current.deck)} flipped={flippedId===current.id} reduced={reduced} onFlip={flipCurrent}/>
          <div className="cg-dock" role="group" aria-label="Marcar esta carta">
            <button type="button" className="cg-act" onClick={event=>{event.currentTarget.focus();flipCurrent();}} aria-label={flipLabel}><RotateCcw size={15} aria-hidden="true"/>{flippedId===current.id ? "Voltar ao conceito" : "Virar para refletir"}</button>
            <button type="button" className="cg-act" aria-pressed={favorites.includes(current.id)} onClick={()=>toggle(current.id,setFavorites)}><Star size={15} aria-hidden="true"/>{favorites.includes(current.id) ? "Favorita" : "Favoritar"}</button>
            <button type="button" className="cg-act" aria-pressed={review.includes(current.id)} onClick={()=>toggle(current.id,setReview)}><Bookmark size={15} aria-hidden="true"/>Para rever</button>
            <button type="button" className="cg-act" aria-pressed={known.includes(current.id)} onClick={()=>toggle(current.id,setKnown)}><Check size={15} aria-hidden="true"/>{known.includes(current.id) ? "Lida" : "Marcar como lida"}</button>
            <button type="button" className="cg-act" onClick={()=>setDetailId(current.id)}><BookOpen size={15} aria-hidden="true"/>Ler conceito completo e referências</button>
          </div>
          {view!=="acaso" && <nav className="cg-pagination" aria-label="Percorrer cartas"><button type="button" disabled={position===0} onClick={()=>choose(visible[position-1].id)}><ArrowLeft size={16} aria-hidden="true"/>Anterior</button><span>{position+1} / {visible.length}</span><button type="button" disabled={position===visible.length-1} onClick={()=>choose(visible[position+1].id)}>Próxima<ArrowRight size={16} aria-hidden="true"/></button></nav>}
        </section>
      </div>
    </>}

    <footer className="cg-footer"><span className="cg-stat"><Layers size={14} aria-hidden="true"/>{items.length} cartas no acervo · suas marcações ficam nesta experiência</span><details><summary>Nota de estudo <span>(opcional)</span></summary><TextArea label="Uma nota de estudo, se quiser" value={reflection} onChange={setReflection}/></details><Button onClick={()=>props.onComplete(payload)}>Concluir estudo<ArrowRight size={16} aria-hidden="true"/></Button></footer>

    <Dialog title={detail?.title ?? "Conceito"} open={!!detail} onClose={()=>setDetailId(null)}>{detail && <article className="cg-detail2 fv-print-card">
      <header className="cg-hero"><div className="cg-hero-art"><ConceptIllustration item={detail}/></div><span className="cg-hero-badge cg-hero-deck">{deckTitle(detail.deck)}</span><span className="cg-hero-badge cg-hero-code">{code(detail)}</span><div className="cg-hero-title"><h3>{detail.title}</h3></div></header>
      <section className="cg-box"><h4>Conceito</h4><p>{detail.text}</p></section>
      {detail.prompt && <section className="cg-box"><h4>Para ficar com isso</h4><p>{detail.prompt}</p></section>}
      {detail.teacherResponse && <section className="cg-box"><p>{detail.teacherResponse}</p></section>}
      {!!detail.references.length && <section className="cg-box"><h4>Referências</h4><ul className="cg-refs">{detail.references.map((reference,index)=>{const link=amazonLinkFor(reference.author,reference.work);return <li key={index}><span>{reference.author} · <a href={link.url} target="_blank" rel="noopener noreferrer">{reference.work}</a>{reference.year ? ` · ${reference.year}` : ""}{reference.edition ? ` · ${reference.edition}` : ""}{reference.pages ? ` · p. ${reference.pages}` : ""}</span><a className="cg-amz" href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.kind==="direto" ? "Comprar" : "Buscar"} ${reference.work} na Amazon (abre em nova aba)`} title={link.kind==="direto" ? "Ver na Amazon" : "Buscar na Amazon"}><ShoppingCart size={14} aria-hidden="true"/></a></li>;})}</ul></section>}
      {!!detail.relatedConcepts.filter(id=>items.some(item=>item.id===id)).length && <section className="cg-box"><h4>Conversa com</h4><ul className="cg-links">{detail.relatedConcepts.map(id=>{const related=items.find(item=>item.id===id);return related ? <li key={id}><button type="button" className="cg-link" onClick={()=>openRelated(id)}>Abrir carta relacionada: {related.title}<ArrowRight size={14} aria-hidden="true"/></button></li> : null;})}</ul></section>}
      <div className="fv-actions"><Button secondary onClick={()=>window.print()}>Imprimir ou salvar ficha em PDF</Button></div>
    </article>}</Dialog>
  </div>;
}

"use client";

import {useEffect,useRef,useState,type KeyboardEvent} from "react";
import {ArrowLeft,ArrowRight,Bookmark,BookOpen,Check,LayoutGrid,Layers,Search,Shuffle,Star} from "lucide-react";
import {DECKS,type EditorialItem} from "../editorial-schema";
import {useExperienceDraft,type ExperienceProps} from "../experience-types";
import {useResourceMotion} from "../ResourceShell";
import {Button,Dialog,EmptyContent,ReferenceLine,TextArea} from "../ui";
import {ConceptIllustration} from "../illustration/ConceptIllustration";
import {Canopy} from "../illustration/scenes";
import {Card3D} from "./Card3D";
import {GestaltCard,type CardMark} from "./GestaltCard";
import "./cards.css";

type View="acervo"|"selecao"|"acaso";
type Selection="todas"|"favoritas"|"rever"|"lidas";
const normalize=(text:string)=>text.normalize("NFD").replace(/[̀-ͯ]/g,"").toLocaleLowerCase("pt-BR");
const deckTitle=(id:string)=>DECKS.find(deck=>deck.id===id)?.title ?? "Conceitos";
const cardCode=(index:number)=>`FV-C${String(index+1).padStart(3,"0")}`;

/**
 * Acervo e seleção abrem numa grade ilustrada; cada carta pode ser virada ali
 * mesmo ou aberta em destaque, na carta 3D. "Colher ao acaso" mostra uma carta
 * só. Os três caminhos compartilham marcações, cartas viradas e nota.
 */
export function CardsExperience(props:ExperienceProps) {
  const [view,setView]=useState<View>(props.mode==="copa" ? "acaso" : props.mode==="revisar" ? "selecao" : "acervo");
  const [selection,setSelection]=useState<Selection>(props.mode==="revisar" ? "rever" : "todas");
  const [deck,setDeck]=useState("");
  const [search,setSearch]=useState("");
  const [currentId,setCurrentId]=useState<string|null>(null);
  const [focused,setFocused]=useState(false);
  const [flipped,setFlipped]=useState<string[]>([]);
  const [detailId,setDetailId]=useState<string|null>(null);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [review,setReview]=useState<string[]>([]);
  const [known,setKnown]=useState<string[]>([]);
  const [reflection,setReflection]=useState("");
  const [leaf,setLeaf]=useState<number|null>(null);
  const backButton=useRef<HTMLButtonElement>(null);
  const grid=useRef<HTMLUListElement>(null);
  const focusBack=useRef(false);
  const returnTo=useRef<string|null>(null);
  const reduced=useResourceMotion();
  const payload={favorites,review,known,reflection};
  useExperienceDraft(payload,props.onDraft);
  useEffect(()=>{
    if(focused && focusBack.current)backButton.current?.focus();
    focusBack.current=false;
    if(!focused && returnTo.current){
      const id=returnTo.current;
      [...grid.current?.querySelectorAll<HTMLButtonElement>("[data-open-card]") ?? []].find(button=>button.dataset.openCard===id)?.focus();
      returnTo.current=null;
    }
  },[focused,currentId]);
  const items=props.version?.configuration.items.filter(item=>item.kind==="card") ?? [];
  if(!items.length)return <EmptyContent/>;

  const marked=new Set([...favorites,...review,...known]);
  const selectedIds=selection==="favoritas" ? favorites : selection==="rever" ? review : selection==="lidas" ? known : [...marked];
  const query=normalize(search.trim());
  const visible=view==="acaso" ? items : items.filter(item=>(!deck || item.deck===deck) && (!query || normalize(`${item.title} ${item.text}`).includes(query)) && (view!=="selecao" || selectedIds.includes(item.id)));
  const current=visible.find(item=>item.id===currentId) ?? visible[0];
  const position=current ? visible.findIndex(item=>item.id===current.id) : -1;
  const single=view==="acaso" || focused;
  const detail=items.find(item=>item.id===detailId);
  const code=(item:EditorialItem)=>cardCode(items.findIndex(value=>value.id===item.id));
  const toggleIn=(id:string,update:React.Dispatch<React.SetStateAction<string[]>>)=>update(values=>values.includes(id) ? values.filter(value=>value!==id) : [...values,id]);
  const setters:Record<CardMark,React.Dispatch<React.SetStateAction<string[]>>>={favorite:setFavorites,review:setReview,known:setKnown};
  const choose=(id:string)=>{setCurrentId(id);setFlipped(values=>values.filter(value=>value!==id));};
  const open=(id:string)=>{setCurrentId(id);setFocused(true);focusBack.current=true;};
  const backToGrid=()=>{returnTo.current=current?.id ?? null;setFocused(false);};
  const pick=(pickedLeaf:number|null=null)=>{
    const candidates=items.filter(item=>item.id!==(currentId ?? current?.id));
    const next=(candidates.length ? candidates : items)[Math.floor(Math.random()*(candidates.length || items.length))];
    choose(next.id);setLeaf(pickedLeaf);
  };
  const resetFilters=()=>{setDeck("");setSearch("");};
  const changeView=(next:View)=>{
    setView(next);setFocused(false);resetFilters();
    if(next==="acaso")pick();
  };
  const openRelated=(id:string)=>{
    setView("acervo");resetFilters();setDetailId(null);open(id);
  };
  const leaveOnEscape=(event:KeyboardEvent<HTMLElement>)=>{
    if(event.key!=="Escape" || detailId)return;
    event.preventDefault();backToGrid();
  };

  const reader=(card:EditorialItem)=><>
    <Card3D key={card.id} item={card} code={code(card)} deck={deckTitle(card.deck)} flipped={flipped.includes(card.id)} reduced={reduced} onFlip={()=>toggleIn(card.id,setFlipped)}/>
    <div className="cg-card-actions" role="group" aria-label="Marcar esta carta">
      <button type="button" aria-pressed={favorites.includes(card.id)} onClick={()=>toggleIn(card.id,setFavorites)}><Star size={17} aria-hidden="true"/>{favorites.includes(card.id) ? "Favorita" : "Favoritar"}</button>
      <button type="button" aria-pressed={review.includes(card.id)} onClick={()=>toggleIn(card.id,setReview)}><Bookmark size={17} aria-hidden="true"/>Para rever</button>
      <button type="button" aria-pressed={known.includes(card.id)} onClick={()=>toggleIn(card.id,setKnown)}><Check size={17} aria-hidden="true"/>{known.includes(card.id) ? "Lida" : "Marcar como lida"}</button>
    </div>
    <button type="button" className="cg-read-more" onClick={()=>setDetailId(card.id)}><BookOpen size={18} aria-hidden="true"/>Ler conceito completo e referências<ArrowRight size={16} aria-hidden="true"/></button>
  </>;

  return <div className="cg-app" data-reduced={reduced}>
    <header className="cg-intro"><div><span className="cg-eyebrow">Seu baralho de estudo</span><h2>Percorra o baralho.</h2><p>Veja as cartas lado a lado, vire uma para encontrar a pergunta do verso ou abra-a em destaque para ficar com ela.</p></div><span className="cg-acervo-count"><Layers size={18} aria-hidden="true"/>{items.length} cartas no acervo</span></header>

    <div className="cg-tabs" role="group" aria-label="Como explorar as cartas">
      <button type="button" aria-pressed={view==="acervo"} onClick={()=>changeView("acervo")}><Layers size={18} aria-hidden="true"/>Explorar acervo</button>
      <button type="button" aria-pressed={view==="selecao"} onClick={()=>changeView("selecao")}><Bookmark size={18} aria-hidden="true"/>Minhas cartas <span className="cg-count">{marked.size}</span></button>
      <button type="button" aria-pressed={view==="acaso"} onClick={()=>changeView("acaso")}><Shuffle size={18} aria-hidden="true"/>Colher ao acaso</button>
    </div>

    {!single && <div className="cg-filters"><label className="cg-search"><span>Buscar carta ou conceito</span><span className="cg-search-input"><Search size={18} aria-hidden="true"/><input type="search" value={search} placeholder="Ex.: presença, contato, awareness" onChange={event=>setSearch(event.target.value)}/></span></label><label className="cg-deck"><span>Baralho</span><select value={deck} onChange={event=>setDeck(event.target.value)}><option value="">Todos os baralhos</option>{DECKS.filter(value=>items.some(item=>item.deck===value.id)).map(value=><option key={value.id} value={value.id}>{value.title}</option>)}</select></label></div>}
    {view==="selecao" && !focused && <div className="cg-selection" role="group" aria-label="Filtrar minhas cartas">{([['todas','Todas',marked.size],['favoritas','Favoritas',favorites.length],['rever','Para rever',review.length],['lidas','Já li',known.length]] as const).map(([value,label,count])=><button type="button" key={value} aria-pressed={selection===value} onClick={()=>setSelection(value)}>{label} <span>{count}</span></button>)}</div>}

    {!current ? <section className="cg-empty"><Bookmark size={28} aria-hidden="true"/><h3>{view==="selecao" && !marked.size ? "Sua seleção começa por uma carta." : "Nenhuma carta por aqui ainda."}</h3><p>{view==="selecao" && !marked.size ? "Ao explorar, marque uma favorita, uma carta para rever ou uma leitura concluída. Suas escolhas aparecem aqui." : "Experimente outro baralho, outra busca ou outro filtro de seleção."}</p><div className="fv-actions"><Button secondary onClick={()=>{resetFilters();setFocused(false);}}>Limpar busca e baralho</Button><Button onClick={()=>{setSelection("todas");changeView("acervo");}}>Explorar acervo</Button></div></section>
    : view==="acaso" ? <div className="cg-workspace">
      <aside className="cg-browser" aria-label="Colher uma carta"><div className="cg-random"><span className="cg-eyebrow">Um encontro com o acaso</span><h3>O que esta carta desperta?</h3><p>Permaneça com ela pelo tempo que fizer sentido. Você pode colher outra quando quiser.</p><Button secondary onClick={()=>pick()}><Shuffle size={18} aria-hidden="true"/>Colher outra carta</Button><details><summary>Escolher uma folha da árvore</summary><Canopy onPick={pick} picked={leaf}/></details></div></aside>
      <section className="cg-reader" aria-label="Carta em destaque"><p className="cg-position" role="status">Sua carta do momento<span> · {current.title}</span></p>{reader(current)}</section>
    </div>
    : focused ? <section className="cg-reader cg-focus" aria-label="Carta em destaque" onKeyDown={leaveOnEscape}>
      <div className="cg-focus-bar"><button type="button" ref={backButton} className="cg-back-grid" onClick={backToGrid}><LayoutGrid size={18} aria-hidden="true"/>Voltar à grade</button><p className="cg-position" role="status">Carta {position+1} de {visible.length}<span> · {current.title}</span></p></div>
      {reader(current)}
      <nav className="cg-pagination" aria-label="Percorrer cartas"><button type="button" disabled={position===0} onClick={()=>choose(visible[position-1].id)}><ArrowLeft size={18} aria-hidden="true"/>Anterior</button><span>{position+1} / {visible.length}</span><button type="button" disabled={position===visible.length-1} onClick={()=>choose(visible[position+1].id)}>Próxima<ArrowRight size={18} aria-hidden="true"/></button></nav>
    </section>
    : <section className="cg-grid-area" aria-label={view==="selecao" ? "Sua seleção de cartas" : "Cartas do acervo"} data-reduced={reduced}>
      <p className="cg-grid-count" role="status">{visible.length} {visible.length===1 ? "carta" : "cartas"}{view==="selecao" ? " na sua seleção" : deck || query ? (visible.length===1 ? " encontrada" : " encontradas") : " no baralho"}</p>
      <ul className="fv-gcards cg-grid" ref={grid}>{visible.map(item=><li key={item.id}>
        <GestaltCard item={item} code={code(item)} deck={deckTitle(item.deck)} flipped={flipped.includes(item.id)}
          marks={{favorite:favorites.includes(item.id),review:review.includes(item.id),known:known.includes(item.id)}}
          onFlip={()=>toggleIn(item.id,setFlipped)} onOpen={()=>open(item.id)} onDeepen={()=>setDetailId(item.id)} onToggle={mark=>toggleIn(item.id,setters[mark])}>
          {props.mode==="relacoes" && item.relatedConcepts.some(id=>items.some(value=>value.id===id)) && <div className="fv-gcard-relations"><span className="fv-label">Conversa com</span><ul>{item.relatedConcepts.map(id=>{const related=items.find(value=>value.id===id);return related ? <li key={id}><button type="button" className="fv-link-button" onClick={()=>open(id)}>{related.title}</button></li> : null;})}</ul></div>}
        </GestaltCard>
      </li>)}</ul>
    </section>}

    <footer className="cg-footer"><details><summary>Uma nota para este estudo <span>(opcional)</span></summary><TextArea label="Uma nota de estudo, se quiser" value={reflection} onChange={setReflection}/></details><div className="cg-finish"><p>Suas marcações ficam nesta experiência. Ao concluir, você decide se quer guardar um registro.</p><Button onClick={()=>props.onComplete(payload)}>Concluir estudo<ArrowRight size={18} aria-hidden="true"/></Button></div></footer>

    <Dialog title={detail?.title ?? "Conceito"} open={!!detail} onClose={()=>setDetailId(null)}>{detail && <article className="fv-print-card cg-detail"><span className="cg-eyebrow">{deckTitle(detail.deck)} · {code(detail)}</span><div className="fv-gcard-art"><ConceptIllustration item={detail}/></div><p className="fv-summary">{detail.text}</p>{detail.prompt && <section><h3>Para ficar com isso</h3><p>{detail.prompt}</p></section>}{detail.teacherResponse && <p>{detail.teacherResponse}</p>}<ReferenceLine item={detail}/>{!!detail.relatedConcepts.filter(id=>items.some(item=>item.id===id)).length && <section className="cg-related"><h3>Conversa com</h3>{detail.relatedConcepts.map(id=>{const related=items.find(item=>item.id===id);return related ? <button type="button" key={id} onClick={()=>openRelated(id)}>Abrir carta relacionada: {related.title}<ArrowRight size={16} aria-hidden="true"/></button> : null;})}</section>}<div className="fv-actions"><Button secondary onClick={()=>window.print()}>Imprimir ou salvar ficha em PDF</Button></div></article>}</Dialog>
  </div>;
}

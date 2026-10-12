"use client";
import { useState } from "react";
import { Button, TextArea, SelectableCard, EmptyContent, ReferenceLine, TextField, Dialog } from "./ui";
import { DECKS } from "./editorial-schema";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";

export function CardsExperience(props: ExperienceProps) {
  const [deck,setDeck] = useState(""); const [search,setSearch] = useState("");
  const [favorites,setFavorites] = useState<string[]>([]); const [review,setReview] = useState<string[]>([]);
  const [known,setKnown] = useState<string[]>([]); const [reflection,setReflection] = useState("");
  const [flipped,setFlipped] = useState<string[]>([]); const [selected,setSelected] = useState<string|null>(null);
  const payload={favorites,review,known,reflection}; useExperienceDraft(payload,props.onDraft);
  const items=props.version?.configuration.items.filter(item => item.kind==="card") ?? [];
  const copa=props.version?.configuration.items.find(item=>item.format==="copa" && !!item.asset);
  if(!items.length) return <EmptyContent />;
  const toggle=(id:string,ids:string[],change:(ids:string[])=>void) => change(ids.includes(id) ? ids.filter(value => value!==id) : [...ids,id]);
  const visible=items.filter(item => (!deck || item.deck===deck) && (!search || item.title.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))) && (props.mode!=="revisar" || review.includes(item.id)));
  const card=items.find(item => item.id===selected);
  return <><h2>{props.mode==="copa" ? "Colher uma carta" : props.mode==="relacoes" ? "Relações entre conceitos" : "Percorrer o acervo"}</h2>
    {props.mode==="copa" ? <><p>Uma carta do acervo revisado pode abrir esta leitura.</p>{copa && <img className="fv-art" src={copa.asset} alt={copa.title}/>}<Button onClick={() => setSelected(items[Math.floor(Math.random()*items.length)].id)}>Colher uma carta</Button>{!copa && <p className="fv-note">A composição da Copa aparece quando a arte final tiver curadoria registrada.</p>}</> :
      <><TextField label="Buscar título" value={search} onChange={setSearch} /><label className="fv-field"><span>Baralho</span><select value={deck} onChange={event => setDeck(event.target.value)}><option value="">Todos os baralhos</option>{DECKS.map(value => <option key={value.id} value={value.id}>{value.title}</option>)}</select></label>
      {props.mode==="revisar" && !visible.length && <p>Você ainda não marcou cartas para rever nesta experiência.</p>}
      <div className="fv-cards">{visible.map(item => {
        const back=flipped.includes(item.id);
        return <article key={item.id} className={`fv-card${back ? " fv-card--back" : ""}`}>
          <span className="fv-label">{back ? "Para ficar com isso" : `Conceito · ${item.id}`}</span><h3>{item.title}</h3>
          {!back && item.asset && <img className="fv-art" src={item.asset} alt={item.title}/>}
          <p className="fv-summary">{back ? item.prompt || "Você pode continuar a leitura no painel." : item.text}</p>
          {!back && <ReferenceLine item={item} />}
          <div className="fv-actions"><Button secondary onClick={() => toggle(item.id,flipped,setFlipped)}>{back ? "Ver conceito" : "Virar carta"}</Button><Button secondary onClick={() => setSelected(item.id)}>Aprofundar</Button></div>
          <div className="fv-actions"><Button secondary aria-pressed={favorites.includes(item.id)} onClick={() => toggle(item.id,favorites,setFavorites)}>Favorito {favorites.includes(item.id) ? "marcado" : ""}</Button><Button secondary aria-pressed={review.includes(item.id)} onClick={() => toggle(item.id,review,setReview)}>Rever {review.includes(item.id) ? "marcado" : ""}</Button><Button secondary aria-pressed={known.includes(item.id)} onClick={() => toggle(item.id,known,setKnown)}>Já li</Button></div>
          {props.mode==="relacoes" && <ul>{item.relatedConcepts.map(id => <li key={id}><Button secondary onClick={() => setSelected(id)}>{items.find(value => value.id===id)?.title ?? id}</Button></li>)}</ul>}
        </article>;
      })}</div></>}
    <TextArea label="Uma nota de estudo, se quiser" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete(payload)}>Concluir estudo</Button></div>
    <Dialog title={card?.title ?? "Carta"} open={!!card} onClose={() => setSelected(null)}>{card && <article className="fv-print-card">{card.asset && <img className="fv-art" src={card.asset} alt={card.title}/>}<p className="fv-summary">{card.text}</p><p>{card.prompt}</p><p>{card.teacherResponse}</p><ReferenceLine item={card} /><Button secondary onClick={() => window.print()}>Imprimir ou salvar ficha em PDF</Button></article>}</Dialog>
  </>;
}
export function FigureExperience(props: ExperienceProps) {
  const [index,setIndex] = useState(0); const [selected,setSelected] = useState("");
  const [reflection,setReflection] = useState(""); const [compare,setCompare] = useState(false);
  useExperienceDraft(null,props.onDraft);
  const all=props.version?.configuration.items ?? [];
  const items=all.filter(item => item.format===props.mode);
  const current=items[index];
  if(!current) return <EmptyContent />;
  return <><h2>{current.title}</h2>{current.asset && <img src={current.asset} alt={current.title} style={{width:"100%",height:"auto"}} />}<p className="fv-summary">{current.text}</p><p>{current.prompt}</p><div className="fv-options">{current.segments.map(item => <SelectableCard key={item.id} label={item.text} selected={selected===item.id} onSelect={() => {setSelected(item.id);setCompare(false);}} />)}</div><TextArea label="O que apareceu como figura para você?" value={reflection} onChange={setReflection} />
    {compare && <section><h3>Leitura docente para comparar</h3><p>{current.teacherResponse}</p></section>}<ReferenceLine item={current} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length ? <Button onClick={() => {setIndex(index+1);setSelected("");setReflection("");setCompare(false);}}>Próxima rodada</Button> : <Button onClick={() => props.onComplete(null)}>Concluir</Button>}<Button secondary onClick={() => props.onComplete(null)}>Pular e encerrar</Button></div></>;
}
export function CycleExperience(props: ExperienceProps) {
  const [model,setModel] = useState<"zinker"|"phg"|"ribeiro">("zinker"); const [index,setIndex] = useState(0);
  const [sequence,setSequence] = useState<string[]>([]); const [reflection,setReflection] = useState("");
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===model);
  const item=items[index]; const payload={itemId:item?.id ?? "",model,sequence,reflection}; useExperienceDraft(payload,props.onDraft);
  if(!(props.version?.configuration.items.length)) return <EmptyContent />;
  return <><h2>Escolher uma lente de estudo</h2><div className="fv-options">{(["zinker","phg","ribeiro"] as const).map(id => <SelectableCard key={id} label={id==="zinker" ? "Zinker" : id==="phg" ? "PHG" : "Jorge Ponciano Ribeiro"} selected={model===id} onSelect={() => {setModel(id);setIndex(0);setSequence([]);}} />)}</div>{item ? <><h3 style={{marginTop:24}}>{item.title}</h3><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><div className="fv-options">{item.segments.map(phase => <SelectableCard key={phase.id} label={phase.text} selected={sequence.includes(phase.id)} onSelect={() => setSequence(values => values.includes(phase.id) ? values.filter(value => value!==phase.id) : [...values,phase.id])} />)}</div><TextArea label="Sua leitura da situação, se quiser" value={reflection} onChange={setReflection} /><ReferenceLine item={item} /><div className="fv-actions">{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setSequence([]);setReflection("");}}>Outra situação</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir estudo</Button></div></> : <EmptyContent />}</>;
}
export function BoundariesExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [hypotheses,setHypotheses]=useState<string[]>([]); const [reflection,setReflection]=useState(""); const [compare,setCompare]=useState(false);
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",hypotheses,reflection}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><div className="fv-options">{item.alternatives.map(hypothesis => <SelectableCard key={hypothesis.id} label={hypothesis.text} selected={hypotheses.includes(hypothesis.id)} onSelect={() => setHypotheses(values => values.includes(hypothesis.id) ? values.filter(value => value!==hypothesis.id) : [...values,hypothesis.id])} />)}</div><Button secondary onClick={() => setHypotheses([])}>Não sei</Button><TextArea label="Uma hipótese nas suas palavras, se quiser" value={reflection} onChange={setReflection} />{compare && <><h3>Leitura docente</h3><p>{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setHypotheses([]);setReflection("");setCompare(false);}}>Outra vinheta</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir</Button></div></>;
}
export function CaseExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [observable,setObservable]=useState(""); const [question,setQuestion]=useState(""); const [experiment,setExperiment]=useState(""); const [field,setField]=useState(""); const [compare,setCompare]=useState(false);
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===props.mode); const item=items[index];
  const payload={itemId:item?.id ?? "",observable,question,experiment,field}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><p className="fv-tag">Situação fictícia para estudo</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><TextArea label="O que você consegue observar neste trecho?" value={observable} onChange={setObservable} /><TextArea label="Uma pergunta fenomenológica" value={question} onChange={setQuestion} /><TextArea label="Uma possibilidade de experimento" value={experiment} onChange={setExperiment} /><TextArea label="Mudar uma variável do campo e reler" value={field} onChange={setField} />
    {compare && <><h3>Leitura docente para comparar</h3><p className="fv-summary">{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setObservable("");setQuestion("");setExperiment("");setField("");setCompare(false);}}>Outro caso</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir</Button></div></>;
}

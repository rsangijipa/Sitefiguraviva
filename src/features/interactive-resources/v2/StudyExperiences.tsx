"use client";
import { useState, type ReactNode } from "react";
import { Button, TextArea, SelectableCard, EmptyContent, ReferenceLine, TextField, Dialog } from "./ui";
import { DECKS, type EditorialItem } from "./editorial-schema";
import { useExperienceDraft, type ExperienceProps } from "./experience-types";
import { useResourceMotion } from "./ResourceShell";
import { ConceptIllustration } from "./illustration/ConceptIllustration";
import { Canopy, ContactBoundary, CycleDiagram, FigureField, RubinTree } from "./illustration/scenes";

/** Primeira frase da definição: a frente da carta mostra uma frase; o resto vai para "Aprofundar". */
const firstSentence = (text: string) => text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;
const cardCode = (index: number) => `FV-C${String(index + 1).padStart(3, "0")}`;
const deckTitle = (id: string) => DECKS.find(deck => deck.id === id)?.title ?? "Conceito";

/** Carta 2:3 (seção 7.2): frente com ilustração do conceito; verso em Verde Raiz com a pergunta. */
function GestaltCard({ item, code, back, children }: { item: EditorialItem; code: string; back: boolean; children?: ReactNode }) {
  return <article className={`fv-gcard${back ? " fv-gcard--back" : ""}`} aria-label={`${item.title}, ${back ? "verso" : "frente"}`}>
    {back ? <div className="fv-gcard-face">
      <span className="fv-gcard-label fv-gcard-label--back">Para ficar com isso</span>
      <p className="fv-gcard-question">{item.prompt || "O que esta carta desperta em você agora?"}</p>
      <span className="fv-gcard-meta">{item.title} · {code}</span>
    </div> : <div className="fv-gcard-face">
      <span className="fv-gcard-label">{deckTitle(item.deck)} · {code}</span>
      <div className="fv-gcard-art"><ConceptIllustration item={item} decorative /></div>
      <h3>{item.title}</h3>
      <p className="fv-gcard-text">{firstSentence(item.text)}</p>
      {/* A frente leva a primeira referência; a lista completa fica em "Aprofundar". */}
      <ReferenceLine item={{ ...item, references: item.references.slice(0, 1) }} />
      {item.references.length > 1 && <span className="fv-gcard-more">+{item.references.length - 1} {item.references.length === 2 ? "referência" : "referências"} em Aprofundar</span>}
    </div>}
    {children}
  </article>;
}

export function CardsExperience(props: ExperienceProps) {
  const [deck,setDeck] = useState(""); const [search,setSearch] = useState("");
  const [favorites,setFavorites] = useState<string[]>([]); const [review,setReview] = useState<string[]>([]);
  const [known,setKnown] = useState<string[]>([]); const [reflection,setReflection] = useState("");
  const [flipped,setFlipped] = useState<string[]>([]); const [selected,setSelected] = useState<string|null>(null);
  const [leaf,setLeaf] = useState<number|null>(null);
  const reduced = useResourceMotion();
  const payload={favorites,review,known,reflection}; useExperienceDraft(payload,props.onDraft);
  const items=props.version?.configuration.items.filter(item => item.kind==="card") ?? [];
  if(!items.length) return <EmptyContent />;
  const code=(id:string) => cardCode(items.findIndex(item => item.id===id));
  const toggle=(id:string,ids:string[],change:(ids:string[])=>void) => change(ids.includes(id) ? ids.filter(value => value!==id) : [...ids,id]);
  const pick=(index:number|null) => { setLeaf(index); setSelected(items[Math.floor(Math.random()*items.length)].id); };
  const visible=items.filter(item => (!deck || item.deck===deck) && (!search || item.title.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))) && (props.mode!=="revisar" || review.includes(item.id)));
  const card=items.find(item => item.id===selected);
  return <><h2>{props.mode==="copa" ? "Colher uma carta" : props.mode==="relacoes" ? "Relações entre conceitos" : "Percorrer o acervo"}</h2>
    {props.mode==="copa" ? <div className="fv-copa"><p>Toque uma folha da copa. Uma carta do acervo vem até você.</p>
      <Canopy onPick={pick} still={reduced} picked={leaf} />
      <div className="fv-actions"><Button secondary onClick={() => pick(null)}>Colher uma carta ao acaso</Button></div></div> :
      <><div className="fv-card-filters"><TextField label="Buscar título" value={search} onChange={setSearch} /><label className="fv-field"><span>Baralho</span><select value={deck} onChange={event => setDeck(event.target.value)}><option value="">Todos os baralhos</option>{DECKS.map(value => <option key={value.id} value={value.id}>{value.title} ({items.filter(item => item.deck===value.id).length})</option>)}</select></label></div>
      {props.mode==="revisar" && !visible.length && <p>Você ainda não marcou cartas para rever nesta experiência.</p>}
      <div className="fv-gcards">{visible.map(item => {
        const back=flipped.includes(item.id);
        return <GestaltCard key={item.id} item={item} code={code(item.id)} back={back}>
          <div className="fv-gcard-actions">
            <Button secondary onClick={() => toggle(item.id,flipped,setFlipped)}>{back ? "Ver conceito" : "Virar carta"}</Button>
            <Button secondary onClick={() => setSelected(item.id)}>Aprofundar</Button>
          </div>
          <div className="fv-gcard-actions fv-gcard-actions--marks">
            <Button secondary aria-pressed={favorites.includes(item.id)} onClick={() => toggle(item.id,favorites,setFavorites)}>Favorita</Button>
            <Button secondary aria-pressed={review.includes(item.id)} onClick={() => toggle(item.id,review,setReview)}>Rever</Button>
            <Button secondary aria-pressed={known.includes(item.id)} onClick={() => toggle(item.id,known,setKnown)}>Já li</Button>
          </div>
          {props.mode==="relacoes" && !!item.relatedConcepts.length && <div className="fv-gcard-relations"><span className="fv-label">Conversa com</span><ul>{item.relatedConcepts.map(id => <li key={id}><button type="button" className="fv-link-button" onClick={() => setSelected(id)}>{items.find(value => value.id===id)?.title ?? id}</button></li>)}</ul></div>}
        </GestaltCard>;
      })}</div></>}
    <TextArea label="Uma nota de estudo, se quiser" value={reflection} onChange={setReflection} /><div className="fv-actions"><Button onClick={() => props.onComplete(payload)}>Concluir estudo</Button></div>
    <Dialog title={card?.title ?? "Carta"} open={!!card} onClose={() => setSelected(null)}>{card && <article className="fv-print-card"><span className="fv-label">{deckTitle(card.deck)} · {code(card.id)}</span><div className="fv-gcard-art"><ConceptIllustration item={card} /></div><p className="fv-summary">{card.text}</p>{card.prompt && <p><strong>Para ficar com isso:</strong> {card.prompt}</p>}{card.teacherResponse && <p>{card.teacherResponse}</p>}<ReferenceLine item={card} />{!!card.relatedConcepts.length && <p className="fv-support">Conversa com: {card.relatedConcepts.map(id => items.find(value => value.id===id)?.title ?? id).join(", ")}</p>}<Button secondary onClick={() => window.print()}>Imprimir ou salvar ficha em PDF</Button></article>}</Dialog>
  </>;
}

const RUBIN_OPTIONS = ["Dois rostos", "Uma árvore", "Os dois, alternando", "Outra coisa"];
export function FigureExperience(props: ExperienceProps) {
  const [index,setIndex] = useState(props.mode==="perceptivo" ? -1 : 0); const [selected,setSelected] = useState("");
  const [rubin,setRubin] = useState(""); const [reflection,setReflection] = useState(""); const [compare,setCompare] = useState(false);
  useExperienceDraft(null,props.onDraft);
  const all=props.version?.configuration.items ?? [];
  const items=all.filter(item => item.format===props.mode);
  if(index<0) return <><h2>A árvore de Rubin</h2><RubinTree className="fv-illustration fv-rubin" /><p className="fv-summary">O que aparece primeiro para você?</p>
    <div className="fv-options" role="group" aria-label="O que aparece primeiro">{RUBIN_OPTIONS.map(option => <SelectableCard key={option} label={option} selected={rubin===option} onSelect={() => setRubin(option)} />)}</div>
    {rubin && <p className="fv-note" aria-live="polite">Não há resposta certa. A figura se forma na relação entre quem percebe e o que é percebido: a primeira camada vem da psicologia da Gestalt (Rubin, 1915); a segunda, do conceito clínico de figura e fundo (Perls, Hefferline e Goodman, 1951).</p>}
    <div className="fv-actions"><Button onClick={() => setIndex(0)} disabled={!items.length}>{items.length ? "Seguir para as rodadas" : "Rodadas aguardam o acervo"}</Button><Button secondary onClick={() => props.onComplete(null)}>Encerrar</Button></div></>;
  const current=items[index];
  if(!current) return <EmptyContent />;
  const chosen=current.segments.find(item => item.id===selected);
  return <><p className="fv-tag">Rodada {index+1} de {items.length}</p><h2>{current.title}</h2>
    <div className="fv-figure-stage"><FigureField segments={current.segments} selected={selected} variant={props.mode==="perceptivo" ? "formas" : "texto"} onSelect={id => {setSelected(id);setCompare(false);}} />
      <div><p className="fv-summary">{current.text}</p><p>{current.prompt}</p>
        <div className="fv-options" role="group" aria-label="Elementos do campo">{current.segments.map(item => <SelectableCard key={item.id} label={item.text} selected={selected===item.id} onSelect={() => {setSelected(item.id);setCompare(false);}} />)}</div>
        <p className="fv-mode-status" aria-live="polite">{chosen ? <>Figura agora: <strong>{chosen.text}</strong>. O restante continua no campo, como fundo.</> : "Toque no que se destaca para você."}</p></div></div>
    <TextArea label="O que apareceu como figura para você?" value={reflection} onChange={setReflection} />
    {compare && <section><h3>Leitura docente para comparar</h3><p>{current.teacherResponse}</p></section>}<ReferenceLine item={current} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length ? <Button onClick={() => {setIndex(index+1);setSelected("");setReflection("");setCompare(false);}}>Próxima rodada</Button> : <Button onClick={() => props.onComplete(null)}>Concluir</Button>}<Button secondary onClick={() => props.onComplete(null)}>Pular e encerrar</Button></div></>;
}
export function CycleExperience(props: ExperienceProps) {
  const [model,setModel] = useState<"zinker"|"phg"|"ribeiro">("zinker"); const [index,setIndex] = useState(0);
  const [sequence,setSequence] = useState<string[]>([]); const [reflection,setReflection] = useState(""); const [compare,setCompare] = useState(false);
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===model);
  const item=items[index]; const payload={itemId:item?.id ?? "",model,sequence,reflection}; useExperienceDraft(payload,props.onDraft);
  if(!(props.version?.configuration.items.length)) return <EmptyContent />;
  return <><h2>Escolher uma lente de estudo</h2><div className="fv-options">{(["zinker","phg","ribeiro"] as const).map(id => <SelectableCard key={id} label={id==="zinker" ? "Zinker" : id==="phg" ? "PHG" : "Jorge Ponciano Ribeiro"} selected={model===id} onSelect={() => {setModel(id);setIndex(0);setSequence([]);setCompare(false);}} />)}</div>{item ? <><h3 style={{marginTop:24}}>{item.title}</h3><p className="fv-summary">{item.text}</p>
    <CycleDiagram phases={item.segments} marked={sequence} /><p>{item.prompt}</p><div className="fv-options">{item.segments.map(phase => <SelectableCard key={phase.id} label={phase.text} selected={sequence.includes(phase.id)} onSelect={() => setSequence(values => values.includes(phase.id) ? values.filter(value => value!==phase.id) : [...values,phase.id])} />)}</div><TextArea label="Sua leitura da situação, se quiser" value={reflection} onChange={setReflection} />{compare && item.teacherResponse && <><h3>Leitura docente</h3><p className="fv-summary">{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions">{item.teacherResponse && <Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>}{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setSequence([]);setReflection("");setCompare(false);}}>Outra situação</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir estudo</Button></div></> : <EmptyContent />}</>;
}
export function BoundariesExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [hypotheses,setHypotheses]=useState<string[]>([]); const [reflection,setReflection]=useState(""); const [compare,setCompare]=useState(false);
  const items=props.version?.configuration.items ?? []; const item=items[index];
  const payload={itemId:item?.id ?? "",hypotheses,reflection}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><ContactBoundary /><p className="fv-tag">Vinheta {index+1} de {items.length} · situação fictícia</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><div className="fv-options">{item.alternatives.map(hypothesis => <SelectableCard key={hypothesis.id} label={hypothesis.text} selected={hypotheses.includes(hypothesis.id)} onSelect={() => setHypotheses(values => values.includes(hypothesis.id) ? values.filter(value => value!==hypothesis.id) : [...values,hypothesis.id])} />)}</div><Button secondary onClick={() => setHypotheses([])}>Não sei</Button><TextArea label="Uma hipótese nas suas palavras, se quiser" value={reflection} onChange={setReflection} />{compare && <><h3>Leitura docente</h3><p>{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setHypotheses([]);setReflection("");setCompare(false);}}>Outra vinheta</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir</Button></div></>;
}
export function CaseExperience(props: ExperienceProps) {
  const [index,setIndex]=useState(0); const [observable,setObservable]=useState(""); const [question,setQuestion]=useState(""); const [experiment,setExperiment]=useState(""); const [field,setField]=useState(""); const [compare,setCompare]=useState(false);
  const items=(props.version?.configuration.items ?? []).filter(item => item.format===props.mode); const item=items[index];
  const payload={itemId:item?.id ?? "",observable,question,experiment,field}; useExperienceDraft(payload,props.onDraft);
  if(!item) return <EmptyContent />;
  return <><p className="fv-tag">Situação fictícia para estudo</p><h2>{item.title}</h2><p className="fv-summary">{item.text}</p><p>{item.prompt}</p><TextArea label="O que você consegue observar neste trecho?" value={observable} onChange={setObservable} /><TextArea label="Uma pergunta fenomenológica" value={question} onChange={setQuestion} /><TextArea label="Uma possibilidade de experimento" value={experiment} onChange={setExperiment} /><TextArea label="Mudar uma variável do campo e reler" value={field} onChange={setField} />
    {compare && <><h3>Leitura docente para comparar</h3><p className="fv-summary">{item.teacherResponse}</p></>}<ReferenceLine item={item} /><div className="fv-actions"><Button secondary onClick={() => setCompare(true)}>Comparar leituras</Button>{index+1<items.length && <Button secondary onClick={() => {setIndex(index+1);setObservable("");setQuestion("");setExperiment("");setField("");setCompare(false);}}>Outro caso</Button>}<Button onClick={() => props.onComplete(payload)}>Concluir</Button></div></>;
}

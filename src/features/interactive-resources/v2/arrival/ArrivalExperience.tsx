"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Leaf,SlidersHorizontal} from "lucide-react";
import {BodySelector} from "../BodySelector";
import type {BodyPoint} from "../contracts";
import type {EditorialItem} from "../editorial-schema";
import {useExperienceDraft,type ExperienceProps} from "../experience-types";
import {IllustrationSlot} from "../illustration/IllustrationSlot";
import {Button,SelectableCard,TextArea,TextField} from "../ui";
import {arrivalSteps,arrivalArt,type ArrivalStep} from "./steps";
import "./arrival.css";

interface ArrivalAnswers {word:string;body:BodyPoint[];emotion:string;intensity:number|null;needs:string[];reflection:string}
const emptyAnswers=():ArrivalAnswers=>({word:"",body:[],emotion:"",intensity:null,needs:[],reflection:""});
const suggestions=["Com calma","Com pressa","Curiosidade","Cansaço"];

function AcervoChoices({items,value,onChange,max,label}:{items:EditorialItem[];value:string[];onChange:(ids:string[])=>void;max:number;label:string}) {
 if(!items.length)return <p className="ar-empty">As opções deste acervo aguardam revisão docente. Você pode seguir sem escolher.</p>;
 const select=(id:string)=>onChange(value.includes(id) ? value.filter(item=>item!==id) : max===1 ? [id] : value.length<max ? [...value,id] : value);
 return <><div className="ar-options" role="group" aria-label={label}>{items.map(item=><SelectableCard key={item.id} label={item.title} selected={value.includes(item.id)} onSelect={()=>select(item.id)}/>)}</div>{max>1 && <p className="ar-count" role="status">{value.length} de {max} escolhidas.{value.length===max ? " Para escolher outra, retire uma das atuais." : ""}</p>}</>;
}

export function ArrivalExperience(props:ExperienceProps) {
 const [mode,setMode]=useState<"breve"|"completa">(props.mode==="completa" ? "completa" : "breve");
 const [chosen,setChosen]=useState<ArrivalStep[]>(arrivalSteps.map(item=>item.id));
 const [step,setStep]=useState(-1);
 const [answers,setAnswers]=useState<ArrivalAnswers>(emptyAnswers);
 const root=useRef<HTMLElement>(null);
 const follow=useRef(false);
 useEffect(()=>{if(follow.current){root.current?.focus({preventScroll:true});root.current?.scrollIntoView?.({block:"start",behavior:"auto"});follow.current=false;}},[step]);
 useExperienceDraft(answers,props.onDraft);
 const steps:ArrivalStep[]=mode==="breve" ? ["palavra","intensidade"] : chosen;
 const current=arrivalSteps.find(item=>item.id===steps[step]);
 const patch=(value:Partial<ArrivalAnswers>)=>setAnswers(previous=>({...previous,...value}));
 const go=(position:number)=>{follow.current=true;setStep(position);};
 const next=()=>go(step+1<steps.length ? step+1 : -2);
 const hasResponse=!!(answers.word.trim() || answers.body.length || answers.emotion || answers.intensity!==null || answers.needs.length || answers.reflection.trim());
 const payload:ArrivalAnswers={
  word:steps.includes("palavra") ? answers.word : "",body:steps.includes("corpo") ? answers.body : [],
  emotion:steps.includes("emocao") ? answers.emotion : "",intensity:steps.includes("intensidade") ? answers.intensity : null,
  needs:steps.includes("necessidade") ? answers.needs : [],reflection:steps.includes("permanencia") ? answers.reflection : "",
 };
 const responseFor=(id:ArrivalStep):string=>{
  if(id==="palavra")return payload.word.trim() || "Sem resposta.";
  if(id==="corpo")return payload.body.length ? payload.body.map(point=>`${point.region} (${point.view}): ${point.sensation}${point.note ? ` — ${point.note}` : ""}`).join("; ") : "Sem percepção registrada.";
  if(id==="emocao")return props.emotions.find(item=>item.id===payload.emotion)?.title ?? "Sem escolha.";
  if(id==="intensidade")return payload.intensity===null ? "Não informada." : `${payload.intensity} de 10`;
  if(id==="necessidade")return payload.needs.map(id=>props.needs.find(item=>item.id===id)?.title).filter(Boolean).join(", ") || "Sem escolha.";
  return payload.reflection.trim() || "Sem resposta.";
 };

 if(step===-1)return <section className="ar-app" ref={root} tabIndex={-1} aria-label="Preparar chegada"><div className="ar-welcome">
   <div className="ar-welcome-art"><IllustrationSlot slot={{path:arrivalArt("abertura"),ratio:"16:9",alt:"",brief:""}} decorative/><div><span className="fv-label">Um instante para se perceber</span><h2>Como você chega agora?</h2><p>Não é preciso chegar de um jeito diferente. Comece pelo que está presente.</p></div></div>
   <div className="ar-setup"><h3>Quanto desta chegada cabe agora?</h3><div className="ar-modes" role="group" aria-label="Percurso da chegada"><SelectableCard label="Breve" selected={mode==="breve"} onSelect={()=>setMode("breve")}><span>Palavra e intensidade · 2 etapas</span></SelectableCard><SelectableCard label="Completa" selected={mode==="completa"} onSelect={()=>setMode("completa")}><span>Escolha entre 6 etapas, no seu ritmo</span></SelectableCard></div>
    {mode==="completa" ? <div className="ar-customize"><h3><SlidersHorizontal size={17} aria-hidden="true"/>O que você quer percorrer?</h3><div className="ar-step-choices" role="group" aria-label="Etapas da chegada">{arrivalSteps.map(item=><button type="button" key={item.id} aria-pressed={chosen.includes(item.id)} onClick={()=>setChosen(values=>arrivalSteps.filter(value=>value.id===item.id ? !values.includes(value.id) : values.includes(value.id)).map(value=>value.id))}>{chosen.includes(item.id) && <Check size={15} aria-hidden="true"/>}{item.label}</button>)}</div><p>Ao concluir, entram apenas as etapas escolhidas.</p></div> : <p className="ar-setup-note">Uma palavra e uma intensidade, se quiser. Você pode pular qualquer pergunta.</p>}
    <div className="ar-welcome-actions"><Button onClick={()=>go(steps.length ? 0 : -2)}>{hasResponse ? "Retomar chegada" : "Começar"}<ArrowRight size={18} aria-hidden="true"/></Button>{hasResponse ? <Button secondary onClick={()=>go(-2)}>Revisar minhas respostas</Button> : <Button secondary onClick={()=>props.onComplete(emptyAnswers())}>Encerrar sem responder</Button>}</div>
    <p className="ar-privacy"><Leaf size={16} aria-hidden="true"/>Nada é guardado automaticamente.</p>
   </div>
 </div></section>;

 if(step===-2)return <section className="ar-app ar-review" ref={root} tabIndex={-1} aria-label="Revisar chegada"><span className="fv-label">Antes de encerrar</span><h2>O que você percebeu nesta chegada?</h2><p>Releia no seu tempo. Você pode editar ou deixar uma etapa sem resposta.</p><ol>{steps.map((id,index)=>{
  const item=arrivalSteps.find(item=>item.id===id)!;
  return <li key={id}><IllustrationSlot slot={{path:arrivalArt(item.asset),ratio:"4:3",alt:"",brief:""}} decorative/><div><h3>{item.label}</h3><p>{responseFor(id)}</p></div><button type="button" className="ar-edit" aria-label={`Editar ${item.label}`} onClick={()=>go(index)}>Editar</button></li>;
 })}</ol>{!steps.length && <p>Você escolheu seguir sem responder etapas.</p>}<div className="ar-review-actions"><Button secondary onClick={()=>go(-1)}>Escolher etapas</Button><Button onClick={()=>props.onComplete(payload)}>Concluir chegada<ArrowRight size={18} aria-hidden="true"/></Button></div><p className="ar-footnote">Ao concluir, suas respostas continuam nesta tela. Guardar um registro é uma escolha sua.</p></section>;

 if(!current)return null;
 return <section className="ar-app" ref={root} tabIndex={-1} aria-label="Percorrer chegada">
   <div className="ar-flow-top"><Button secondary onClick={()=>go(-1)}><ArrowLeft size={17} aria-hidden="true"/>Escolher percurso</Button><p aria-live="polite">Etapa {step+1} de {steps.length} · {current.label}</p></div>
   <ol className="ar-progress" aria-label="Etapas do percurso">{steps.map((id,index)=><li key={id}><button type="button" aria-current={index===step ? "step" : undefined} aria-label={`Ir para ${arrivalSteps.find(item=>item.id===id)!.label}`} onClick={()=>go(index)}><span>{index+1}</span>{arrivalSteps.find(item=>item.id===id)!.label}</button></li>)}</ol>
   <div className="ar-workspace" data-step={current.id}>
     <aside className="ar-art"><IllustrationSlot slot={{path:arrivalArt(current.asset),ratio:"4:3",alt:"",brief:""}} decorative/><span className="fv-label">No seu tempo</span><p>Você pode perceber, pular ou voltar. Não há uma resposta esperada.</p></aside>
     <div className="ar-question"><h2>{current.title}</h2><p className="ar-instruction">{current.description}</p>
       {current.id==="palavra" && <><TextField label="Como você chega agora?" value={answers.word} onChange={word=>patch({word})}/><div className="ar-suggestions" role="group" aria-label="Palavras possíveis">{suggestions.map(word=><button type="button" key={word} aria-pressed={answers.word===word} onClick={()=>patch({word})}>{word}</button>)}</div><p className="ar-footnote">As palavras são sugestões. Você pode escrever a sua.</p></>}
       {current.id==="corpo" && <BodySelector value={answers.body} onChange={body=>patch({body})}/>}
       {current.id==="emocao" && <AcervoChoices items={props.emotions} value={answers.emotion ? [answers.emotion] : []} onChange={ids=>patch({emotion:ids[0] ?? ""})} max={1} label="Nomear uma emoção"/>}
       {current.id==="intensidade" && <><div className="ar-intensity" role="group" aria-label="Intensidade percebida">{Array.from({length:11},(_,value)=><button type="button" key={value} aria-label={`Intensidade ${value} de 10`} aria-pressed={answers.intensity===value} onClick={()=>patch({intensity:value})}>{value}</button>)}</div><div className="ar-intensity-ends"><span>Menor intensidade</span><span>Maior intensidade</span></div><p className="ar-intensity-status" role="status">{answers.intensity===null ? "Intensidade ainda não informada." : `Intensidade escolhida: ${answers.intensity} de 10.`}</p><Button secondary onClick={()=>patch({intensity:null})}>Não sei</Button></>}
       {current.id==="necessidade" && <AcervoChoices items={props.needs} value={answers.needs} onChange={needs=>patch({needs})} max={3} label="Necessidades presentes"/>}
       {current.id==="permanencia" && <TextArea label="Nas suas palavras, se quiser" value={answers.reflection} onChange={reflection=>patch({reflection})}/>}
       <div className="ar-navigation"><div>{step>0 && <Button secondary onClick={()=>go(step-1)}>Voltar à etapa anterior</Button>}<Button secondary onClick={next}>Pular</Button></div><Button onClick={next}>{step+1===steps.length ? "Revisar chegada" : "Continuar"}<ArrowRight size={18} aria-hidden="true"/></Button></div>
     </div>
   </div>
 </section>;
}

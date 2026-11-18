"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Eye,RotateCw} from "lucide-react";
import {Button,SelectableCard,TextField} from "../ui";
import {IllustrationSlot} from "../illustration/IllustrationSlot";
import {useExperienceDraft,type ExperienceProps} from "../experience-types";
import {visualStudies,visualStudyPath} from "./studies";
import "./figure-ground.css";

type Observation={choice:string;other:string};
const extraOptions=["Vejo as duas, alternando","Vejo outra coisa","Ainda não sei"];

export function FigureGroundStudies(props:ExperienceProps) {
  const [index,setIndex]=useState(0);
  const [revealed,setRevealed]=useState<Record<string,boolean>>({});
  const [observations,setObservations]=useState<Record<string,Observation>>({});
  const [rotated,setRotated]=useState<Record<string,boolean>>({});
  const [summary,setSummary]=useState(false);
  const section=useRef<HTMLElement>(null);
  const followNavigation=useRef(false);
  useEffect(()=>{
    if(!followNavigation.current)return;
    section.current?.focus({preventScroll:true});
    section.current?.scrollIntoView?.({block:"start",behavior:"auto"});
    followNavigation.current=false;
  },[index,summary]);
  useExperienceDraft({observations},props.onDraft);
  const scene=visualStudies[index];
  const selected=observations[scene.id];
  const choose=(choice:string)=>setObservations(values=>({...values,[scene.id]:{choice,other:values[scene.id]?.other ?? ""}}));
  const goTo=(position:number)=>{followNavigation.current=true;setIndex(position);};
  const next=()=>{followNavigation.current=true;if(index<visualStudies.length-1)setIndex(value=>value+1);else setSummary(true);};
  if(summary)return <section className="fg-summary" ref={section} tabIndex={-1} aria-label="Minhas observações"><span className="fv-label">O que apareceu para você</span><h2>Um mesmo contorno, diferentes leituras.</h2><p>Estas foram suas escolhas nesta experiência. Você pode voltar às imagens e observar de novo.</p><ol>{visualStudies.map((item,position)=>{
    const answer=observations[item.id];
    return <li key={item.id}><IllustrationSlot slot={{path:visualStudyPath(item.id),ratio:"4:3",alt:"",brief:""}} decorative/><div><strong>Imagem {position+1}</strong><p>{answer ? answer.choice==="Vejo outra coisa" && answer.other.trim() ? answer.other : answer.choice : "Você seguiu sem escolher."}</p></div></li>;
  })}</ol><p className="fv-note">Suas escolhas ficam somente nesta tela. Não há pontuação nem interpretação das respostas.</p><div className="fv-actions"><Button secondary onClick={()=>{followNavigation.current=true;setSummary(false);}}>Voltar às imagens</Button><Button onClick={()=>props.onComplete(null)}>Encerrar experiência</Button></div></section>;

  return <section className="fg-app" aria-label="Estudos de percepção visual" ref={section} tabIndex={-1}>
    <div className="fg-progress"><span className="fv-label">Estudos visuais originais</span><span role="status">Imagem {index+1} de {visualStudies.length}</span></div>
    <div className="fg-workspace">
      <div className="fg-visual"><div className="fg-image" data-rotated={!!rotated[scene.id]}><IllustrationSlot key={scene.id} slot={{path:visualStudyPath(scene.id),ratio:"4:3",alt:`Estudo visual ${index+1}, uma imagem com mais de uma leitura possível.`,brief:""}}/></div><div className="fg-image-tools"><Button secondary aria-pressed={!!rotated[scene.id]} onClick={()=>setRotated(values=>({...values,[scene.id]:!values[scene.id]}))}><RotateCw size={17} aria-hidden="true"/>Girar imagem 180°</Button><details><summary>Descrição da imagem</summary><p>{scene.description}</p></details></div></div>
      <div className="fg-observation"><h2>O que você está vendo?</h2><p>Observe as formas e o espaço entre elas. Você pode mudar de ideia ou seguir sem escolher.</p>
        {!revealed[scene.id] ? <div className="fg-invitation"><Eye size={28} aria-hidden="true"/><p>Primeiro, fique um instante com a imagem. Quando quiser, abra as possibilidades.</p><Button onClick={()=>setRevealed(values=>({...values,[scene.id]:true}))}>Ver possibilidades</Button></div> : <>
          <div className="fg-options" role="group" aria-label="O que aparece nesta imagem">{[...scene.options,...extraOptions].map(option=><SelectableCard key={option} label={option} selected={selected?.choice===option} onSelect={()=>choose(option)}/>)}</div>
          {selected?.choice==="Vejo outra coisa" && <TextField label="O que você vê? (opcional)" value={selected.other} onChange={other=>setObservations(values=>({...values,[scene.id]:{choice:"Vejo outra coisa",other}}))}/>}
          <p className="fg-selection" aria-live="polite">{selected ? `Você escolheu: ${selected.choice}.` : "Você pode escolher uma leitura ou apenas observar."}</p>
          <Button secondary onClick={()=>setRevealed(values=>({...values,[scene.id]:false}))}>Olhar sem as opções</Button>
        </>}
      </div>
    </div>
    <nav className="fg-navigation" aria-label="Percorrer imagens"><Button secondary disabled={index===0} onClick={()=>goTo(index-1)}><ArrowLeft size={18} aria-hidden="true"/>Imagem anterior</Button><Button onClick={next}>{index===visualStudies.length-1 ? "Ver minhas observações" : "Próxima imagem"}<ArrowRight size={18} aria-hidden="true"/></Button></nav>
    <p className="fg-note">Cada pessoa pode perceber algo diferente. Esta é uma exploração visual, sem avaliação psicológica.</p>
  </section>;
}

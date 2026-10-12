"use client";
import { useState,useCallback,useEffect,type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import { ResourceShell } from "./ResourceShell";
import { SaveBar } from "./SaveBar";
import { RecordSummary } from "./RecordSummary";
import { ArrivalExperience,BodyExperience,EmotionExperience,NeedsExperience,PolarityExperience } from "./PerceptionExperiences";
import { CardsExperience,FigureExperience,CycleExperience,BoundariesExperience,CaseExperience } from "./StudyExperiences";
import { PhenomenologyExperience,ExperimentExperience,DialogicalExperience } from "./LearningExperiences";
import { PauseExperience,ListeningExperience,WaterExperience } from "./PauseExperiences";
import { ThoughtLandscape } from "./ThoughtLandscape";
import { Button,Dialog } from "./ui";
import type { ExperienceProps } from "./experience-types";
import type { EditorialItem,EditorialVersion } from "./editorial-schema";

const EXPERIENCES:Record<string,ComponentType<ExperienceProps>>={
 "chegada":ArrivalExperience,"mapa-do-corpo":BodyExperience,"roda-das-emocoes":EmotionExperience,
 "necessidades-agora":NeedsExperience,"polaridades-e-cadeiras":PolarityExperience,
 "cartas-gestalticas":CardsExperience,"figura-e-fundo":FigureExperience,"ciclo-do-contato":CycleExperience,
 "fronteiras-de-contato":BoundariesExperience,"casoteca":CaseExperience,"laboratorio-fenomenologico":PhenomenologyExperience,
 "atelie-do-experimento":ExperimentExperience,"escuta-dialogica":DialogicalExperience,
 "sala-de-pausa":PauseExperience,"sons-para-awareness":ListeningExperience,"igarape":WaterExperience,
 "paisagem-de-pensamentos":ThoughtLandscape,
};
export interface ResourceSnapshot { version:EditorialVersion|null; concepts:EditorialItem[]; emotions:EditorialItem[]; needs:EditorialItem[]; cases:EditorialItem[] }
export function ResourceHost({slug,snapshot,initialMode,preview=false}:{slug:string;snapshot:ResourceSnapshot;initialMode?:string;preview?:boolean}) {
 const router=useRouter(); const resource=resourceCatalog.find(item=>item.slug===slug);
 const [mode,setMode]=useState(initialMode ?? resource?.modes[0] ?? "");
 const [draft,setDraft]=useState<unknown>(null); const [completed,setCompleted]=useState(false); const [iteration,setIteration]=useState(0); const [pendingMode,setPendingMode]=useState<string|null>(null); const [pendingExit,setPendingExit]=useState<string|null>(null);
 const report=useCallback((payload:unknown)=>setDraft(payload),[]);
 const complete=useCallback((payload:unknown)=>{setDraft(payload);setCompleted(true);},[]);
 useEffect(()=>{
  if(!draft)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();};
  window.addEventListener("beforeunload",warn);
  return ()=>window.removeEventListener("beforeunload",warn);
 },[draft]);
 if(!resource || !EXPERIENCES[slug]) return null;
 const Experience=EXPERIENCES[slug];
 const changeMode=(value:string)=>{if(draft){setPendingMode(value);return;}setMode(value);setIteration(index=>index+1);};
 const navigateAway=(path:string)=>{if(draft){setPendingExit(path);return;}router.push(path);};
 const end=()=>{setCompleted(true);};
 const discard=()=>router.push(resource.access==="public" && !preview ? "/recursos" : "/portal/recursos");
 return <ResourceShell resource={resource} version={snapshot.version} concepts={snapshot.concepts} onEnd={end} onNavigateAway={navigateAway} preview={preview}>
  <Dialog title="Trocar de modo?" open={pendingMode!==null} onClose={()=>setPendingMode(null)}><p>As respostas deste modo ficam somente nesta tela. Se trocar, este rascunho será descartado.</p><div className="fv-actions"><Button secondary onClick={()=>setPendingMode(null)}>Continuar neste modo</Button><Button onClick={()=>{if(pendingMode){setMode(pendingMode);setDraft(null);setPendingMode(null);setIteration(value=>value+1);}}}>Trocar modo e descartar</Button></div></Dialog>
  <Dialog title="Sair desta experiência?" open={pendingExit!==null} onClose={()=>setPendingExit(null)}><p>Seu rascunho permanece somente nesta tela. Se sair, ele será descartado.</p><div className="fv-actions"><Button secondary onClick={()=>setPendingExit(null)}>Continuar aqui</Button><Button onClick={()=>{if(pendingExit)router.push(pendingExit);}}>Sair sem guardar</Button></div></Dialog>
  {completed ? <><h2>O que fica desta experiência?</h2><p>Seu registro permanece nesta tela até você encerrar.</p><RecordSummary payload={draft} labels={[...snapshot.emotions,...snapshot.needs,...snapshot.concepts]} /><SaveBar resource={resource} payload={draft} contentVersion={snapshot.version?.id ?? null} preview={preview} onDiscard={discard} /><div className="fv-actions"><Button secondary onClick={()=>{setCompleted(false);setDraft(null);setIteration(value=>value+1);}}>Começar outra experiência</Button></div></> :
  <>{resource.modes.length>1 && resource.slug!=="sala-de-pausa" && <div className="fv-field"><span>Escolher modo</span><div className="fv-actions" role="group" aria-label="Modos do recurso">{resource.modes.map(value=><Button key={value} secondary aria-pressed={mode===value} onClick={()=>changeMode(value)}>{value.replaceAll("-"," ")}</Button>)}</div></div>}
  <Experience key={mode+iteration} mode={mode} {...snapshot} onDraft={report} onComplete={complete} /></>}
 </ResourceShell>;
}

"use client";
import { useState,useCallback,useEffect,type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { resourceCatalog,modeLabel,modeDescription } from "@/components/resources/resourceCatalog";
import { ResourceShell } from "./ResourceShell";
import { SaveBar } from "./SaveBar";
import { RecordSummary } from "./RecordSummary";
import { ArrivalExperience,BodyExperience,EmotionExperience,NeedsExperience,PolarityExperience } from "./PerceptionExperiences";
import { CardsExperience,FigureExperience,CycleExperience,BoundariesExperience,CaseExperience } from "./StudyExperiences";
import { PhenomenologyExperience,ExperimentExperience,DialogicalExperience } from "./LearningExperiences";
import { PauseExperience,ListeningExperience,WaterExperience } from "./PauseExperiences";
import { ThoughtLandscape } from "./ThoughtLandscape";
import { Button,Dialog } from "./ui";
import { useDiscardConfirmation } from "./useDiscardConfirmation";
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
export function ResourceHost({slug,snapshot,initialMode,preview=false,returnTo}:{slug:string;snapshot:ResourceSnapshot;initialMode?:string;preview?:boolean;returnTo?:string}) {
 const router=useRouter(); const resource=resourceCatalog.find(item=>item.slug===slug);
 const [mode,setMode]=useState(initialMode ?? resource?.modes[0] ?? "");
 const [draft,setDraft]=useState<unknown>(null); const [completed,setCompleted]=useState(false); const [iteration,setIteration]=useState(0); const [pendingMode,setPendingMode]=useState<string|null>(null); const [pendingExit,setPendingExit]=useState<string|null>(null); const [started,setStarted]=useState(false); const [pendingReturnToModes,setPendingReturnToModes]=useState(false);
 const [saved,setSaved]=useState(false);
 const report=useCallback((payload:unknown)=>{setDraft(payload);setSaved(false);},[]);
 const complete=useCallback((payload:unknown)=>{setDraft(payload);setSaved(false);setCompleted(true);},[]);
 const markSaved=useCallback(()=>setSaved(true),[]);
 const hasUnsaved=!!draft && !saved;
 const {requestChange,confirmation}=useDiscardConfirmation();
 useEffect(()=>{
  if(!hasUnsaved)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();};
  window.addEventListener("beforeunload",warn);
  return ()=>window.removeEventListener("beforeunload",warn);
 },[hasUnsaved]);
 if(!resource || !EXPERIENCES[slug]) return null;
 const Experience=EXPERIENCES[slug];
 const hasLaunchScreen=slug==="figura-e-fundo";
 const changeMode=(value:string)=>{if(value===mode)return;if(hasUnsaved){setPendingMode(value);return;}setMode(value);setIteration(index=>index+1);};
 const navigateAway=(path:string)=>{if(hasUnsaved){setPendingExit(path);return;}router.push(path);};
 const returnToModes=()=>{if(hasUnsaved)setPendingReturnToModes(true);else{setStarted(false);setCompleted(false);setDraft(null);setSaved(false);}};
 const discard=()=>router.push(returnTo ?? (resource.access==="public" && !preview ? "/recursos" : "/portal/recursos"));
 return <ResourceShell resource={resource} version={snapshot.version} concepts={snapshot.concepts} onNavigateAway={navigateAway} preview={preview} returnTo={returnTo}>
  {confirmation}
  <Dialog title="Trocar de modo?" open={pendingMode!==null} onClose={()=>setPendingMode(null)}><p>As respostas deste modo ficam somente nesta tela. Se trocar, este rascunho será descartado.</p><div className="fv-actions"><Button secondary onClick={()=>setPendingMode(null)}>Continuar neste modo</Button><Button onClick={()=>{if(pendingMode){setMode(pendingMode);setDraft(null);setPendingMode(null);setIteration(value=>value+1);}}}>Trocar modo e descartar</Button></div></Dialog>
  <Dialog title="Sair desta experiência?" open={pendingExit!==null} onClose={()=>setPendingExit(null)}><p>Seu rascunho permanece somente nesta tela. Se sair, ele será descartado.</p><div className="fv-actions"><Button secondary onClick={()=>setPendingExit(null)}>Continuar aqui</Button><Button onClick={()=>{if(pendingExit)router.push(pendingExit);}}>Sair sem guardar</Button></div></Dialog>
  <Dialog title="Voltar à escolha do modo?" open={pendingReturnToModes} onClose={()=>setPendingReturnToModes(false)}><p>Este rascunho fica somente nesta tela. Para escolher outro modo, será preciso descartá-lo.</p><div className="fv-actions"><Button secondary onClick={()=>setPendingReturnToModes(false)}>Continuar nesta experiência</Button><Button onClick={()=>{setDraft(null);setCompleted(false);setStarted(false);setPendingReturnToModes(false);setIteration(value=>value+1);}}>Voltar e descartar rascunho</Button></div></Dialog>
  {hasLaunchScreen && !started ? <div className="fv-launch-screen"><span className="fv-label">Preparar experiência</span><h2>Escolha um modo para começar</h2><p>Você pode trocar de modo a qualquer momento antes de registrar suas percepções.</p><div className="fv-options" role="group" aria-label="Escolha um modo">{resource.modes.map(value=><button key={value} type="button" className="fv-option" aria-pressed={mode===value} onClick={()=>setMode(value)}><strong>{modeLabel(value)}</strong><span>{modeDescription(resource.slug,value)}</span><span className="fv-option-check">{mode===value ? "Selecionado" : "Escolher modo"}</span></button>)}</div><p className="fv-mode-status" aria-live="polite">Modo selecionado: <strong>{modeLabel(mode)}</strong></p><div className="fv-actions"><Button onClick={()=>{setStarted(true);setCompleted(false);}}>Iniciar recurso</Button></div></div> : completed ? <><h2>O que fica desta experiência?</h2><p>{saved ? "Seu registro foi guardado. Você pode voltar aos recursos." : draft ? "Suas respostas estão somente nesta tela. Você decide se quer guardá-las." : "A experiência foi encerrada. Nenhuma resposta foi registrada."}</p><RecordSummary payload={draft} labels={[...snapshot.emotions,...snapshot.needs,...snapshot.concepts]} /><SaveBar resource={resource} payload={draft} contentVersion={snapshot.version?.id ?? null} preview={preview} onDiscard={discard} onSaved={markSaved} onNavigateAway={navigateAway} /><div className="fv-actions"><Button secondary onClick={()=>requestChange(hasUnsaved,()=>{setCompleted(false);setDraft(null);setSaved(false);setIteration(value=>value+1);})}>Começar outra experiência</Button></div></> :
  <>{hasLaunchScreen ? <div className="fv-flow-nav"><Button secondary onClick={returnToModes}>Voltar à escolha do modo</Button><span>Modo: <strong>{modeLabel(mode)}</strong></span></div> : resource.modes.length>1 && resource.slug!=="chegada" && resource.slug!=="igarape" && resource.slug!=="sala-de-pausa" && resource.slug!=="cartas-gestalticas" && <div className="fv-field"><span>Escolher modo</span><div className="fv-actions fv-mode-options" role="group" aria-label="Modos do recurso">{resource.modes.map(value=><Button key={value} secondary aria-pressed={mode===value} onClick={()=>changeMode(value)}>{modeLabel(value)}</Button>)}</div><p className="fv-mode-status" aria-live="polite">Modo selecionado: <strong>{modeLabel(mode)}</strong></p></div>}
  <Experience key={mode+iteration} mode={mode} {...snapshot} onDraft={report} onComplete={complete} /></>}
 </ResourceShell>;
}

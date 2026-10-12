"use client";
import Link from "next/link";
import { useEffect, useState, createContext, useContext, type ReactNode,type MouseEvent } from "react";
import { ArrowLeft, Eye, Volume2, VolumeX } from "lucide-react";
import type { ResourceDefinition } from "@/components/resources/resourceCatalog";
import { Button, PrivacyNote, Dialog, ReferenceLine } from "./ui";
import { resourceAudioManager } from "./audio-manager";
import type { EditorialItem, EditorialVersion } from "./editorial-schema";

const MotionPreference = createContext(true);
export function useResourceMotion() { return useContext(MotionPreference); }
export function ResourceShell({ resource, version, concepts, onEnd, onNavigateAway, children, preview = false }: {
  resource: ResourceDefinition; version: EditorialVersion | null; concepts: EditorialItem[];
  onEnd: () => void; onNavigateAway?: (path:string) => void; children: ReactNode; preview?: boolean;
}) {
  const [systemReduced, setSystemReduced] = useState(true);
  const [chosenReduced, setChosenReduced] = useState(false);
  const [sound, setSound] = useState(false);
  const [error, setError] = useState("");
  const [concept, setConcept] = useState<EditorialItem | null>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(preference.matches);
    update(); preference.addEventListener("change", update);
    const muted=()=>setSound(false);window.addEventListener("fv:resource-audio-muted",muted);
    return () => { preference.removeEventListener("change", update); window.removeEventListener("fv:resource-audio-muted",muted); resourceAudioManager.stop(resource.slug); };
  }, [resource.slug]);
  const reduced = systemReduced || chosenReduced;
  const toggleSound = async () => {
    setError("");
    if (sound) { resourceAudioManager.mute(); setSound(false); return; }
    try { setSound(await resourceAudioManager.activateFromGesture()); }
    catch { setError("O áudio está indisponível. Você pode continuar sem som."); }
  };
  const navigation=resource.access === "public" && !preview ? "/recursos" : "/portal/recursos";
  const requestNavigation=(event:MouseEvent<HTMLAnchorElement>,path:string)=>{if(!onNavigateAway)return;event.preventDefault();onNavigateAway(path);};
  return <MotionPreference.Provider value={reduced}><section className="fv-resources" data-register={resource.register} aria-label={resource.title}>
    <nav className="fv-nav" aria-label="Navegação do recurso">
      <Link href={navigation} onClick={event=>requestNavigation(event,navigation)}><ArrowLeft size={20} aria-hidden="true" />Recursos</Link>
      <div className="fv-nav-tools">
        {version?.configuration.audio.length ? <Button secondary aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}Som {sound ? "ativo" : "desligado"}</Button> : null}
        <Button secondary aria-pressed={reduced} disabled={systemReduced} onClick={() => setChosenReduced(value => !value)}><Eye size={20} aria-hidden="true" />{reduced ? "Movimento reduzido" : "Reduzir movimento"}</Button>
        <Button secondary onClick={onEnd}>Encerrar</Button>
      </div>
    </nav>
    <div className="fv-content">
      <header className="fv-header"><span className="fv-label">{resource.category} · {resource.duration}</span><h1>{resource.title}</h1><p className="fv-support">{resource.description}</p>{preview && <p className="fv-tag">Prévia editorial · sem publicação e sem salvamento pessoal</p>}</header>
      {error && <p className="fv-error" role="alert">{error}</p>}
      <div className="fv-stage-grid"><div className="fv-stage">{children}</div><aside className="fv-aside" aria-label="Apoio à experiência">
        <span className="fv-label">Para acompanhar</span><h2>No seu tempo</h2><p>Você pode pular perguntas ou encerrar quando quiser.</p>
        {version?.reviewerName && <p className="fv-reference">Revisão: {version.reviewerName} · CRP {version.reviewerCrp}</p>}
        {!!concepts.length && <><h3>Conceitos relacionados</h3><ul className="fv-list">{concepts.slice(0,12).map(item => <li key={item.id}><Button secondary onClick={() => setConcept(item)}>{item.title}</Button></li>)}</ul></>}
        <PrivacyNote /><Link href="/portal/recursos/meus-registros" onClick={event=>requestNavigation(event,"/portal/recursos/meus-registros")}>Meus registros</Link>
      </aside></div>
    </div>
    <Dialog title={concept?.title ?? "Conceito"} open={!!concept} onClose={() => setConcept(null)}>{concept && <><p className="fv-summary">{concept.text}</p><ReferenceLine item={concept} /></>}</Dialog>
  </section></MotionPreference.Provider>;
}

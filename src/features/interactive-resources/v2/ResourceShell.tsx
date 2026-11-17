"use client";
import Link from "next/link";
import { useEffect, useState, createContext, useContext, type ReactNode, type MouseEvent, useRef } from "react";
import { ArrowLeft, Eye, EyeOff, ALargeSmall, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import type { ResourceDefinition } from "@/components/resources/resourceCatalog";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PrivacyNote, Dialog, ReferenceLine } from "./ui";
import { resourceAudioManager } from "./audio-manager";
import type { EditorialItem, EditorialVersion } from "./editorial-schema";

const MotionPreference = createContext(true);
export function useResourceMotion() { return useContext(MotionPreference); }
const ResourceNavigation=createContext<((path:string)=>void)|null>(null);
export function ResourceLink({href,children}:{href:string;children:ReactNode}) {
  const navigate=useContext(ResourceNavigation);
  return <Link href={href} onClick={event=>{if(navigate && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button===0){event.preventDefault();navigate(href);}}}>{children}</Link>;
}

export function ResourceShell({ resource, version, concepts, onNavigateAway, children, preview = false, returnTo, modal = true }: {
  resource: ResourceDefinition; version: EditorialVersion | null; concepts: EditorialItem[];
  onNavigateAway?: (path: string) => void; children: ReactNode; preview?: boolean; returnTo?:string; modal?:boolean;
}) {
  const [largeText,setLargeText]=useState(false);
  const windowRef=useRef<HTMLDivElement>(null);
  const dialogRef=useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    if (modal) dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modal]);
  const Window = modal ? "dialog" : "div";
  const [systemReduced, setSystemReduced] = useState(true);
  const [chosenReduced, setChosenReduced] = useState(false);
  const [sound, setSound] = useState(false);
  const [error, setError] = useState("");
  const [concept, setConcept] = useState<EditorialItem | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();
  const isRiver=resource.slug==="igarape";
  const isPause=resource.slug==="sala-de-pausa";
  const isWorlds=resource.slug==="ambientes-imersivos";
  const focusedCards=resource.slug==="cartas-gestalticas";
  const focusedImmersive=["ciclo-do-contato","mapa-do-corpo","roda-das-emocoes","necessidades-agora","paisagem-de-pensamentos","sons-para-awareness","sala-de-pausa","igarape"].includes(resource.slug);
  const focusedArrival=resource.slug==="chegada";
  const focusedVisual=resource.slug==="figura-e-fundo";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    const muted = () => setSound(false);
    window.addEventListener("fv:resource-audio-muted", muted);
    return () => {
      preference.removeEventListener("change", update);
      window.removeEventListener("fv:resource-audio-muted", muted);
      resourceAudioManager.stop(resource.slug);
    };
  }, [resource.slug]);

  const reduced = systemReduced || chosenReduced;
  const toggleSound = async () => {
    setError("");
    if (sound) { resourceAudioManager.mute(); setSound(false); return; }
    try { setSound(await resourceAudioManager.activateFromGesture()); }
    catch { setError("O áudio está indisponível. Você pode continuar sem som."); }
  };
  const navigation = returnTo ?? (resource.access === "public" && !preview ? "/recursos" : "/portal/recursos");
  const requestNavigation = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!onNavigateAway) return;
    event.preventDefault();
    onNavigateAway(path);
  };

  return <MotionPreference.Provider value={reduced}><ResourceNavigation.Provider value={onNavigateAway ?? null}>
    <Window ref={node => { dialogRef.current = node instanceof HTMLDialogElement ? node : null; }} className={`fv-resource-overlay${modal ? " fv-resource-dialog" : ""}`} aria-labelledby="resource-title" aria-describedby="resource-description" onCancel={event => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      onNavigateAway?.(navigation);
    }}>
      <div ref={windowRef} className="fv-resource-window" data-resource-window data-text-size={largeText ? "large" : "normal"}>
        <header className="fv-resource-header">
          <Link className="fv-resource-back" href={navigation} aria-label="Voltar para recursos" onClick={event => requestNavigation(event, navigation)}>
            <ArrowLeft size={20} aria-hidden="true" /><span>Recursos</span>
          </Link>
          <div className="fv-resource-heading"><h1 id="resource-title">{resource.title}</h1><p id="resource-description">{resource.description}</p></div>
          <div className="fv-resource-tools" role="group" aria-label="Controles da experiência">
            <button className="fv-resource-icon-btn" type="button" aria-label={largeText ? "Usar tamanho de texto padrão" : "Aumentar tamanho do texto"} aria-pressed={largeText} title={largeText ? "Usar tamanho de texto padrão" : "Aumentar tamanho do texto"} onClick={()=>setLargeText(value=>!value)}><ALargeSmall size={21} aria-hidden="true"/></button>
            <button className="fv-resource-icon-btn" type="button" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            </button>
          </div>
        </header>
        <div className={`fv-resource-body${isWorlds ? " fv-resource-body--fill" : ""}`} data-scroll-root data-lenis-prevent>
          <section className="fv-resources" data-register={resource.register} data-resource-key={resource.slug} aria-label={resource.title}>
            <div className={`fv-content${focusedCards ? " fv-content--cards" : focusedImmersive ? " fv-content--immersive" : focusedArrival ? " fv-content--arrival" : focusedVisual ? " fv-content--visual" : ""}`}>
              {!isRiver && !isPause && !isWorlds && <details className="fv-accessibility-more"><summary>Mais opções de acessibilidade</summary><div className="fv-resource-tools">{version?.configuration.audio.length ? <button className="fv-resource-icon-btn" type="button" aria-label={sound ? "Desativar som" : "Ativar som"} aria-pressed={sound} title={sound ? "Desativar som" : "Ativar som"} onClick={() => void toggleSound()}>{sound ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}</button> : null}
            <button className="fv-resource-icon-btn" type="button" aria-label={systemReduced ? "Movimento reduzido pela preferência do sistema" : reduced ? "Permitir movimento" : "Reduzir movimento"} aria-pressed={reduced} title={systemReduced ? "Movimento reduzido pela preferência do sistema" : reduced ? "Permitir movimento" : "Reduzir movimento"} disabled={systemReduced} onClick={() => setChosenReduced(value => !value)}>
              {reduced ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button></div></details>}
              {preview && <p className="fv-editorial-notice">Prévia editorial · sem publicação e sem salvamento pessoal</p>}
              {version?.demo && !isRiver && !isPause && <p className="fv-editorial-notice" role="note">Conteúdo de demonstração · ainda sem revisão docente</p>}
              {resource.persistence==="optional" && !isWorlds && !focusedCards && !focusedArrival && !focusedImmersive && <p className="fv-session-note">Suas respostas ficam somente nesta tela. Para guardar no histórico, é preciso entrar na área do aluno e ter uma formação habilitada.</p>}
              {error && <p className="fv-error" role="alert">{error}</p>}
              <div className={`fv-stage-grid${focusedCards ? " fv-stage-grid--cards" : focusedImmersive ? " fv-stage-grid--immersive" : focusedArrival ? " fv-stage-grid--arrival" : focusedVisual ? " fv-stage-grid--visual" : ""}`}><div className="fv-stage">{children}</div>{isRiver || isWorlds ? null : (focusedCards || focusedArrival || focusedImmersive) ? <aside className="fv-cards-support" aria-label="Privacidade e registros"><div><PrivacyNote/><p className="fv-note">O histórico depende de acesso à área do aluno e de uma formação habilitada.</p>{version?.reviewerName && <p className="fv-reference">Revisão: {version.reviewerName} · CRP {version.reviewerCrp}</p>}</div><Link href="/portal/recursos/meus-registros" onClick={event=>requestNavigation(event,"/portal/recursos/meus-registros")}>Meus registros privados</Link></aside> : focusedVisual ? <aside className="fv-visual-support" aria-label="Sobre esta experiência"><p>Você pode observar, pular ou encerrar no seu tempo. As escolhas ficam somente nesta tela.</p>{version?.reviewerName && <p>Revisão do acervo de estudo: {version.reviewerName} · CRP {version.reviewerCrp}</p>}</aside> : <aside className="fv-aside" aria-label="Apoio à experiência">
                <span className="fv-label">Para acompanhar</span><h2>No seu tempo</h2><p>Você pode pular perguntas ou voltar à escolha do modo quando quiser.</p>
                {version?.demo ? <p className="fv-reference">Conteúdo de demonstração, publicado para testes e apresentação. Ainda não passou por revisão docente.</p> : version?.reviewerName && <p className="fv-reference">Revisão: {version.reviewerName} · CRP {version.reviewerCrp}</p>}
                {!!concepts.length && <><h3>Conceitos relacionados</h3><ul className="fv-list">{concepts.slice(0, 12).map(item => <li key={item.id}><button className="fv-button fv-button--secondary" type="button" onClick={() => setConcept(item)}>{item.title}</button></li>)}</ul></>}
                <PrivacyNote /><Link href="/portal/recursos/meus-registros" onClick={event => requestNavigation(event, "/portal/recursos/meus-registros")}>Meus registros</Link>
              </aside>}</div>
            </div>
          </section>
        </div>
      </div>
    </Window>
    <Dialog title={concept?.title ?? "Conceito"} open={!!concept} onClose={() => setConcept(null)}>{concept && <><p className="fv-summary">{concept.text}</p><ReferenceLine item={concept} /></>}</Dialog>
  </ResourceNavigation.Provider></MotionPreference.Provider>;
}

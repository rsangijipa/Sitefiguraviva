"use client";
import Link from "next/link";
import { useEffect, useState, createContext, useContext, type ReactNode, type MouseEvent } from "react";
import { ArrowLeft, Eye, EyeOff, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import type { ResourceDefinition } from "@/components/resources/resourceCatalog";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PrivacyNote, Dialog, ReferenceLine } from "./ui";
import { resourceAudioManager } from "./audio-manager";
import type { EditorialItem, EditorialVersion } from "./editorial-schema";

const MotionPreference = createContext(true);
export function useResourceMotion() { return useContext(MotionPreference); }

export function ResourceShell({ resource, version, concepts, onNavigateAway, children, preview = false }: {
  resource: ResourceDefinition; version: EditorialVersion | null; concepts: EditorialItem[];
  onNavigateAway?: (path: string) => void; children: ReactNode; preview?: boolean;
}) {
  const [systemReduced, setSystemReduced] = useState(true);
  const [chosenReduced, setChosenReduced] = useState(false);
  const [sound, setSound] = useState(false);
  const [error, setError] = useState("");
  const [concept, setConcept] = useState<EditorialItem | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();

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
  const navigation = resource.access === "public" && !preview ? "/recursos" : "/portal/recursos";
  const requestNavigation = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!onNavigateAway) return;
    event.preventDefault();
    onNavigateAway(path);
  };

  return <MotionPreference.Provider value={reduced}>
    <div className="fv-resource-overlay">
      <div className="fv-resource-window" data-resource-window>
        <header className="fv-resource-header">
          <Link className="fv-resource-back" href={navigation} onClick={event => requestNavigation(event, navigation)}>
            <ArrowLeft size={20} aria-hidden="true" /><span>Voltar para recursos</span>
          </Link>
          <p className="fv-resource-title">Experiência interativa</p>
          <div className="fv-resource-tools" role="group" aria-label="Controles da experiência">
            {version?.configuration.audio.length ? <button className="fv-resource-icon-btn" type="button" aria-label={sound ? "Desativar som" : "Ativar som"} aria-pressed={sound} title={sound ? "Desativar som" : "Ativar som"} onClick={() => void toggleSound()}>{sound ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}</button> : null}
            <button className="fv-resource-icon-btn" type="button" aria-label={systemReduced ? "Movimento reduzido pela preferência do sistema" : reduced ? "Permitir movimento" : "Reduzir movimento"} aria-pressed={reduced} title={systemReduced ? "Movimento reduzido pela preferência do sistema" : reduced ? "Permitir movimento" : "Reduzir movimento"} disabled={systemReduced} onClick={() => setChosenReduced(value => !value)}>
              {reduced ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
            <button className="fv-resource-icon-btn" type="button" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            </button>
          </div>
        </header>
        <div className="fv-resource-body" data-scroll-root>
          <section className="fv-resources" data-register={resource.register} aria-label={resource.title}>
            <div className="fv-content">
              <header className="fv-header"><span className="fv-label">{resource.category} · {resource.duration}</span><h1>{resource.title}</h1><p className="fv-support">{resource.description}</p>{preview && <p className="fv-tag">Prévia editorial · sem publicação e sem salvamento pessoal</p>}{version?.demo && <p className="fv-tag" role="note">Conteúdo de demonstração · ainda sem revisão docente</p>}</header>
              {error && <p className="fv-error" role="alert">{error}</p>}
              <div className="fv-stage-grid"><div className="fv-stage">{children}</div><aside className="fv-aside" aria-label="Apoio à experiência">
                <span className="fv-label">Para acompanhar</span><h2>No seu tempo</h2><p>Você pode pular perguntas ou voltar à escolha do modo quando quiser.</p>
                {version?.demo ? <p className="fv-reference">Conteúdo de demonstração, publicado para testes e apresentação. Ainda não passou por revisão docente.</p> : version?.reviewerName && <p className="fv-reference">Revisão: {version.reviewerName} · CRP {version.reviewerCrp}</p>}
                {!!concepts.length && <><h3>Conceitos relacionados</h3><ul className="fv-list">{concepts.slice(0, 12).map(item => <li key={item.id}><button className="fv-button fv-button--secondary" type="button" onClick={() => setConcept(item)}>{item.title}</button></li>)}</ul></>}
                <PrivacyNote /><Link href="/portal/recursos/meus-registros" onClick={event => requestNavigation(event, "/portal/recursos/meus-registros")}>Meus registros</Link>
              </aside></div>
            </div>
          </section>
        </div>
      </div>
    </div>
    <Dialog title={concept?.title ?? "Conceito"} open={!!concept} onClose={() => setConcept(null)}>{concept && <><p className="fv-summary">{concept.text}</p><ReferenceLine item={concept} /></>}</Dialog>
  </MotionPreference.Provider>;
}

"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle, MonitorSmartphone, Moon, Music, Pause, Plus, Sun, X } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { usePublicContact } from "@/features/public-site/components/PublicContactProvider";
import styles from "./FloatingControls.module.css";
const THEMES = [{ value: "light", label: "Claro", Icon: Sun }, { value: "dark", label: "Escuro", Icon: Moon }, { value: "system", label: "Sistema", Icon: MonitorSmartphone }] as const;
// Aparece depois de meia tela rolada (no máximo 400px), também em contêineres curtos.
const BACK_TO_TOP_MAX_OFFSET = 400;

/**
 * Telas com rolagem interna (ex.: a janela de um recurso interativo) marcam o
 * contêiner com `data-scroll-root`; nas demais, quem rola é a própria janela.
 */
function scrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-scroll-root]");
}

function useBackToTop(pathname: string) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const root = scrollRoot();
      const offset = root ? root.scrollTop : window.scrollY;
      const viewport = root ? root.clientHeight : window.innerHeight;
      setVisible(offset > Math.min(BACK_TO_TOP_MAX_OFFSET, viewport / 2));
    };
    update();
    // Rolagem de elementos não borbulha; a captura no documento recebe as duas.
    document.addEventListener("scroll", update, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", update, { capture: true });
  }, [pathname]);
  const scrollToTop = useCallback(() => {
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const root = scrollRoot();
    if (root) root.scrollTo({ top: 0, behavior });
    else window.scrollTo({ top: 0, behavior });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, []);
  return { visible, scrollToTop };
}

export default function FloatingControls() {
  const config = usePublicContact();
  const pathname = usePathname() ?? "";
  const resourceExperience = /^\/(portal\/)?recursos\/[^/]+/.test(pathname);
  const { preference, setPreference } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const backToTop = useBackToTop(pathname);
  // Nas experiências de recurso o som é do próprio recurso e o contato some para não disputar atenção.
  const showAmbientAudio = config.showAudioControl && !resourceExperience;
  const showContact = !resourceExperience && !/^\/(admin|auth|login|signup|portal|inscricao)(\/|$)/.test(pathname) && Boolean(config.whatsappNumber);
  const area = resourceExperience ? "resource" : pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/portal") ? "portal" : "public";
  useEffect(() => { setExpanded(false); if (resourceExperience) audioRef.current?.pause(); }, [pathname, resourceExperience]);
  useEffect(() => {
    if (!expanded) return;
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setExpanded(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setExpanded(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [expanded]);
  useEffect(() => {
    const pause = () => audioRef.current?.pause();
    const mediaStarted = (event: Event) => { if (event.target !== audioRef.current) pause(); };
    const hidden = () => { if (document.hidden) pause(); };
    window.addEventListener("fv:lesson-audio-start", pause);
    document.addEventListener("play", mediaStarted, true);
    document.addEventListener("visibilitychange", hidden);
    return () => { window.removeEventListener("fv:lesson-audio-start", pause); document.removeEventListener("play", mediaStarted, true); document.removeEventListener("visibilitychange", hidden); };
  }, []);
  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError("");
    if (!audio.paused) { audio.pause(); return; }
    if (document.documentElement.dataset.lessonAudioPlaying === "true") {
      setAudioError("Pause o áudio da aula antes de tocar o som ambiente."); return;
    }
    try { await audio.play(); } catch { setIsPlaying(false); setAudioError("Não foi possível tocar o som. Tente novamente."); }
  };
  return (
    <div ref={rootRef} className={styles.root} data-area={area} data-global-options>
      {showAmbientAudio && <audio ref={audioRef} src="/assets/audio/meditation.mp3" preload="none" loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onError={() => { setIsPlaying(false); setAudioError("Som ambiente indisponível no momento."); }} />}
      {expanded && <div id={panelId} ref={panelRef} className={styles.panel} role="region" aria-label={showAmbientAudio ? "Som e aparência" : "Aparência"} data-secondary-floating-control="true">
        <p className={styles.title}>Aparência</p>
        <div className={styles.themes} role="group" aria-label="Escolher tema">
          {THEMES.map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={preference === value} onClick={() => setPreference(value)}><Icon size={18} aria-hidden="true" />{label}</button>)}
        </div>
        {showAmbientAudio && <button className={styles.audio} type="button" onClick={toggleAudio} aria-pressed={isPlaying}>{isPlaying ? <Pause size={18} aria-hidden="true" /> : <Music size={18} aria-hidden="true" />}{isPlaying ? "Pausar som ambiente" : "Tocar som ambiente"}</button>}
        {audioError && <p className={styles.error} role="status">{audioError}</p>}
      </div>}
      <div className={styles.actions}>
        <button type="button" className={styles.top} data-visible={backToTop.visible} data-secondary-floating-control="true" aria-label="Voltar ao topo da página" title="Voltar ao topo" onClick={backToTop.scrollToTop}><ArrowUp size={21} aria-hidden="true" /></button>
        {showContact && <a data-floating-whatsapp="true" className={styles.contact} href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(config.whatsappMessage || "")}`} target="_blank" rel="noopener noreferrer" aria-label="Falar com o Instituto no WhatsApp"><MessageCircle size={23} aria-hidden="true" /></a>}
        <button ref={triggerRef} type="button" className={styles.trigger} data-secondary-floating-control="true" aria-label={expanded ? "Fechar opções" : showAmbientAudio ? "Mais opções: som e tema" : "Mais opções: tema"} aria-controls={panelId} aria-expanded={expanded} title={showAmbientAudio ? "Som e tema" : "Tema"} onClick={() => setExpanded(value => !value)}>{expanded ? <X size={23} aria-hidden="true" /> : <Plus size={23} aria-hidden="true" />}</button>
      </div>
    </div>
  );
}

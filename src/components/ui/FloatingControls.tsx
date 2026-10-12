"use client";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, MonitorSmartphone, Moon, Music, Pause, Plus, Sun, X } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { usePublicContact } from "@/features/public-site/components/PublicContactProvider";
import styles from "./FloatingControls.module.css";
const THEMES = [{ value: "light", label: "Claro", Icon: Sun }, { value: "dark", label: "Escuro", Icon: Moon }, { value: "system", label: "Sistema", Icon: MonitorSmartphone }] as const;
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
  const showContact = !/^\/(admin|auth|login|signup|portal|inscricao)(\/|$)/.test(pathname) && Boolean(config.whatsappNumber);
  useEffect(() => { setExpanded(false); if(resourceExperience)audioRef.current?.pause(); }, [pathname,resourceExperience]);
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
  if(resourceExperience) return null;
  return (
    <div ref={rootRef} className={styles.root} data-area={pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/portal") ? "portal" : "public"} data-global-options>
      {config.showAudioControl && <audio ref={audioRef} src="/assets/audio/meditation.mp3" preload="none" loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onError={() => { setIsPlaying(false); setAudioError("Som ambiente indisponível no momento."); }} />}
      {expanded && <div id={panelId} ref={panelRef} className={styles.panel} role="region" aria-label="Som e aparência" data-secondary-floating-control="true">
        <p className={styles.title}>Aparência</p>
        <div className={styles.themes} aria-label="Escolher tema">
          {THEMES.map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={preference === value} onClick={() => setPreference(value)}><Icon size={18} aria-hidden="true" />{label}</button>)}
        </div>
        {config.showAudioControl && <button className={styles.audio} type="button" onClick={toggleAudio} aria-pressed={isPlaying}>{isPlaying ? <Pause size={18} aria-hidden="true" /> : <Music size={18} aria-hidden="true" />}{isPlaying ? "Pausar som ambiente" : "Tocar som ambiente"}</button>}
        {audioError && <p className={styles.error} role="status">{audioError}</p>}
      </div>}
      <div className={styles.actions}>
        {showContact && <a data-floating-whatsapp="true" className={styles.contact} href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(config.whatsappMessage || "")}`} target="_blank" rel="noopener noreferrer" aria-label="Falar com o Instituto no WhatsApp"><MessageCircle size={23} aria-hidden="true" /></a>}
        <button ref={triggerRef} type="button" className={styles.trigger} data-secondary-floating-control="true" aria-label={expanded ? "Fechar opções" : "Mais opções: som e tema"} aria-controls={panelId} aria-expanded={expanded} title="Som e tema" onClick={() => setExpanded(value => !value)}>{expanded ? <X size={23} aria-hidden="true" /> : <Plus size={23} aria-hidden="true" />}</button>
      </div>
    </div>
  );
}

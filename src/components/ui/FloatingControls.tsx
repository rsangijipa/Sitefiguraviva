"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  MessageCircle,
  MonitorSmartphone,
  Moon,
  Music,
  Pause,
  Plus,
  Sun,
} from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5569992481585";
const whatsappMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  "Olá! Gostaria de saber mais sobre as formações do Instituto Figura Viva.";

export default function FloatingControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme, preference, setPreference, mounted } = useTheme();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeLabel =
    preference === "system"
      ? "Tema: seguindo o sistema"
      : preference === "dark"
        ? "Tema escuro"
        : "Tema claro";

  const cyclePreference = () => {
    setPreference(
      preference === "light"
        ? "dark"
        : preference === "dark"
          ? "system"
          : "light",
    );
  };

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else await audioRef.current.play().catch(() => undefined);
    setIsPlaying((current) => !current);
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
  const controlClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-soft-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <audio
        ref={audioRef}
        src="/assets/audio/meditation.mp3"
        preload="metadata"
        loop
      />
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <a
          data-floating-whatsapp="true"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com o Instituto no WhatsApp"
          title="Falar no WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <MessageCircle size={24} aria-hidden="true" />
        </a>

        {expanded && (
          <div
            data-secondary-floating-control="true"
            className="flex flex-col items-center gap-3"
          >
            <button
              type="button"
              onClick={cyclePreference}
              aria-label={themeLabel}
              title={themeLabel}
              className={controlClass}
            >
              {!mounted ? (
                <Sun size={18} aria-hidden="true" />
              ) : preference === "system" ? (
                <MonitorSmartphone size={18} aria-hidden="true" />
              ) : theme === "dark" ? (
                <Moon size={18} aria-hidden="true" />
              ) : (
                <Sun size={18} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleAudio}
              aria-label={
                isPlaying ? "Pausar som ambiente" : "Tocar som ambiente"
              }
              title={isPlaying ? "Pausar som ambiente" : "Tocar som ambiente"}
              className={controlClass}
            >
              {isPlaying ? (
                <Pause size={18} aria-hidden="true" />
              ) : (
                <Music size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        <button
          type="button"
          data-secondary-floating-control="true"
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? "Fechar opções" : "Mais opções"}
          aria-expanded={expanded}
          className="z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 hover:bg-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus
            size={24}
            aria-hidden="true"
            className={
              expanded
                ? "rotate-45 transition-transform"
                : "transition-transform"
            }
          />
        </button>

        {showScrollTop && (
          <button
            type="button"
            data-secondary-floating-control="true"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
            className={controlClass}
          >
            <ArrowUp size={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

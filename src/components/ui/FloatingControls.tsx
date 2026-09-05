"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  ArrowUp,
  Moon,
  Sun,
  Play,
  Pause,
  Music,
  Plus,
  MonitorSmartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "./Tooltip";
import {
  useConfigSettings,
  useInstituteSettings,
} from "@/hooks/useSiteSettings";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function FloatingControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: config } = useConfigSettings();
  const { data: institute } = useInstituteSettings();

  const whatsappNumber =
    config?.whatsappNumber || institute?.whatsapp || "5569992481585";
  const whatsappMessage =
    config?.whatsappMessage ||
    "Olá! Gostaria de saber mais sobre as formações do Instituto Figura Viva.";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  // Música meditativa local
  const meditationMusic = "/assets/audio/meditation.mp3";

  // O tema mora no ThemeProvider: aqui só existe o gatilho. Antes esta lógica
  // vivia neste componente e nascia sempre em "light", então o botão mostrava
  // o ícone errado para quem já estava no escuro.
  const { theme, preference, setPreference, toggle, mounted } = useTheme();

  // Ciclo de três estados: claro → escuro → sistema. O terceiro é o que
  // devolve o controle ao sistema operacional depois de uma escolha manual.
  const cyclePreference = () => {
    setPreference(
      preference === "light"
        ? "dark"
        : preference === "dark"
          ? "system"
          : "light",
    );
  };

  const themeLabel =
    preference === "system"
      ? "Tema: seguindo o sistema"
      : preference === "dark"
        ? "Tema escuro"
        : "Tema claro";

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Audio Logic
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio autoplay blocked", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      <audio ref={audioRef} src={meditationMusic} preload="metadata" loop />

      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {/* 1. WhatsApp (Static - Top) */}
        <Tooltip content="Falar no WhatsApp">
          <motion.a
            data-floating-whatsapp="true"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar com o Instituto no WhatsApp"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center pointer-events-auto"
          >
            <MessageCircle size={24} />
          </motion.a>
        </Tooltip>

        {/* 2. Secondary Expanded Actions (Theme, Music) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              data-secondary-floating-control="true"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Alternador de tema */}
              <Tooltip content={themeLabel}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cyclePreference}
                  onDoubleClick={toggle}
                  aria-label={themeLabel}
                  title={themeLabel}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-soft-sm transition-colors hover:border-primary/40"
                >
                  {!mounted ? (
                    <Sun size={18} />
                  ) : preference === "system" ? (
                    <MonitorSmartphone size={18} />
                  ) : theme === "dark" ? (
                    <Moon size={18} />
                  ) : (
                    <Sun size={18} />
                  )}
                </motion.button>
              </Tooltip>

              {/* Audio Toggle */}
              {config?.showAudioControl !== false && (
                <Tooltip
                  content={isPlaying ? "Pausar Som" : "Tocar Som Ambiente"}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAudio}
                    aria-label={isPlaying ? "Pausar som ambiente" : "Tocar som ambiente"}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-all ${
                      isPlaying
                        ? "bg-gold border-gold text-white"
                        : "bg-surface border-border text-primary"
                    }`}
                  >
                    {isPlaying ? <Pause size={18} /> : <Music size={18} />}
                  </motion.button>
                </Tooltip>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Main Expand Toggle */}
        <motion.button
          data-secondary-floating-control="true"
          onClick={() => setExpanded(!expanded)}
          animate={{ rotate: expanded ? 45 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-gold"
          aria-label="Mais opções"
        >
          <Plus size={24} />
        </motion.button>

        {/* 4. Scroll To Top (Always at the bottom according to user request) */}
        <AnimatePresence>
          {showScrollTop && (
            <Tooltip content="Voltar ao Topo">
              <motion.button
                data-secondary-floating-control="true"
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToTop}
                aria-label="Voltar ao topo"
                className="glass-panel flex h-11 w-11 items-center justify-center rounded-full text-primary shadow-soft-md transition-all hover:bg-gold hover:text-white"
              >
                <ArrowUp size={20} />
              </motion.button>
            </Tooltip>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

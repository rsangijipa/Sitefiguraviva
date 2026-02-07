"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, ArrowUp, Moon, Sun, Play, Pause, Music, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "./Tooltip";

export default function FloatingControls() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [isPlaying, setIsPlaying] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const meditationMusic = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Reliable placeholder

    // Theme Logic
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem("theme")) {
                const newSystemTheme = e.matches ? "dark" : "light";
                setTheme(newSystemTheme);
                document.documentElement.classList.toggle("dark", e.matches);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

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
            audioRef.current.play().catch((e) => console.log("Audio autoplay blocked", e));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            <audio ref={audioRef} src={meditationMusic} loop />

            <div className="flex flex-col items-end gap-3 pointer-events-auto">
                {/* 1. WhatsApp (Static - Top) */}
                <Tooltip content="Falar no WhatsApp">
                    <motion.a
                        href="https://wa.me/556992481585"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center"
                    >
                        <MessageCircle size={24} />
                    </motion.a>
                </Tooltip>

                {/* 2. Secondary Expanded Actions (Theme, Music) */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="flex flex-col items-center gap-3"
                        >
                            {/* Theme Toggle */}
                            <Tooltip content={theme === "light" ? "Modo Escuro" : "Modo Claro"}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleTheme}
                                    className="w-10 h-10 rounded-full bg-white border border-stone-200 text-primary shadow-md flex items-center justify-center transition-colors"
                                >
                                    {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                                </motion.button>
                            </Tooltip>

                            {/* Audio Toggle */}
                            <Tooltip content={isPlaying ? "Pausar Som" : "Tocar Som Ambiente"}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleAudio}
                                    className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all border ${isPlaying
                                        ? 'bg-gold border-gold text-white'
                                        : 'bg-white border-stone-200 text-primary'
                                        }`}
                                >
                                    {isPlaying ? <Pause size={18} /> : <Music size={18} />}
                                </motion.button>
                            </Tooltip>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Main Expand Toggle */}
                <motion.button
                    onClick={() => setExpanded(!expanded)}
                    animate={{ rotate: expanded ? 45 : 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-gold transition-colors z-10"
                    aria-label="Mais opções"
                >
                    <Plus size={24} />
                </motion.button>

                {/* 4. Scroll To Top (Always at the bottom according to user request) */}
                <AnimatePresence>
                    {showScrollTop && (
                        <Tooltip content="Voltar ao Topo">
                            <motion.button
                                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.5 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={scrollToTop}
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-primary shadow-lg flex items-center justify-center transition-all hover:bg-gold hover:text-white"
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

"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { AUDIO_CATALOG, AudioTrackItem } from "@/data/audioCatalog";
import {
  Play,
  Pause,
  Headphones,
  Sparkles,
  Clock,
  Radio,
  Compass,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "meditation" | "awareness" | "grounding" | "historical" | "ambient";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Todas as Práticas" },
  { id: "meditation", label: "Meditação Guiada" },
  { id: "awareness", label: "Awareness" },
  { id: "grounding", label: "Ancoragem & Corpo" },
  { id: "historical", label: "Registros Históricos" },
  { id: "ambient", label: "Sons do Ambiente" },
];

export default function AudioCenterPage() {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const filteredTracks = AUDIO_CATALOG.filter((track) => {
    if (selectedCategory === "all") return true;
    return track.category === selectedCategory;
  });

  const handleTrackAction = (track: AudioTrackItem) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        url: track.url,
        cover: track.cover,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 md:px-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-stone-900 text-white p-8 md:p-12 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 opacity-10 pointer-events-none hidden lg:block">
          <Headphones size={220} />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            Espaço de Escuta & Presença
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white">
            Meditação & Paisagens Sonoras
          </h1>
          <p className="text-stone-300 text-sm md:text-base leading-relaxed">
            Cultive o <span className="text-gold font-medium">aqui-e-agora</span> com práticas guiadas de awareness, ancoragem somática e gravações raras de Frederick Perls. Seu reprodutor permanecerá ativo enquanto você estuda pelas outras áreas do Instituto.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <Radio size={14} className="text-gold animate-pulse" />
              Reprodução Contínua em Segundo Plano
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Volume2 size={14} className="text-gold" />
              Áudio de Alta Definição
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
              selectedCategory === cat.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => {
          const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
          const isThisTrackActive = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              className={cn(
                "group relative bg-white rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between shadow-sm hover:shadow-md",
                isThisTrackActive
                  ? "border-gold ring-1 ring-gold/40 shadow-gold/10"
                  : "border-stone-200 hover:border-gold/50"
              )}
            >
              <div className="space-y-4">
                {/* Header tags & duration */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                    {track.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Clock size={12} />
                    <span>{track.durationFormatted}</span>
                  </div>
                </div>

                {/* Track Info */}
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-primary transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    {track.artist}
                  </p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {track.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Play Action */}
              <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleTrackAction(track)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95",
                    isThisTrackPlaying
                      ? "bg-gold text-stone-900 hover:bg-gold/90"
                      : isThisTrackActive
                      ? "bg-stone-900 text-white hover:bg-primary"
                      : "bg-stone-100 text-stone-800 hover:bg-gold hover:text-stone-900"
                  )}
                >
                  {isThisTrackPlaying ? (
                    <>
                      <Pause size={16} className="fill-current" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-current" />
                      <span>{isThisTrackActive ? "Continuar" : "Ouvir Agora"}</span>
                    </>
                  )}
                </button>

                {isThisTrackPlaying && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-4 bg-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-2 bg-gold rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful info box */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-stone-700">
          <Compass size={24} className="text-gold shrink-0" />
          <p className="text-xs text-stone-600">
            <strong>Dica do Instituto:</strong> Você pode usar o player flutuante no canto inferior direito para ajustar a velocidade (0.75x a 1.5x) e programar o <em>timer de desligamento</em> para práticas antes de dormir ou entre sessões.
          </p>
        </div>
      </div>
    </div>
  );
}

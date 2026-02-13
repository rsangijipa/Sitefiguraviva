"use client";

import React, { useState, useEffect } from "react";

import {
  Play,
  Pause,
  X,
  Music,
  ChevronUp,
  ChevronDown,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function FloatingAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    seek,
    stop,
    playbackRate,
    setRate,
  } = useAudio();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepRemaining !== null && sleepRemaining > 0 && isPlaying) {
      interval = setInterval(() => {
        setSleepRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            stop();
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepRemaining, isPlaying, stop]); // Added stop to dependency array

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSetSleep = (mins: number) => {
    setSleepTimer(mins);
    setSleepRemaining(mins * 60);
  };

  const speeds = [0.75, 1, 1.25, 1.5];

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] transition-all duration-500 ease-out animate-in slide-in-from-bottom-10",
        isMinimized ? "w-16 h-16" : "w-80 md:w-96",
      )}
    >
      <div className="relative group">
        {/* Main Player Card */}
        <div
          className={cn(
            "bg-white/90 backdrop-blur-2xl border border-gold/20 shadow-soft-xl rounded-2xl overflow-hidden transition-all duration-500",
            isMinimized
              ? "rounded-full aspect-square flex items-center justify-center p-0"
              : "p-5",
          )}
        >
          {isMinimized ? (
            <button
              onClick={() => setIsMinimized(false)}
              className="w-full h-full flex items-center justify-center text-primary relative"
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gold/5 rounded-full",
                  isPlaying && "animate-spin-slow",
                )}
              />
              <Music size={24} className="relative z-10" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-gold overflow-hidden shrink-0 shadow-inner group">
                    {currentTrack.cover ? (
                      <img
                        src={currentTrack.cover}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Music size={24} />
                    )}
                  </div>
                  <div className="min-w-0 pr-2">
                    <h4 className="font-serif font-bold text-stone-800 text-base truncate leading-tight">
                      {currentTrack.title}
                    </h4>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">
                      {currentTrack.artist || "Instituto Figura Viva"}
                    </p>
                    {sleepRemaining !== null && (
                      <span className="text-[10px] text-primary font-mono font-bold">
                        Dormir em: {Math.floor(sleepRemaining / 60)}:
                        {(sleepRemaining % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <button
                    onClick={stop}
                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="relative h-1.5 w-full bg-stone-100 rounded-full overflow-hidden group/bar">
                  <div
                    className="absolute top-0 left-0 h-full bg-gold transition-all duration-300 pointer-events-none"
                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-mono font-bold tracking-tighter">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls & Options */}
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-1">
                  {/* Speed Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-[10px] font-bold text-stone-400 hover:text-primary transition-colors bg-stone-50 px-2 py-1 rounded"
                    >
                      {playbackRate}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-stone-100 shadow-xl rounded-lg p-1 flex flex-col min-w-[60px] animate-in fade-in slide-in-from-bottom-2">
                        {speeds.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setRate(s);
                              setShowSpeedMenu(false);
                            }}
                            className={cn(
                              "text-[10px] font-bold px-3 py-1.5 rounded hover:bg-stone-50 text-left",
                              playbackRate === s
                                ? "text-primary"
                                : "text-stone-500",
                            )}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sleep Timer */}
                  <button
                    onClick={() => handleSetSleep(sleepRemaining ? 0 : 30)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded transition-colors",
                      sleepRemaining
                        ? "bg-primary/10 text-primary"
                        : "text-stone-400 hover:text-primary bg-stone-50",
                    )}
                  >
                    {sleepRemaining ? "Timer On" : "Sleep"}
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => seek(progress - 15)}
                    className="text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlaying ? (
                      <Pause size={24} fill="currentColor" />
                    ) : (
                      <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => seek(progress + 15)}
                    className="text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
                <div className="w-10"></div> {/* Spacer to balance */}
              </div>
            </div>
          )}
        </div>

        {/* Animated Dust Paticles (Subtle Effect) */}
        {!isMinimized && isPlaying && (
          <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-aurora-gold animate-aurora rounded-2xl" />
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

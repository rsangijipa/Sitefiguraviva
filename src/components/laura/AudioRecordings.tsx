"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Clock, FileAudio } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

interface AudioPlayerProps {
  src?: string;
  title: string;
  duration: string;
  year: number;
  description: string;
}

function AudioPlayer({
  src,
  title,
  duration,
  year,
  description,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio can't play (no source), simulate progress
        simulatePlayback();
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isPlaying]);

  const simulatePlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev + 0.5;
      });
      setCurrentTime((prev) => prev + 1);
    }, 100);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = parseDuration(duration);

  return (
    <div className="bg-[#e8e4db] border border-[#b8ad96] rounded-lg shadow-md overflow-hidden group">
      {/* Hidden Audio Element (for when real audio is provided) */}
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />

      {/* Play Button Overlay */}
      <button
        onClick={togglePlay}
        className="absolute inset-y-0 left-0 w-20 bg-[#4a3a2a]/90 flex items-center justify-center z-10 hover:bg-[#3a2f25] transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-[#d9d4c9] flex items-center justify-center shadow-lg">
          {isPlaying ? (
            <Pause size={28} className="text-[#4a3a2a]" />
          ) : (
            <Play size={28} className="text-[#4a3a2a] ml-1" />
          )}
        </div>
      </button>

      {/* Content */}
      <div className="pl-24 pr-6 py-6 pr-32">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-[#a88a4d]/20 text-[#6a5a4a] text-[10px] uppercase tracking-widest font-bold rounded-full">
            {year}
          </span>
          <div className="flex items-center gap-1 text-[#8a7a6a] text-xs">
            <Clock size={12} />
            <span>
              {formatTime(currentTime)} / {duration}
            </span>
          </div>
        </div>

        <h3 className="font-serif text-2xl text-[#4a3a2a] mb-1">{title}</h3>
        <p className="text-[#5a4838] font-serif italic text-sm">
          {description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[#b8ad96]">
        <motion.div
          className="h-full bg-[#a88a4d]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Controls Bar */}
      <div className="px-6 py-3 bg-[#d9d4c9] flex items-center justify-between">
        {/* Waveform Visual */}
        <div className="hidden md:flex items-center gap-0.5 h-8 flex-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isPlaying
                  ? [
                      6 + Math.random() * 20,
                      8,
                      4 + Math.random() * 16,
                      12,
                      6 + Math.random() * 14,
                    ]
                  : 6,
              }}
              transition={{
                duration: 0.8,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.02,
              }}
              className={`w-0.5 rounded-full ${
                i / 50 <= progress / 100
                  ? isPlaying
                    ? "bg-[#a88a4d]"
                    : "bg-[#b8ad96]"
                  : "bg-[#d9d4c9]"
              }`}
            />
          ))}
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="p-2 text-[#6a5a4a] hover:text-[#4a3a2a] transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}

function parseDuration(durationStr: string): number {
  const [min, sec] = durationStr.split(":").map(Number);
  return min * 60 + sec;
}

export function AudioRecordings() {
  const { audioRecordings } = lauraPerlsContent;

  return (
    <section className="py-24 bg-[#d9d4c9] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, #4a3a2a 40px, #4a3a2a 41px)`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#a88a4d]/60" />
            <div className="w-10 h-10 rounded-full bg-[#4a3a2a] flex items-center justify-center">
              <FileAudio size={20} className="text-[#e8e4db]" />
            </div>
            <div className="h-px w-12 bg-[#a88a4d]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#8a7a6a] block mb-4">
            Arquivo de Áudio
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#3a2f25] leading-tight">
            Gravações{" "}
            <span className="italic text-[#5a4838] font-light">Históricas</span>
          </h2>
          <p className="mt-6 text-[#4a3a2a] font-serif italic max-w-xl mx-auto">
            Gravações históricas de Laura Perls. Clique em cada tarjeta para
            ouvir.
          </p>
        </div>

        {/* Audio Players */}
        <div className="space-y-6">
          {audioRecordings.map((recording, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <AudioPlayer
                title={recording.title}
                duration={recording.duration}
                year={recording.year}
                description={recording.description}
              />
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 p-6 bg-[#d9d4c9] border-l-4 border-[#a88a4d] rounded-r-sm">
          <p className="text-[#4a3a2a] font-serif italic text-sm">
            <strong className="not-italic">Nota:</strong> Estas gravações são
            simulações baseadas em registros históricos do NYIGT. Para acessar o
            áudio real, visite o Gestalt Therapy Institute of New York.
          </p>
        </div>
      </div>
    </section>
  );
}

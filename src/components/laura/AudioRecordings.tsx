"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  FileAudio,
  Subtitles,
  AlertCircle,
} from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";
import { cn } from "@/lib/utils";

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface AudioPlayerProps {
  src: string;
  vttSrc: string;
  title: string;
  duration: string;
  year: number;
  description: string;
}

function parseVTT(vttContent: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const lines = vttContent.split("\n");
  let currentSubtitle: Partial<Subtitle> = {};

  for (const line of lines) {
    const timecodeMatch = line.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s-->\s(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/,
    );

    if (timecodeMatch) {
      if (
        currentSubtitle.start &&
        currentSubtitle.end &&
        currentSubtitle.text
      ) {
        subtitles.push(currentSubtitle as Subtitle);
      }

      currentSubtitle = {
        start:
          parseInt(timecodeMatch[1]) * 3600 +
          parseInt(timecodeMatch[2]) * 60 +
          parseInt(timecodeMatch[3]) +
          parseInt(timecodeMatch[4]) / 1000,
        end:
          parseInt(timecodeMatch[5]) * 3600 +
          parseInt(timecodeMatch[6]) * 60 +
          parseInt(timecodeMatch[7]) +
          parseInt(timecodeMatch[8]) / 1000,
        text: "",
      };
    } else if (
      line.trim() &&
      !line.startsWith("WEBVTT") &&
      !line.startsWith("Speaker")
    ) {
      if (currentSubtitle.text) {
        currentSubtitle.text += "\n" + line.trim();
      } else {
        currentSubtitle.text = line.trim();
      }
    }
  }

  if (currentSubtitle.start && currentSubtitle.end && currentSubtitle.text) {
    subtitles.push(currentSubtitle as Subtitle);
  }

  return subtitles;
}

function AudioPlayer({
  src,
  vttSrc,
  title,
  duration,
  year,
  description,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load audio
  const loadAudio = useCallback(() => {
    if (audioRef.current) {
      setIsLoading(true);
      setError(null);

      audioRef.current.src = src;
      audioRef.current.load();

      audioRef.current.oncanplaythrough = () => {
        setIsLoading(false);
      };

      audioRef.current.onerror = () => {
        setIsLoading(false);
        setError(
          "Falha ao carregar o áudio. Verifique se o arquivo existe no servidor.",
        );
      };
    }
  }, [src]);

  useEffect(() => {
    loadAudio();
  }, [loadAudio]);

  // Load subtitles
  useEffect(() => {
    const loadSubtitles = async () => {
      try {
        const response = await fetch(vttSrc);
        if (!response.ok) throw new Error("Legendas não encontradas");
        const vttContent = await response.text();
        const parsed = parseVTT(vttContent);
        setSubtitles(parsed);
      } catch (err) {
        console.error("Failed to load subtitles:", err);
        setShowSubtitles(false);
      }
    };
    loadSubtitles();
  }, [vttSrc]);

  // Update current subtitle based on time
  useEffect(() => {
    const activeSubtitle = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end,
    );
    setCurrentSubtitle(activeSubtitle?.text || "");
  }, [currentTime, subtitles]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setError(null);
        })
        .catch((err) => {
          console.error("Play failed:", err);
          setError("Clique no botão de play para iniciar a reprodução");
          setIsPlaying(false);
        });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Progress tracking
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const current = audioRef.current.currentTime;
        setCurrentTime(current);
        const dur = audioRef.current.duration || 1;
        setProgress((current / dur) * 100);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime =
      (parseFloat(e.target.value) / 100) * (audioRef.current?.duration || 1);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border border-[#D8CFBE] rounded-2xl shadow-xs overflow-hidden relative">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={handleEnded} preload="metadata" />

      {/* Play Button - Fixed Position Left */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="absolute left-0 top-0 bottom-0 w-20 bg-[#005A1F] hover:bg-[#07614C] flex items-center justify-center z-20 transition-colors disabled:opacity-50"
      >
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={22} className="text-[#FDFAF4]" />
          ) : (
            <Play size={22} className="text-[#FDFAF4] ml-0.5" />
          )}
        </div>
      </button>

      {/* Main Content - Adjusted for Play Button */}
      <div className="pl-24 pr-5 py-5">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Info */}
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-0.5 bg-[#96551F]/15 text-[#96551F] text-[10px] uppercase tracking-widest font-bold rounded-full">
            {year}
          </span>
          <div className="flex items-center gap-1 text-[#6B6B63] text-xs">
            <Clock size={12} />
            <span>
              {isLoading ? "Carregando..." : formatTime(currentTime)} /{" "}
              {duration}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-[#005A1F] mb-1">
          {title}
        </h3>
        <p className="text-[#262B22]/80 font-serif italic text-sm">
          {description}
        </p>

        {/* Subtitles Display */}
        <AnimatePresence>
          {showSubtitles && currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="bg-[#FDFAF4] border border-[#D8CFBE] rounded-xl p-4">
                <p className="font-serif text-[#262B22] text-base leading-relaxed italic text-center">
                  {currentSubtitle}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-[#D8CFBE] cursor-pointer relative">
        <motion.div
          className="h-full bg-[#005A1F] cursor-pointer"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      {/* Controls Bar */}
      <div className="px-5 py-3 bg-[#FDFAF4] border-t border-[#D8CFBE]/60 flex items-center justify-between">
        {/* Waveform Visual */}
        <div className="flex items-center gap-0.5 h-8 flex-1 mr-4">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isPlaying ? 6 + Math.random() * 18 : 6,
              }}
              transition={{
                duration: 0.8,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.03,
              }}
              className={`w-0.5 rounded-full ${
                i / 40 <= progress / 100
                  ? isPlaying
                    ? "bg-[#005A1F]"
                    : "bg-[#07614C]"
                  : "bg-[#D8CFBE]"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {vttSrc && (
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors",
                showSubtitles
                  ? "bg-[#005A1F] text-[#FDFAF4]"
                  : "bg-white border border-[#D8CFBE] text-[#262B22] hover:bg-[#F1E9DB]",
              )}
            >
              <Subtitles size={13} />
              CC
            </button>
          )}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg border border-[#D8CFBE] bg-white text-[#262B22] hover:bg-[#F1E9DB] transition-colors"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AudioRecordings() {
  const { audioRecordings } = lauraPerlsContent;

  return (
    <section className="py-16 md:py-24 bg-[#F1E9DB]/60 border-t border-[#D8CFBE] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#96551F]/30" />
            <div className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center">
              <FileAudio size={20} className="text-[#005A1F]" />
            </div>
            <div className="h-px w-10 bg-[#96551F]/30" />
          </div>

          <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F] block mb-2">
            Arquivo de Fritz Perls
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight">
            Gravações{" "}
            <span className="italic text-[#96551F] font-light">Históricas</span>
          </h2>
          <p className="mt-4 text-[#262B22]/80 font-serif italic max-w-xl mx-auto">
            Gravações originais sobre a teoria da Gestalt. Clique no play para
            ouvir.
          </p>
        </div>

        {/* Main Audio Player with Subtitles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AudioPlayer
            src="/laura/audio/fritz-perls-gestalt-theory-1966.mp3"
            vttSrc="/laura/audio/laura-perls-pt.vtt"
            title="Fritz Perls - Gestalt Theory (1966)"
            duration="28:50"
            year={1966}
            description="Palestra histórica de Fritz Perls sobre a teoria da Gestalt. Legendas em português disponíveis."
          />
        </motion.div>

        {/* Other recordings */}
        <div className="space-y-6">
          {audioRecordings.slice(1).map((recording, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <div className="bg-white border border-[#D8CFBE] rounded-2xl shadow-xs p-6 opacity-85">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-0.5 bg-[#96551F]/15 text-[#96551F] text-[10px] uppercase tracking-widest font-bold rounded-full">
                    {recording.year}
                  </span>
                  <div className="flex items-center gap-1 text-[#6B6B63] text-xs">
                    <Clock size={12} />
                    <span>{recording.duration}</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#005A1F] mb-1">
                  {recording.title}
                </h3>
                <p className="text-[#262B22]/80 font-serif italic text-sm">
                  {recording.description}
                </p>
                <p className="text-xs text-[#96551F] mt-3 font-semibold">
                  Em breve - Legendas em português
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-10 p-5 bg-white border border-[#D8CFBE] border-l-4 border-l-[#96551F] rounded-2xl shadow-xs">
          <p className="text-[#262B22]/90 font-serif italic text-sm leading-relaxed">
            <strong className="not-italic font-sans font-bold text-[#96551F]">
              Nota:
            </strong>{" "}
            Estas gravações são de Fritz Perls, co-fundador da Gestalt-terapia.
            As legendas em português foram traduzidas para fins educacionais
            pelo Instituto Figura Viva.
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  FileAudio,
  Subtitles,
} from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadSubtitles = async () => {
      try {
        const response = await fetch(vttSrc);
        const vttContent = await response.text();
        const parsed = parseVTT(vttContent);
        setSubtitles(parsed);
      } catch (error) {
        console.error("Failed to load subtitles:", error);
      }
    };
    loadSubtitles();
  }, [vttSrc]);

  useEffect(() => {
    const activeSubtitle = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end,
    );
    setCurrentSubtitle(activeSubtitle?.text || "");
  }, [currentTime, subtitles]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          const current = audioRef.current.currentTime;
          setCurrentTime(current);
          const duration = audioRef.current.duration || 1;
          setProgress((current / duration) * 100);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
    <div className="bg-[#e8e4db] border border-[#b8ad96] rounded-lg shadow-md overflow-hidden relative">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const current = audioRef.current.currentTime;
            setCurrentTime(current);
            const dur = audioRef.current.duration || 1;
            setProgress((current / dur) * 100);
          }
        }}
      />

      {/* Play Button - Fixed Position Left */}
      <button
        onClick={togglePlay}
        className="absolute left-0 top-0 bottom-0 w-20 bg-[#4a3a2a] hover:bg-[#3a2f25] flex items-center justify-center z-20 transition-colors"
        style={{ borderRadius: "0.5rem 0 0 0.5rem" }}
      >
        <div className="w-12 h-12 rounded-full bg-[#d9d4c9] flex items-center justify-center shadow-lg">
          {isPlaying ? (
            <Pause size={24} className="text-[#4a3a2a]" />
          ) : (
            <Play size={24} className="text-[#4a3a2a] ml-1" />
          )}
        </div>
      </button>

      {/* Main Content - Adjusted for Play Button */}
      <div className="pl-24 pr-4 py-4">
        {/* Header Info */}
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

        {/* Title */}
        <h3 className="font-serif text-xl text-[#4a3a2a] mb-1">{title}</h3>
        <p className="text-[#5a4838] font-serif italic text-sm">
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
              <div className="bg-[#d9d4c9] border border-[#a88a4d]/30 rounded-lg p-4">
                <p className="font-serif text-[#3a2f25] text-base leading-relaxed italic text-center">
                  {currentSubtitle}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[#b8ad96] cursor-pointer relative">
        <motion.div
          className="h-full bg-[#a88a4d] cursor-pointer"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Controls Bar */}
      <div className="px-4 py-3 bg-[#d9d4c9] flex items-center justify-between">
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
                    ? "bg-[#a88a4d]"
                    : "bg-[#b8ad96]"
                  : "bg-[#e8e4db]"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`p-2 rounded-lg transition-colors ${
              showSubtitles
                ? "bg-[#a88a4d]/20 text-[#4a3a2a]"
                : "text-[#8a7a6a] hover:text-[#4a3a2a]"
            }`}
            title={showSubtitles ? "Ocultar legendas" : "Mostrar legendas"}
          >
            <Subtitles size={18} />
          </button>

          <button
            onClick={toggleMute}
            className="p-2 text-[#6a5a4a] hover:text-[#4a3a2a] transition-colors"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
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
            Palestra de Laura Perls sobre Gestalt. Ative as legendas para
            acompanhar em português.
          </p>
        </div>

        {/* Main Audio Player with Subtitles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <AudioPlayer
            src="/laura/audio/Fritz Laura Perls Videos Audios and Biography1.mp3"
            vttSrc="/laura/audio/laura-perls-pt.vtt"
            title="The Art of Contact - Palestra Completa"
            duration="28:50"
            year={1978}
            description="Palestra histórica de Laura Perls sobre a natureza do contato terapêutico na Gestalt. Legendas em português disponíveis."
          />
        </motion.div>

        {/* Other recordings (placeholder) */}
        <div className="space-y-6">
          {audioRecordings.slice(1).map((recording, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
            >
              <div className="bg-[#e8e4db] border border-[#b8ad96] rounded-lg shadow-md p-6 opacity-75">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-[#a88a4d]/20 text-[#6a5a4a] text-[10px] uppercase tracking-widest font-bold rounded-full">
                    {recording.year}
                  </span>
                  <div className="flex items-center gap-1 text-[#8a7a6a] text-xs">
                    <Clock size={12} />
                    <span>{recording.duration}</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#4a3a2a] mb-1">
                  {recording.title}
                </h3>
                <p className="text-[#5a4838] font-serif italic text-sm">
                  {recording.description}
                </p>
                <p className="text-xs text-[#8a7a6a] mt-3 italic">
                  Em breve - Legendas em português
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 p-6 bg-[#d9d4c9] border-l-4 border-[#a88a4d] rounded-r-sm">
          <p className="text-[#4a3a2a] font-serif italic text-sm">
            <strong className="not-italic">Nota:</strong> Esta gravação foi
            preservada pelo arquivo histórico do NYIGT. As legendas em português
            foram traduzidas para fins educacionais.
          </p>
        </div>
      </div>
    </section>
  );
}

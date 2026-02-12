"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LauraVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoUrl =
    "https://firebasestorage.googleapis.com/v0/b/lithe-transport-479116-m2.firebasestorage.app/o/public%2Flaura%2FLaura%20Perls%20in%20with%20Ilene%20Serlin.mp4?alt=media&token=a7a4568e-9bc4-4319-97b5-5c7295b7567e";

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time =
        (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  return (
    <section className="py-24 bg-[#d9d4c9] relative overflow-hidden border-t border-[#b8ad96]/30">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 border border-[#4a3a2a] rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 border border-[#4a3a2a] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#a88a4d]/60" />
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#8a7a6a]">
              Documento Audiovisual
            </span>
            <div className="h-px w-8 bg-[#a88a4d]/60" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#3a2f25] mb-4">
            Laura Perls em <span className="italic">Diálogo</span>
          </h2>
          <p className="text-[#6a5a4a] font-serif italic max-w-2xl mx-auto">
            Registro histórico de Laura Perls em conversa com Ilene Serlin. Um
            testemunho da presença, do suporte e da estética do contato.
          </p>
        </div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group rounded-sm overflow-hidden shadow-[20px_20px_60px_-15px_rgba(58,47,37,0.3)] border-8 border-[#e8e4db]"
          onMouseMove={handleMouseMove}
        >
          {/* Inner Golden Border */}
          <div className="absolute inset-0 border border-[#a88a4d]/30 pointer-events-none z-10" />

          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video bg-[#1a1510] object-contain cursor-pointer"
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
          />

          {/* Large Play Button Overlay */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20 pointer-events-none"
              >
                <div className="w-20 h-20 rounded-full bg-[#a88a4d] flex items-center justify-center shadow-2xl">
                  <Play size={32} className="text-white fill-current ml-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Controls */}
          <motion.div
            initial={false}
            animate={{
              opacity: showControls ? 1 : 0,
              y: showControls ? 0 : 20,
            }}
            className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30"
          >
            {/* Progress Bar */}
            <div className="relative h-1 mb-6 bg-white/20 rounded-full overflow-hidden group/progress">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#a88a4d]"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-[#a88a4d] transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <div className="flex items-center gap-3 group/volume">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-[#a88a4d] transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>

                <span className="text-white/80 text-[10px] tracking-widest font-mono hidden md:block">
                  {videoRef.current
                    ? `${Math.floor(videoRef.current.currentTime / 60)}:${Math.floor(
                        videoRef.current.currentTime % 60,
                      )
                        .toString()
                        .padStart(
                          2,
                          "0",
                        )} / ${Math.floor(videoRef.current.duration / 60)}:${Math.floor(
                        videoRef.current.duration % 60,
                      )
                        .toString()
                        .padStart(2, "0")}`
                    : "0:00 / 0:00"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-[#a88a4d] transition-colors"
                >
                  <Maximize2 size={20} />
                </button>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 rounded-sm"
                >
                  <ExternalLink size={12} />
                  Original
                </a>
              </div>
            </div>
          </motion.div>

          {/* Grain Effect Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')]" />
        </motion.div>

        {/* Caption Card */}
        <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="p-6 bg-[#e8e4db] border border-[#b8ad96] rounded-sm flex-1 shadow-sm">
            <h4 className="font-serif text-[#3a2f25] text-lg mb-2 italic">
              Sobre este vídeo
            </h4>
            <p className="text-[#5a4838] text-sm leading-relaxed">
              Este diálogo raramente visto captura a essência da abordagem de
              Laura Perls. Ao contrário das demonstrações teatrais de Fritz,
              Laura focava na micro-movimentação, no alinhamento e no suporte
              físico como fundamentos para o contato psicológico.
            </p>
          </div>

          <div className="md:w-64 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#a88a4d]/50 flex items-center justify-center text-[#a88a4d]">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="block text-[10px] text-[#8a7a6a] uppercase tracking-widest font-bold">
                  Áudio
                </span>
                <span className="text-xs text-[#4a3a2a] italic">
                  Inglês Original
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#a88a4d]/50 flex items-center justify-center text-[#a88a4d]">
                <Maximize2 size={18} />
              </div>
              <div>
                <span className="block text-[10px] text-[#8a7a6a] uppercase tracking-widest font-bold">
                  Resolução
                </span>
                <span className="text-xs text-[#4a3a2a] italic">
                  Arquivo Histórico
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

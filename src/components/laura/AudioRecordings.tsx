"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Clock } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function AudioRecordings() {
  const { audioRecordings } = lauraPerlsContent;
  const [playing, setPlaying] = useState<number | null>(null);
  const [progress, setProgress] = useState<number[]>([]);

  const formatTime = (timeStr: string) => {
    const [min, sec] = timeStr.split(":").map(Number);
    return `${min}m ${sec}s`;
  };

  return (
    <section className="py-24 bg-[#f5f2eb] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, #5c4a32 40px, #5c4a32 41px)`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <span className="w-10 h-10 rounded-full bg-[#5c4a32] flex items-center justify-center">
              <Volume2 size={20} className="text-[#f5f2eb]" />
            </span>
            <div className="h-px w-12 bg-[#c9a86c]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#a89080] block mb-4">
            Arquivo de Áudio
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a32] leading-tight">
            Vozes da{" "}
            <span className="italic text-[#8b6f4e] font-light">História</span>
          </h2>
          <p className="mt-6 text-[#6b5a45] font-serif italic max-w-xl mx-auto">
            Gravações históricas de Laura Perls capturando a essência de seu
            pensamento clínico
          </p>
        </div>

        {/* Audio Cards */}
        <div className="space-y-6">
          {audioRecordings.map((recording, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-[#faf8f3] border border-[#e8dfd1] rounded-lg shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden">
                {/* Play Button Overlay */}
                <div className="absolute inset-0 w-20 bg-[#5c4a32]/90 flex items-center justify-center z-20">
                  <button
                    onClick={() => setPlaying(playing === index ? null : index)}
                    className="w-16 h-16 rounded-full bg-[#f5f2eb] flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {playing === index ? (
                      <Pause size={28} className="text-[#5c4a32]" />
                    ) : (
                      <Play size={28} className="text-[#5c4a32] ml-1" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="pl-24 pr-6 py-6 pr-32">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-[#c9a86c]/20 text-[#8b6f4e] text-[10px] uppercase tracking-widest font-bold rounded-full">
                      {recording.year}
                    </span>
                    <div className="flex items-center gap-1 text-[#a89080] text-xs">
                      <Clock size={12} />
                      <span>{formatTime(recording.duration)}</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl text-[#5c4a32] mb-2">
                    {recording.title}
                  </h3>
                  <p className="text-[#6b5a45] font-serif italic">
                    {recording.description}
                  </p>
                </div>

                {/* Progress Bar (playing state) */}
                <AnimatePresence>
                  {playing === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 4 }}
                      exit={{ height: 0 }}
                      className="bg-[#c9a86c]/20 overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "35%" }}
                        transition={{ duration: 60, ease: "linear" }}
                        className="h-full bg-[#c9a86c]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Waveform Visual */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 h-12">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height:
                        playing === index ? [8, 24, 12, 32, 16, 28, 8] : 8,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: playing === index ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                    className={`w-0.5 rounded-full ${
                      playing === index ? "bg-[#c9a86c]" : "bg-[#d4c4a8]"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 p-6 bg-[#f0ebe0] border-l-4 border-[#c9a86c] rounded-r-sm">
          <p className="text-[#5c4a32] font-serif italic text-sm">
            <strong className="not-italic">Nota:</strong> Estas gravações foram
            preservadas pelo arquivo histórico do NYIGT e são disponibilizadas
            para fins educacionais. Agradecemos ao Gestalt Therapy Institute of
            New York pela autorização de uso.
          </p>
        </div>
      </div>
    </section>
  );
}

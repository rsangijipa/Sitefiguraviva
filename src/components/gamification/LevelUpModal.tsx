"use client";

import { Modal } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Award, Star, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: {
    slug: string;
    name: string;
    description: string;
    icon?: React.ReactNode;
  };
  level?: number;
  xpEarned?: number;
}

export function LevelUpModal({
  isOpen,
  onClose,
  badge,
  level,
  xpEarned,
}: LevelUpModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative overflow-hidden bg-white text-center pb-8 p-0 max-w-md mx-auto rounded-3xl">
        {/* Celebration Header */}
        <div className="bg-gradient-to-b from-yellow-100 to-white pt-10 pb-6 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20" />
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-4 relative z-10"
          >
            {badge?.icon || (
              <Award size={48} className="text-white drop-shadow-md" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-stone-800 font-serif">
              {badge ? "Nova Conquista!" : "Nível Alcançado!"}
            </h2>
            <p className="text-stone-500 font-medium">Você é incrível.</p>
          </motion.div>
        </div>

        {/* Content Body */}
        <div className="px-8 space-y-6">
          {badge && (
            <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl">
              <h3 className="font-bold text-yellow-800 text-lg mb-1">
                {badge.name}
              </h3>
              <p className="text-sm text-yellow-700/80 leading-relaxed">
                {badge.description}
              </p>
            </div>
          )}

          {xpEarned && (
            <div className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/5 py-2 px-4 rounded-full mx-auto w-fit">
              <Sparkles size={16} />
              <span>+{xpEarned} XP Ganho</span>
            </div>
          )}

          <Button
            variant="primary"
            onClick={onClose}
            className="w-full h-12 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30"
            rightIcon={<ChevronRight size={16} />}
          >
            Continuar Jornada
          </Button>

          <button
            onClick={() => {
              onClose();
              router.push("/profile");
            }}
            className="text-xs text-stone-400 font-bold uppercase tracking-widest hover:text-stone-600 transition-colors"
          >
            Ver Meu Perfil
          </button>
        </div>

        {/* Confetti Particles (CSS only for now) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-yellow-400"
              initial={{
                top: "50%",
                left: "50%",
                scale: 0,
              }}
              animate={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

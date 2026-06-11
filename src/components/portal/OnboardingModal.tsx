"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, BookOpen, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Basic passive onboarding logic: show once per device
    const checkOnboarding = () => {
      const hasSeen = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeen) {
        setIsOpen(true);
      }
    };
    // slight delay to let the dashboard render first before popping the modal
    const timer = setTimeout(checkOnboarding, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100"
          >
            {/* Header Art */}
            <div className="h-32 bg-stone-100 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-soft-md text-primary z-10">
                <Sparkles size={32} />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 md:px-10 pb-10 text-center">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-stone-500 hover:text-stone-800 transition-colors z-20"
                aria-label="Ignorar Tour"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-2xl md:text-3xl text-stone-800 mb-4 font-bold">
                Bem-vindo ao seu{" "}
                <span className="text-primary italic font-light">
                  Campus Digital
                </span>
              </h2>
              <p className="text-stone-600 mb-8 max-w-sm mx-auto">
                Preparamos um espaço de aprendizado contínuo para o seu
                desenvolvimento profissional.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <BookOpen className="text-primary mb-3" size={24} />
                  <h4 className="font-bold text-stone-800 text-sm mb-1">
                    Meus Cursos
                  </h4>
                  <p className="text-xs text-stone-500">
                    Acompanhe suas aulas e baixe materiais exclusivos.
                  </p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <Heart className="text-gold mb-3" size={24} />
                  <h4 className="font-bold text-stone-800 text-sm mb-1">
                    Recursos
                  </h4>
                  <p className="text-xs text-stone-500">
                    Cuide de si através da navegação mindful pelo nosso portal.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleClose}
                variant="primary"
                className="w-full"
              >
                Começar Jornada
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-[#4a3a2a] border-2 border-[#b8ad96] text-[#e8e4db] rounded-full flex items-center justify-center shadow-2xl hover:bg-[#3a2f25] hover:border-[#a88a4d] hover:scale-110 transition-all duration-500 group"
          aria-label="Voltar para o topo"
        >
          <ArrowUp
            size={22}
            className="group-hover:-translate-y-1 transition-transform duration-300"
          />

          {/* Decorative Ring */}
          <span className="absolute inset-0 rounded-full border border-[#a88a4d]/30 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

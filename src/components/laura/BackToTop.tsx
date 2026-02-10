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
          className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-[#141312] border border-stone-800 text-stone-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-[#c5a05b] hover:text-[#0d0c0b] hover:border-[#c5a05b] transition-all duration-300 group"
          aria-label="Voltar para o topo"
        >
          <ArrowUp
            size={20}
            className="group-hover:-translate-y-1 transition-transform duration-300"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

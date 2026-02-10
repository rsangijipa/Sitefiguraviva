"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

export function PWAInstallBanner() {
  const { isInstallAvailable, isInstalled, triggerInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if available, not installed, and not dismissed in this session
    if (isInstallAvailable && !isInstalled) {
      const isDismissed = sessionStorage.getItem("pwa_banner_dismissed");
      if (!isDismissed) {
        // Delay entrance for better UX
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallAvailable, isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa_banner_dismissed", "true");
  };

  const handleInstall = async () => {
    await triggerInstall();
    setIsVisible(false);
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 z-[90] max-w-sm"
        >
          <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 shadow-2xl rounded-3xl p-5 flex flex-col gap-4">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <Download className="text-primary" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-sm">
                  Instituto Figura Viva
                </h4>
                <p className="text-xs text-stone-500 leading-tight">
                  Instale nosso app para acesso rápido e modo offline.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleInstall}
              className="w-full h-10 rounded-xl font-bold uppercase tracking-wider text-[10px]"
            >
              Instalar Aplicativo
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-8 border border-amber-100 shadow-sm">
        <WifiOff size={48} className="text-amber-600" />
      </div>

      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-4">
        Você está desconectado
      </h1>

      <p className="text-stone-500 max-w-md mb-8 leading-relaxed">
        Não conseguimos carregar esta página porque você está sem conexão com a
        internet. Verifique seu Wi-Fi ou dados móveis.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button
          onClick={handleRefresh}
          className="flex-1"
          leftIcon={<RefreshCw size={18} />}
        >
          Tentar Novamente
        </Button>

        <Link href="/portal" className="flex-1">
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<Home size={18} />}
          >
            Ir para o Portal
          </Button>
        </Link>
      </div>

      <p className="mt-12 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
        Instituto Figura Viva • PWA Offline Mode
      </p>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RodaDasEmocoes Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFAF4] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-[#D8CFBE] p-8 rounded-3xl shadow-sm text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#005A1F]">
          Não foi possível carregar esta experiência.
        </h2>
        <p className="text-sm text-[#6B6B63]">
          Ocorreu um erro ao carregar a Roda das Emoções. Tente novamente.
        </p>
        <Button onClick={() => reset()} className="w-full">
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}

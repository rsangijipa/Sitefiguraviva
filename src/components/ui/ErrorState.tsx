"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorState({
  error,
  reset,
  title = "Algo deu errado",
  description,
}: ErrorStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <EmptyState
        icon={<AlertCircle size={32} className="text-error animate-pulse" />}
        title={title}
        description={
          description ||
          "Não foi possível carregar este conteúdo no momento. Tente novamente ou entre em contato com o suporte."
        }
        className="border-error/10 bg-white shadow-soft-xl shadow-error/5"
        action={
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={reset}
              variant="destructive"
              size="sm"
              className="shadow-lg shadow-error/20"
            >
              Tentar Novamente
            </Button>
            <p className="text-[10px] text-stone-300 font-mono tracking-widest uppercase">
              Ref: {error.digest?.slice(0, 8) || "UNKNOWN_ERROR"}
            </p>
          </div>
        }
      />
    </div>
  );
}

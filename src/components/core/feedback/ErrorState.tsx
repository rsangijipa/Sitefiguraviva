"use client";

import { AlertCircle, AlertTriangle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

type ErrorStateVariant = "surface" | "page";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
  className?: string;
  variant?: ErrorStateVariant;
  showDigest?: boolean;
}

const DEFAULT_DESCRIPTION =
  "Não foi possível carregar este conteúdo no momento. Tente novamente ou entre em contato com o suporte.";

export function ErrorState({
  title = "Algo deu errado",
  description = DEFAULT_DESCRIPTION,
  error,
  retry,
  reset,
  className,
  variant = "surface",
  showDigest = false,
}: ErrorStateProps) {
  const retryHandler = retry ?? reset;

  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[400px] p-8 text-center max-w-md mx-auto",
          className,
        )}
        role="alert"
      >
        <div
          className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500"
          aria-hidden="true"
        >
          <AlertTriangle size={32} />
        </div>

        <h3 className="font-serif text-2xl text-primary font-bold mb-3">
          {title}
        </h3>
        <p className="text-muted mb-8 leading-relaxed">{description}</p>

        {retryHandler && (
          <button
            type="button"
            onClick={retryHandler}
            className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <RefreshCcw size={18} aria-hidden="true" />
            Tentar Novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-center p-8",
        className,
      )}
      role="alert"
    >
      <EmptyState
        icon={AlertCircle}
        title={title}
        description={description}
        className="border-error/10 bg-white shadow-soft-xl shadow-error/5"
        action={
          <div className="flex flex-col items-center gap-4">
            {retryHandler && (
              <button
                type="button"
                onClick={retryHandler}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation active:scale-[0.98] bg-error text-white hover:bg-error/90 h-10 rounded-xl px-4 shadow-lg shadow-error/20"
              >
                Tentar Novamente
              </button>
            )}
            {showDigest && (
              <p className="text-[10px] text-stone-300 font-mono tracking-widest uppercase">
                Ref: {error?.digest?.slice(0, 8) || "UNKNOWN_ERROR"}
              </p>
            )}
          </div>
        }
      />
    </div>
  );
}

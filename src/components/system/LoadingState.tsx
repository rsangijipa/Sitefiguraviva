import Image from "next/image";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Carregando...",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700",
        fullScreen
          ? "fixed inset-0 z-50 bg-paper/80 backdrop-blur-sm"
          : "min-h-[50vh]",
        className,
      )}
    >
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping" />
        <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-gold/30 shadow-lg bg-white p-0.5">
          <Image
            src="/assets/logo.jpeg"
            alt="Loading..."
            fill
            className="object-cover rounded-full"
            sizes="64px"
          />
        </div>
      </div>
      <h3 className="text-xl font-serif text-primary font-bold tracking-wide animate-pulse">
        Figura <span className="text-gold italic font-light">Viva</span>
      </h3>
      <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
        {message}
      </p>
    </div>
  );
}

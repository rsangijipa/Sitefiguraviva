"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

export interface ResourceWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  scrollKey?: string;
}

const ResourceWindowScrollContext = createContext<() => void>(() => {});

export function useResourceWindowScrollReset() {
  return useContext(ResourceWindowScrollContext);
}

export function ResourceWindow({
  isOpen,
  title,
  onClose,
  children,
  className = "",
  scrollKey,
}: ResourceWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resetScroll = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    resetScroll();
  }, [resetScroll, scrollKey]);

  if (!isOpen) return null;

  return (
    <div
      className={`relative flex flex-1 flex-col min-h-0 w-full overflow-hidden rounded-[2rem] border border-white/85 bg-paper shadow-[0_28px_90px_rgba(30,25,20,0.35)] max-sm:rounded-none max-sm:border-0 ${className}`}
      role="region"
      aria-label={title}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={`Fechar ${title}`}
        className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-sm transition hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <X size={18} aria-hidden="true" />
      </button>

      {/* Scrollable Content Container */}
      <ResourceWindowScrollContext.Provider value={resetScroll}>
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-8 pt-14"
          data-lenis-prevent
        >
          {children}
        </div>
      </ResourceWindowScrollContext.Provider>
    </div>
  );
}

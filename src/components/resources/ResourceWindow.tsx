"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export interface ResourceWindowProps {
  isOpen: boolean;
  title: string;
  /** Kept optional for compatibility; closing is owned by ResourceExperience. */
  onClose?: () => void;
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
      {/* Scrollable Content Container */}
      <ResourceWindowScrollContext.Provider value={resetScroll}>
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-8"
          data-lenis-prevent
        >
          {children}
        </div>
      </ResourceWindowScrollContext.Provider>
    </div>
  );
}

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
      className={`relative flex flex-1 flex-col min-h-0 w-full overflow-hidden bg-paper ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Scrollable Content Container */}
      <ResourceWindowScrollContext.Provider value={resetScroll}>
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
          data-lenis-prevent
        >
          {children}
        </div>
      </ResourceWindowScrollContext.Provider>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

export function useRiverLoop(
  running: boolean,
  onFrame: (deltaMs: number) => void,
) {
  const callbackRef = useRef(onFrame);

  useEffect(() => {
    callbackRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      callbackRef.current(Math.min(1000, now - previous));
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
}

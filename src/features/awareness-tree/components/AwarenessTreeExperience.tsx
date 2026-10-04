"use client";

import { useEffect, useState } from "react";

import { AwarenessTreeFallback } from "@/features/awareness-tree/components/AwarenessTreeFallback";
import { ExperienceRoot } from "@/features/awareness-tree/components/experience/ExperienceRoot";

export interface AwarenessTreeExperienceProps {
  supportsWebGL?: boolean;
}

function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function AwarenessTreeExperience({
  supportsWebGL,
}: AwarenessTreeExperienceProps) {
  const [canRenderScene, setCanRenderScene] = useState(supportsWebGL ?? false);

  useEffect(() => {
    if (supportsWebGL === undefined) {
      setCanRenderScene(detectWebGLSupport());
    }
  }, [supportsWebGL]);

  if (!canRenderScene) {
    return <AwarenessTreeFallback />;
  }

  return <ExperienceRoot />;
}

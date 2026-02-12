"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

export default function ParticlesLayer() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = {
    fpsLimit: 60,
    particles: {
      color: {
        value: "#b08d55",
      },
      move: {
        direction: "top",
        enable: true,
        outModes: {
          default: "out",
        },
        random: true,
        speed: 0.4,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 30,
      },
      opacity: {
        value: { min: 0.1, max: 0.3 },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
    fullScreen: { enable: false },
  };

  if (!init) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Particles id="tsparticles" options={options} className="h-full w-full" />
    </div>
  );
}

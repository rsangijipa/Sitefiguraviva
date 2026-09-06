"use client";

import React from "react";

export default function BackgroundEngine() {
  const isCinematic = process.env.NEXT_PUBLIC_VISUAL_MODE === "cinematic";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Aurora Layer */}
      <div className="fx-aurora" />

      {/* Manchas de atmosfera. Antes eram dois `motion.div` percorrendo um
          caminho de 20–25 s em laço infinito; com 100–120 px de blur e 5% de
          opacidade o deslocamento não era perceptível, mas o repintar era. */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full" />

      {/* Watercolor Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply fx-watercolor pointer-events-none" />

      {/* Cinematic Grain (Global in body usually, but can be here too) */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Light Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/20 to-paper pointer-events-none" />
    </div>
  );
}
